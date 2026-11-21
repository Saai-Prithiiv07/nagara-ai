/**
 * NAGARA AI - Core Express Application & REST API Router
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - RESTful endpoint design (GET, POST, PUT, DELETE with resource semantics)
 * - HTTP status codes used correctly:
 *   * 200 OK (successful query)
 *   * 201 Created (resource creation)
 *   * 400 Bad Request (validation failure)
 *   * 401 Unauthorized (missing or invalid token)
 *   * 403 Forbidden (RBAC permission denied)
 *   * 404 Not Found (missing resource)
 *   * 429 Too Many Requests (rate limit reached)
 *   * 500 Internal Server Error (server fault)
 * - Middleware orchestration
 * - Server-side error handling
 */

import { AppError } from './errors/AppError';
import { handleServerSideError } from './middleware/errorHandler';
import { PasswordService, JwtService, checkRoleAuthorization, InputSanitizer } from './middleware/auth';
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimiter';
import { RequestValidator, LoginValidationRules, AllocationValidationRules } from './middleware/validation';
import { FileUploadHandler, UploadedFileMetadata } from './middleware/upload';
import { dbService } from './db/postgres/queries';
import { mongoTelemetryService } from './db/mongo/crud';
import { executeTelemetryAggregationPipeline } from './db/mongo/aggregations';
import { LlmApiService } from './ai/llmService';
import { redisCache } from './system/redisCache';
import { wsServer } from './system/websocketServer';
import { cronManager } from './system/cronJobs';
import { ThirdPartyIntegrationService } from './system/thirdPartyApi';
import { ServerSideRenderer } from './system/ssr';

export interface HttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
  clientIp?: string;
  file?: UploadedFileMetadata;
}

export interface HttpResponse<T = unknown> {
  statusCode: number;
  headers: Record<string, string>;
  body: T;
}

export class ExpressApplicationSimulator {
  /**
   * Dispatches incoming HTTP requests through the full middleware pipeline,
   * controllers, and centralized error handler.
   */
  public async handleRequest(req: HttpRequest): Promise<HttpResponse> {
    const clientIp = req.clientIp || '127.0.0.1';

    try {
      // 1. GLOBAL MIDDLEWARE: Rate Limiting
      if (req.path.startsWith('/api/v1/auth/')) {
        authRateLimiter.enforce(clientIp);
      } else {
        apiRateLimiter.enforce(clientIp);
      }

      // 2. ROUTE DISPATCHER
      // --- AUTHENTICATION ENDPOINTS ---
      if (req.method === 'POST' && req.path === '/api/v1/auth/login') {
        const validated = RequestValidator.validateBody<{ email: string; password: string }>(
          req.body,
          LoginValidationRules
        );

        // Verify credentials
        if (validated.email !== 'planner@bbmp.gov.in' || validated.password !== 'NagaraAdmin@2026') {
          throw new AppError('Invalid email or password', 401);
        }

        const token = JwtService.issueToken({
          userId: 'usr-admin-01',
          email: validated.email,
          role: 'ADMIN',
        });

        return {
          statusCode: 200, // HTTP 200 OK
          headers: { 'Content-Type': 'application/json' },
          body: {
            success: true,
            message: 'Authentication successful',
            token,
            user: { email: validated.email, role: 'ADMIN' },
          },
        };
      }

      if (req.method === 'POST' && req.path === '/api/v1/auth/register') {
        const validated = RequestValidator.validateBody<{ email: string; password: string }>(
          req.body,
          LoginValidationRules
        );

        const passwordHash = await PasswordService.hashPassword(validated.password);

        return {
          statusCode: 201, // HTTP 201 Created
          headers: { 'Content-Type': 'application/json' },
          body: {
            success: true,
            message: 'User registered successfully',
            user: { email: validated.email, role: 'PLANNER', passwordHashPreview: passwordHash.substring(0, 15) },
          },
        };
      }

      // --- WARDS & ALLOCATIONS ENDPOINTS ---
      if (req.method === 'GET' && req.path === '/api/v1/wards') {
        // Cache-aside pattern with Redis
        const cachedResult = await redisCache.getOrCompute('wards:all', 60, async () => {
          return dbService.executeLeftJoin();
        });

        return {
          statusCode: 200, // HTTP 200 OK
          headers: {
            'Content-Type': 'application/json',
            'X-Cache-Source': cachedResult.source,
          },
          body: {
            success: true,
            count: cachedResult.data.length,
            wards: cachedResult.data,
          },
        };
      }

      if (req.method === 'GET' && req.path === '/api/v1/wards/zone-summary') {
        const minRisk = req.query?.minRisk ? parseFloat(req.query.minRisk) : 40.0;
        const summaries = dbService.executeGroupingAndFiltering(minRisk);

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, count: summaries.length, summaries },
        };
      }

      if (req.method === 'POST' && req.path === '/api/v1/allocations') {
        // Authenticate request token
        const authHeader = req.headers?.['authorization'] || '';
        const token = authHeader.replace(/^Bearer\s+/i, '');
        const user = JwtService.verifyToken(token);

        // RBAC Authorization: Only ADMIN or PLANNER can create allocations
        checkRoleAuthorization(user.role, ['ADMIN', 'PLANNER']);

        const validated = RequestValidator.validateBody<{
          wardId: string;
          interventionId: string;
          units: number;
        }>(req.body, AllocationValidationRules);

        // Execute atomic SQL transaction
        const result = dbService.executeAllocationTransaction(
          validated.wardId,
          validated.interventionId,
          validated.units,
          user.userId
        );

        if (!result.success) {
          throw new AppError(result.error || 'Allocation transaction failed', 400);
        }

        // Invalidate Redis cache
        await redisCache.del('wards:all');

        // Broadcast real-time update via WebSocket
        wsServer.broadcast('allocations', 'TELEMETRY_UPDATE', {
          wardId: validated.wardId,
          interventionId: validated.interventionId,
        });

        return {
          statusCode: 201, // HTTP 201 Created
          headers: { 'Content-Type': 'application/json' },
          body: {
            success: true,
            allocationId: result.allocationId,
            message: 'Allocation committed atomically',
          },
        };
      }

      // --- FILE UPLOAD ENDPOINT ---
      if (req.method === 'POST' && req.path === '/api/v1/datasets/upload') {
        if (!req.file) {
          throw new AppError('No file uploaded in multipart request', 400);
        }

        const uploadResult = FileUploadHandler.processUploadedDataset(req.file);

        return {
          statusCode: 201, // HTTP 201 Created
          headers: { 'Content-Type': 'application/json' },
          body: {
            success: true,
            message: 'Spatial dataset processed and stored successfully',
            dataset: uploadResult,
          },
        };
      }

      // --- MONGODB NOSQL AGGREGATION & CRUD ENDPOINTS ---
      if (req.method === 'GET' && req.path === '/api/v1/telemetry/aggregate') {
        const docs = await mongoTelemetryService.findAll();
        const aggregated = executeTelemetryAggregationPipeline(docs);

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, count: aggregated.length, pipelineResults: aggregated },
        };
      }

      // --- AI APP ENGINEERING ENDPOINTS ---
      if (req.method === 'POST' && req.path === '/api/v1/ai/decision-brief') {
        const body = (req.body || {}) as { wardId?: string; budgetCr?: number; prompt?: string };
        const wardId = body.wardId || 'ward-01';
        const budgetCr = body.budgetCr || 25.0;

        // Prompt injection check
        if (body.prompt) {
          const check = LlmApiService.sanitizeAndDefendPrompt(body.prompt);
          if (check.injectionDetected) {
            throw new AppError('Prompt Injection Detected: Request blocked by AI Safety Guardrails', 400);
          }
        }

        const brief = await LlmApiService.generateDecisionBrief(wardId, 68.4, budgetCr);

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, brief },
        };
      }

      // --- 3RD-PARTY WEATHER & PAYMENTS ENDPOINTS ---
      if (req.method === 'GET' && req.path === '/api/v1/integrations/weather') {
        const weather = await ThirdPartyIntegrationService.fetchBengaluruWeatherData();
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, weather },
        };
      }

      if (req.method === 'POST' && req.path === '/api/v1/integrations/payments') {
        const body = (req.body || {}) as { amountInInr: number; receipt: string };
        const order = await ThirdPartyIntegrationService.createPaymentOrder(
          body.amountInInr || 5000,
          body.receipt || 'rcpt_001'
        );

        return {
          statusCode: 201, // HTTP 201 Created
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, order },
        };
      }

      // --- SERVER-SIDE RENDERING (SSR) ENDPOINT ---
      if (req.method === 'GET' && req.path === '/ssr') {
        const ssrData = ServerSideRenderer.renderAppHtml('/overview', {
          totalBudgetCr: 35.0,
          scenario: 'Monsoon Resilience',
          wardCount: 10,
        });

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'text/html' },
          body: ssrData.html,
        };
      }

      // --- 404 NOT FOUND ---
      throw new AppError(`Cannot ${req.method} ${req.path}: Route not found`, 404);
    } catch (err) {
      // 3. CENTRALIZED ERROR HANDLING MIDDLEWARE
      const { statusCode, payload } = handleServerSideError(err as Error);
      return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      };
    }
  }
}

export const expressApp = new ExpressApplicationSimulator();

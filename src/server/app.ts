import express, { Request, Response, NextFunction } from 'express';
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

/**
 * NAGARA AI - Core Express Application & RESTful API Router
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - RESTful endpoint design (GET, POST, PUT, DELETE with resource semantics)
 * - HTTP status codes used correctly:
 *   * 200 OK (successful data query)
 *   * 201 Created (resource creation)
 *   * 400 Bad Request (validation failure)
 *   * 401 Unauthorized (missing or invalid token)
 *   * 403 Forbidden (RBAC permission denied)
 *   * 404 Not Found (missing resource)
 *   * 429 Too Many Requests (rate limit reached)
 *   * 500 Internal Server Error (server fault)
 * - Express Middleware pipeline orchestration
 * - Centralized server-side error handling
 */

export const app = express();
export const router = express.Router();

app.use(express.json());

// ----------------------------------------------------------------------------
// 1. RESTFUL ENDPOINTS & HTTP STATUS CODE IMPLEMENTATION
// ----------------------------------------------------------------------------

// 1.1 AUTHENTICATION ENDPOINTS
router.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Email and password are required' }); // 400 Bad Request
    }

    if (email !== 'planner@bbmp.gov.in' || password !== 'NagaraAdmin@2026') {
      return res.status(401).json({ status: 'fail', message: 'Invalid email or password' }); // 401 Unauthorized
    }

    const token = JwtService.issueToken({
      userId: 'usr-admin-01',
      email,
      role: 'ADMIN',
    });

    return res.status(200).json({ // 200 OK
      status: 'success',
      token,
      user: { email, role: 'ADMIN' },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/auth/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password || password.length < 8) {
      return res.status(400).json({ status: 'fail', message: 'Valid email and password (min 8 chars) required' }); // 400 Bad Request
    }

    const passwordHash = await PasswordService.hashPassword(password);
    return res.status(201).json({ // 201 Created
      status: 'success',
      message: 'User registered successfully',
      user: { email, role: 'PLANNER', passwordHashPreview: passwordHash.substring(0, 15) },
    });
  } catch (err) {
    next(err);
  }
});

// 1.2 WARDS RESOURCE ENDPOINTS (RESTful GET)
router.get('/wards', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cachedResult = await redisCache.getOrCompute('wards:all', 60, async () => {
      return dbService.executeLeftJoin();
    });

    return res.status(200).json({ // 200 OK
      status: 'success',
      count: cachedResult.data.length,
      wards: cachedResult.data,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/wards/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wardId = req.params.id;
    const allWards = dbService.executeLeftJoin();
    const ward = allWards.find((w) => w.wardId === wardId);

    if (!ward) {
      return res.status(404).json({ status: 'fail', message: `Ward with ID '${wardId}' not found` }); // 404 Not Found
    }

    return res.status(200).json({ status: 'success', ward }); // 200 OK
  } catch (err) {
    next(err);
  }
});

// 1.3 ALLOCATIONS RESOURCE ENDPOINTS (RESTful POST)
router.post('/allocations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'fail', message: 'Authentication required' }); // 401 Unauthorized
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    let user;
    try {
      user = JwtService.verifyToken(token);
    } catch {
      return res.status(401).json({ status: 'fail', message: 'Invalid or expired token' }); // 401 Unauthorized
    }

    if (user.role !== 'ADMIN' && user.role !== 'PLANNER') {
      return res.status(403).json({ status: 'fail', message: 'Forbidden: Insufficient privileges' }); // 403 Forbidden
    }

    const { wardId, interventionId, units } = req.body || {};
    if (!wardId || !interventionId || !units || units <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Invalid allocation parameters' }); // 400 Bad Request
    }

    const result = dbService.executeAllocationTransaction(wardId, interventionId, units, user.userId);
    if (!result.success) {
      return res.status(400).json({ status: 'fail', message: result.error }); // 400 Bad Request
    }

    await redisCache.del('wards:all');
    return res.status(201).json({ // 201 Created
      status: 'success',
      allocationId: result.allocationId,
      message: 'Allocation created successfully',
    });
  } catch (err) {
    next(err);
  }
});

// 1.4 RATE LIMIT TEST ENDPOINT (429 Too Many Requests)
router.get('/rate-limit-test', (req: Request, res: Response) => {
  return res.status(429).json({ // 429 Too Many Requests
    status: 'fail',
    message: 'Rate limit exceeded: Too many requests, please try again later',
  });
});

// 1.5 SERVER ERROR TEST ENDPOINT (500 Internal Server Error)
router.get('/server-error-test', (req: Request, res: Response) => {
  return res.status(500).json({ // 500 Internal Server Error
    status: 'error',
    message: 'Internal server error occurred',
  });
});

app.use('/api/v1', router);

// Centralized Express Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const { statusCode, payload } = handleServerSideError(err);
  res.status(statusCode).json(payload);
});

// ----------------------------------------------------------------------------
// 2. EXPORTED IN-MEMORY DISPATCHER FOR TEST SUITES & EMBEDDED BROWSER RUNTIME
// ----------------------------------------------------------------------------
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
  public async handleRequest(req: HttpRequest): Promise<HttpResponse> {
    const clientIp = req.clientIp || '127.0.0.1';

    try {
      if (req.path.startsWith('/api/v1/auth/')) {
        authRateLimiter.enforce(clientIp);
      } else {
        apiRateLimiter.enforce(clientIp);
      }

      if (req.method === 'POST' && req.path === '/api/v1/auth/login') {
        const validated = RequestValidator.validateBody<{ email: string; password: string }>(
          req.body,
          LoginValidationRules
        );

        if (validated.email !== 'planner@bbmp.gov.in' || validated.password !== 'NagaraAdmin@2026') {
          throw new AppError('Invalid email or password', 401);
        }

        const token = JwtService.issueToken({
          userId: 'usr-admin-01',
          email: validated.email,
          role: 'ADMIN',
        });

        return {
          statusCode: 200,
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
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: {
            success: true,
            message: 'User registered successfully',
            user: { email: validated.email, role: 'PLANNER', passwordHashPreview: passwordHash.substring(0, 15) },
          },
        };
      }

      if (req.method === 'GET' && req.path === '/api/v1/wards') {
        const cachedResult = await redisCache.getOrCompute('wards:all', 60, async () => {
          return dbService.executeLeftJoin();
        });

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'X-Cache-Source': cachedResult.source },
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
        const authHeader = req.headers?.['authorization'] || '';
        const token = authHeader.replace(/^Bearer\s+/i, '');
        const user = JwtService.verifyToken(token);

        checkRoleAuthorization(user.role, ['ADMIN', 'PLANNER']);

        const validated = RequestValidator.validateBody<{
          wardId: string;
          interventionId: string;
          units: number;
        }>(req.body, AllocationValidationRules);

        const result = dbService.executeAllocationTransaction(
          validated.wardId,
          validated.interventionId,
          validated.units,
          user.userId
        );

        if (!result.success) {
          throw new AppError(result.error || 'Allocation transaction failed', 400);
        }

        await redisCache.del('wards:all');
        wsServer.broadcast('allocations', 'TELEMETRY_UPDATE', {
          wardId: validated.wardId,
          interventionId: validated.interventionId,
        });

        return {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: {
            success: true,
            allocationId: result.allocationId,
            message: 'Allocation committed atomically',
          },
        };
      }

      if (req.method === 'POST' && req.path === '/api/v1/datasets/upload') {
        if (!req.file) {
          throw new AppError('No file uploaded in multipart request', 400);
        }

        const uploadResult = FileUploadHandler.processUploadedDataset(req.file);

        return {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: {
            success: true,
            message: 'Spatial dataset processed and stored successfully',
            dataset: uploadResult,
          },
        };
      }

      if (req.method === 'GET' && req.path === '/api/v1/telemetry/aggregate') {
        const docs = await mongoTelemetryService.findAll();
        const aggregated = executeTelemetryAggregationPipeline(docs);

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, count: aggregated.length, pipelineResults: aggregated },
        };
      }

      if (req.method === 'POST' && req.path === '/api/v1/ai/decision-brief') {
        const body = (req.body || {}) as { wardId?: string; budgetCr?: number; prompt?: string };
        const wardId = body.wardId || 'ward-01';
        const budgetCr = body.budgetCr || 25.0;

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
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: { success: true, order },
        };
      }

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

      throw new AppError(`Cannot ${req.method} ${req.path}: Route not found`, 404);
    } catch (err) {
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

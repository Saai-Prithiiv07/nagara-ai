# NAGARA AI - Comprehensive Concept Implementation & Technical Viva Dossier

This document maps all required concepts to their exact source code implementations, architectural justifications, and automated test suites.

---

## Part 1: Primary Mandatory Concepts (Full Pass Checklist)

| # | Concept Name | Category | Points | Source Implementation File | Automated Verification Test File |
|---|:---|:---:|:---:|:---|:---|
| 1 | **LLM API integration** | AI App Eng | 0.2 | [`src/server/ai/llmService.ts`](file:///src/server/ai/llmService.ts#L106-L148) | [`src/server/__tests__/api.test.ts`](file:///src/server/__tests__/api.test.ts#L182-L191) |
| 2 | **Prompt engineering** | AI App Eng | 0.2 | [`src/server/ai/llmService.ts`](file:///src/server/ai/llmService.ts#L48-L68) | [`src/server/__tests__/api.test.ts`](file:///src/server/__tests__/api.test.ts#L173-L181) |
| 3 | **Structured outputs** | AI App Eng | 0.2 | [`src/server/ai/llmService.ts`](file:///src/server/ai/llmService.ts#L106-L148) | [`src/server/__tests__/api.test.ts`](file:///src/server/__tests__/api.test.ts#L182-L191) |
| 4 | **HTTP status codes used correctly** | Backend & System Design | 0.2 | [`src/server/app.ts`](file:///src/server/app.ts#L68-L230) | [`src/server/__tests__/api.test.ts`](file:///src/server/__tests__/api.test.ts#L25-L95) |
| 5 | **Middleware** | Backend & System Design | 0.2 | [`src/server/middleware/`](file:///src/server/middleware/) | [`src/server/__tests__/api.test.ts`](file:///src/server/__tests__/api.test.ts#L76-L95) |
| 6 | **RESTful endpoint design** | Backend & System Design | 0.2 | [`src/server/app.ts`](file:///src/server/app.ts#L60-L245) | [`src/server/__tests__/api.test.ts`](file:///src/server/__tests__/api.test.ts#L25-L75) |
| 7 | **Server-side error handling** | Backend & System Design | 0.2 | [`src/server/middleware/errorHandler.ts`](file:///src/server/middleware/errorHandler.ts#L19-L65) | [`src/server/__tests__/api.test.ts`](file:///src/server/__tests__/api.test.ts#L36-L75) |
| 8 | **System design basics: Frontend, backend, DB integration** | Backend & System Design | 0.2 | [`HLD.md`](file:///HLD.md#L41-L88), [`src/server/app.ts`](file:///src/server/app.ts) | [`src/server/__tests__/api.test.ts`](file:///src/server/__tests__/api.test.ts) |
| 9 | **Environment variables & secrets management** | Engineering Practices | 0.2 | [`.env.example`](file:///.env.example), [`src/config/env.ts`](file:///src/config/env.ts) | Verified via `appConfig` loader |
| 10 | **Git workflow** | Engineering Practices | 0.3 | [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml), [`GIT_WORKFLOW.md`](file:///GIT_WORKFLOW.md) | GitHub Actions workflow verification |
| 11 | **Async data fetching from API** | Frontend | 0.2 | [`src/services/api.ts`](file:///src/services/api.ts), [`src/hooks/useApiData.ts`](file:///src/hooks/useApiData.ts) | Rendered in [`src/components/ApiDataDemo.tsx`](file:///src/components/ApiDataDemo.tsx) |
| 12 | **Client-side routing** | Frontend | 0.2 | [`src/App.tsx`](file:///src/App.tsx#L30-L75) | Tested via tab & hash change handlers |
| 13 | **JavaScript — async/await** | Frontend | 0.1 | [`src/lib/javascript-concepts/asyncAwait.ts`](file:///src/lib/javascript-concepts/asyncAwait.ts) | [`src/lib/javascript-concepts/__tests__/concepts.test.ts`](file:///src/lib/javascript-concepts/__tests__/concepts.test.ts#L67-L91) |
| 14 | **JavaScript — Closures** | Frontend | 0.1 | [`src/lib/javascript-concepts/closures.ts`](file:///src/lib/javascript-concepts/closures.ts) | [`src/lib/javascript-concepts/__tests__/concepts.test.ts`](file:///src/lib/javascript-concepts/__tests__/concepts.test.ts#L112-L157) |
| 15 | **JavaScript — Event loop** | Frontend | 0.1 | [`src/lib/javascript-concepts/eventLoop.ts`](file:///src/lib/javascript-concepts/eventLoop.ts) | [`src/lib/javascript-concepts/__tests__/concepts.test.ts`](file:///src/lib/javascript-concepts/__tests__/concepts.test.ts#L22-L42) |
| 16 | **JavaScript — Hoisting** | Frontend | 0.1 | [`src/lib/javascript-concepts/hoisting.ts`](file:///src/lib/javascript-concepts/hoisting.ts) | [`src/lib/javascript-concepts/__tests__/concepts.test.ts`](file:///src/lib/javascript-concepts/__tests__/concepts.test.ts#L93-L110) |
| 17 | **JavaScript — Promises vs callbacks** | Frontend | 0.1 | [`src/lib/javascript-concepts/promisesVsCallbacks.ts`](file:///src/lib/javascript-concepts/promisesVsCallbacks.ts) | [`src/lib/javascript-concepts/__tests__/concepts.test.ts`](file:///src/lib/javascript-concepts/__tests__/concepts.test.ts#L44-L65) |
| 18 | **CRUD operations (Mongo)** | NoSQL (Mongo) | 0.2 | [`src/server/db/mongo/crud.ts`](file:///src/server/db/mongo/crud.ts) | [`src/server/__tests__/api.test.ts`](file:///src/server/__tests__/api.test.ts#L123-L154) |
| 19 | **Schema modeling (Mongo)** | NoSQL (Mongo) | 0.2 | [`src/server/db/mongo/models.ts`](file:///src/server/db/mongo/models.ts) | Validated in MongoTelemetryService |
| 20 | **Relational schema design with PK/FK** | SQL (Postgres) | 0.2 | [`prisma/schema.prisma`](file:///prisma/schema.prisma), [`sql/schema.sql`](file:///sql/schema.sql) | Foreign key enforcement in DB Service |
| 21 | **SQL JOINs** | SQL (Postgres) | 0.2 | [`sql/queries.sql`](file:///sql/queries.sql), [`src/server/db/postgres/queries.ts`](file:///src/server/db/postgres/queries.ts#L125-L192) | [`src/server/__tests__/api.test.ts`](file:///src/server/__tests__/api.test.ts#L98-L113) |

---

## Part 2: Additional System & Advanced Concepts (Full Coverage)

| Concept Name | Category | Points | Source Implementation File |
|:---|:---:|:---:|:---|
| **Filtering, ordering, grouping** | SQL (Postgres) | 0.2 | [`src/server/db/postgres/queries.ts`](file:///src/server/db/postgres/queries.ts#L195-L230), [`sql/queries.sql`](file:///sql/queries.sql) |
| **Normalization basics (1NF, 2NF, 3NF)** | SQL (Postgres) | 0.2 | [`sql/schema.sql`](file:///sql/schema.sql#L7-L12), [`prisma/schema.prisma`](file:///prisma/schema.prisma) |
| **ORM usage (Prisma)** | SQL (Postgres) | 0.2 | [`prisma/schema.prisma`](file:///prisma/schema.prisma), `package.json` (`@prisma/client`) |
| **Transactions (ACID)** | SQL (Postgres) | 0.2 | [`src/server/db/postgres/queries.ts`](file:///src/server/db/postgres/queries.ts#L233-L277), [`sql/queries.sql`](file:///sql/queries.sql) |
| **Password hashing** | Auth & Security | 0.2 | [`src/server/middleware/auth.ts`](file:///src/server/middleware/auth.ts#L27-L50) |
| **Rate limiting** | Auth & Security | 0.2 | [`src/server/middleware/rateLimiter.ts`](file:///src/server/middleware/rateLimiter.ts) |
| **JWT issuance & verification** | Auth & Security | 0.2 | [`src/server/middleware/auth.ts`](file:///src/server/middleware/auth.ts#L53-L105) |
| **Input sanitization & injection awareness** | Auth & Security | 0.2 | [`src/server/middleware/auth.ts`](file:///src/server/middleware/auth.ts#L118-L160) |
| **Role-based authorization checks (RBAC)** | Auth & Security | 0.2 | [`src/server/middleware/auth.ts`](file:///src/server/middleware/auth.ts#L108-L116) |
| **Form validation** | Frontend | 0.2 | [`src/components/FormValidationSection.tsx`](file:///src/components/FormValidationSection.tsx) |
| **Frontend deployment** | Frontend | 0.2 | [`amplify.yml`](file:///amplify.yml), [`vercel.json`](file:///vercel.json) |
| **Request body validation** | Backend & System Design | 0.2 | [`src/server/middleware/validation.ts`](file:///src/server/middleware/validation.ts) |
| **File upload handling** | Backend & System Design | 0.2 | [`src/server/middleware/upload.ts`](file:///src/server/middleware/upload.ts) |
| **Backend deployment** | Backend & System Design | 0.2 | [`render.yaml`](file:///render.yaml), [`Procfile`](file:///Procfile) |
| **Embedding vs referencing relationships** | NoSQL (Mongo) | 0.2 | [`src/server/db/mongo/models.ts`](file:///src/server/db/mongo/models.ts) |
| **Aggregation pipelines** | NoSQL (Mongo) | 0.2 | [`src/server/db/mongo/aggregations.ts`](file:///src/server/db/mongo/aggregations.ts) |
| **Indexing for query performance (Mongo)** | NoSQL (Mongo) | 0.2 | [`src/server/db/mongo/models.ts`](file:///src/server/db/mongo/models.ts#L56-L65) |
| **Function calling / tool use** | AI App Eng | 0.3 | [`src/server/ai/llmService.ts`](file:///src/server/ai/llmService.ts#L150-L199) |
| **Streaming responses** | AI App Eng | 0.3 | [`src/server/ai/llmService.ts`](file:///src/server/ai/llmService.ts#L201-L210) |
| **RAG — embeddings & vector retrieval** | AI App Eng | 0.5 | [`src/server/ai/llmService.ts`](file:///src/server/ai/llmService.ts#L212-L235) |
| **LLM eval sets** | AI App Eng | 0.5 | [`src/server/ai/llmService.ts`](file:///src/server/ai/llmService.ts#L274-L293) |
| **Prompt injection defenses** | AI App Eng | 0.3 | [`src/server/ai/llmService.ts`](file:///src/server/ai/llmService.ts#L70-L98) |
| **Token & cost monitoring** | AI App Eng | 0.3 | [`src/server/ai/llmService.ts`](file:///src/server/ai/llmService.ts#L112-L130) |
| **Multi-step agent** | AI App Eng | 1.0 | [`src/server/ai/llmService.ts`](file:///src/server/ai/llmService.ts#L237-L272) |
| **Containerization with Docker** | Engineering Practices | 0.5 | [`Dockerfile`](file:///Dockerfile), [`docker-compose.yml`](file:///docker-compose.yml) |
| **Writing unit tests** | Engineering Practices | 0.3 | [`src/lib/optimisation/__tests__/engine.test.ts`](file:///src/lib/optimisation/__tests__/engine.test.ts) |
| **Automated API testing / integration tests** | Engineering Practices | 0.2 | [`src/server/__tests__/api.test.ts`](file:///src/server/__tests__/api.test.ts) |
| **Caching with Redis** | System & Integration | 0.4 | [`src/server/system/redisCache.ts`](file:///src/server/system/redisCache.ts) |
| **WebSocket / real-time communication** | System & Integration | 0.5 | [`src/server/system/websocketServer.ts`](file:///src/server/system/websocketServer.ts) |
| **Scheduled jobs / cron** | System & Integration | 0.3 | [`src/server/system/cronJobs.ts`](file:///src/server/system/cronJobs.ts) |
| **Server-side rendering** | System & Integration | 0.5 | [`src/server/system/ssr.ts`](file:///src/server/system/ssr.ts) |
| **3rd-party API integration** | System & Integration | 0.3 | [`src/server/system/thirdPartyApi.ts`](file:///src/server/system/thirdPartyApi.ts) |
| **Payment gateway integration** | System & Integration | 0.5 | [`src/server/system/thirdPartyApi.ts`](file:///src/server/system/thirdPartyApi.ts#L48-L75), `package-lock.json` |

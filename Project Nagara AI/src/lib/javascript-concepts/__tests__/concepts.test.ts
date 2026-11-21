import { describe, it, expect } from 'vitest';
import {
  demonstrateEventLoopOrder,
  yieldToEventLoop,
  promisify,
  readWardSensorCallback,
  readWardSensorPromise,
  comparePromiseComposition,
  fetchWardMetricsAsync,
  executeSequentialAsync,
  executeParallelAsync,
  safeAsyncExecutor,
  demonstrateFunctionHoisting,
  demonstrateVarHoisting,
  verifyTemporalDeadZone,
  createBudgetAccount,
  createMemoizedCalculator,
  createClosureRateLimiter,
} from '../index';

describe('JavaScript Concepts - Comprehensive Verification Suite', () => {
  describe('1. JavaScript Event Loop', () => {
    it('executes synchronous code first, microtasks second, and macrotasks third', async () => {
      const logs = await demonstrateEventLoopOrder();
      expect(logs.length).toBeGreaterThanOrEqual(5);

      expect(logs[0].source).toBe('sync');
      expect(logs[1].source).toBe('sync');
      expect(logs[2].source).toBe('microtask');
      expect(logs[3].source).toBe('microtask');
      expect(logs[4].source).toBe('macrotask');
    });

    it('yields execution to allow event loop tick completion', async () => {
      let completed = false;
      setTimeout(() => {
        completed = true;
      }, 0);
      expect(completed).toBe(false);
      await yieldToEventLoop();
      expect(completed).toBe(true);
    });
  });

  describe('2. Promises vs Callbacks', () => {
    it('handles legacy callback execution with error-first signature', () => {
      return new Promise<void>((resolve) => {
        readWardSensorCallback('ward-01', (err, data) => {
          expect(err).toBeNull();
          expect(data?.wardId).toBe('ward-01');
          expect(data?.temperature).toBe(31.4);
          resolve();
        });
      });
    });

    it('promisifies legacy callback functions correctly', async () => {
      const data = await readWardSensorPromise('ward-02');
      expect(data.wardId).toBe('ward-02');
      expect(data.temperature).toBe(31.4);
    });

    it('propagates errors rejected from promisified callback functions', async () => {
      await expect(readWardSensorPromise('')).rejects.toThrow('Invalid wardId');
    });

    it('compares Promise.allSettled behavior across multiple async operations', async () => {
      const result = await comparePromiseComposition(['ward-01', 'ward-02']);
      expect(result.settled.length).toBe(2);
      expect(result.settled[0].status).toBe('fulfilled');
    });
  });

  describe('3. async / await', () => {
    it('fetches ward metrics asynchronously with non-blocking await', async () => {
      const metrics = await fetchWardMetricsAsync('ward-10');
      expect(metrics.wardId).toBe('ward-10');
      expect(metrics.energyDemandMWh).toBeGreaterThan(0);
    });

    it('executes sequential vs parallel async tasks reliably', async () => {
      const sequential = await executeSequentialAsync(['w1', 'w2']);
      expect(sequential.length).toBe(2);

      const parallel = await executeParallelAsync(['w1', 'w2']);
      expect(parallel.length).toBe(2);
    });

    it('handles errors cleanly with try/catch fallback in safeAsyncExecutor', async () => {
      const failureTask = () => fetchWardMetricsAsync('');
      const fallback = { wardId: 'fallback', energyDemandMWh: 0, carbonEmissionsTons: 0 };
      const outcome = await safeAsyncExecutor(failureTask, fallback);

      expect(outcome.success).toBe(false);
      expect(outcome.result.wardId).toBe('fallback');
      expect(outcome.errorMessage).toContain('Ward identifier is required');
    });
  });

  describe('4. JavaScript Hoisting', () => {
    it('allows function declarations to be called before declaration', () => {
      const result = demonstrateFunctionHoisting();
      expect(result.declarationOutput).toContain('Calculated sum: 30');
      expect(result.expressionOutput).toContain('Calculated product: 200');
    });

    it('demonstrates var hoisting initialized to undefined', () => {
      const result = demonstrateVarHoisting();
      expect(result.valueBeforeAssignment).toBeUndefined();
      expect(result.valueAfterAssignment).toBe('Bengaluru Urban');
    });

    it('verifies Temporal Dead Zone (TDZ) behavior for let and const', () => {
      const result = verifyTemporalDeadZone();
      expect(result.isTDZEnforced).toBe(true);
      expect(result.tdzDescription).toContain('Temporal Dead Zone');
    });
  });

  describe('5. JavaScript Closures', () => {
    it('encapsulates private state in a budget account closure', () => {
      const account = createBudgetAccount(50);
      expect(account.getBalance()).toBe(50);

      const debited = account.debit(10, 'Green corridor');
      expect(debited).toBe(true);
      expect(account.getBalance()).toBe(40);

      const overdrawn = account.debit(100, 'Impossible CapEx');
      expect(overdrawn).toBe(false);
      expect(account.getBalance()).toBe(40);

      expect(account.getHistory().length).toBe(1);
    });

    it('memoizes expensive calculations using closure lexical Map', () => {
      let computationCount = 0;
      const costlyCalculation = (x: number) => {
        computationCount++;
        return x * x;
      };

      const memoized = createMemoizedCalculator(costlyCalculation);

      const firstCall = memoized(5);
      expect(firstCall.result).toBe(25);
      expect(firstCall.fromCache).toBe(false);
      expect(computationCount).toBe(1);

      const secondCall = memoized(5);
      expect(secondCall.result).toBe(25);
      expect(secondCall.fromCache).toBe(true);
      expect(computationCount).toBe(1);
    });

    it('enforces request rate limiting using sliding window closure', () => {
      const limiter = createClosureRateLimiter(2, 50);
      expect(limiter()).toBe(true);
      expect(limiter()).toBe(true);
      expect(limiter()).toBe(false); // 3rd request rejected
    });
  });
});

/**
 * JavaScript Concept: Closures
 * -------------------------------------------------------------
 * A closure is the combination of a function bundled together (enclosed)
 * with references to its surrounding state (the lexical environment).
 *
 * In JavaScript, closures give an inner function access to an outer function’s
 * scope, even after the outer function has returned and finished executing.
 *
 * Core Use Cases:
 * 1. Data Encapsulation & Private State (emulating private variables)
 * 2. Function Factories & Currying
 * 3. Memoization / Computational Caching
 * 4. Stateful event handlers & rate limiters
 */

/**
 * 1. Private State Encapsulation via Closure
 * The `balance` and `transactionHistory` variables cannot be accessed or modified
 * directly from outside the closure. Only the returned methods have access.
 */
export function createBudgetAccount(initialBudgetCr: number) {
  let balance = initialBudgetCr;
  const history: Array<{ type: 'DEBIT' | 'CREDIT'; amount: number; note: string }> = [];

  return {
    getBalance(): number {
      return balance;
    },
    debit(amount: number, note: string): boolean {
      if (amount <= 0 || amount > balance) {
        return false;
      }
      balance -= amount;
      history.push({ type: 'DEBIT', amount, note });
      return true;
    },
    credit(amount: number, note: string): void {
      if (amount > 0) {
        balance += amount;
        history.push({ type: 'CREDIT', amount, note });
      }
    },
    getHistory() {
      // Returns a shallow copy to prevent external mutation of internal history array
      return [...history];
    },
  };
}

/**
 * 2. Memoization via Closure
 * Caches intensive mathematical calculations in a private lexical Map.
 */
export function createMemoizedCalculator<Args extends unknown[], Result>(
  expensiveFn: (...args: Args) => Result
) {
  const cache = new Map<string, Result>();

  return (...args: Args): { result: Result; fromCache: boolean } => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return { result: cache.get(key)!, fromCache: true };
    }
    const result = expensiveFn(...args);
    cache.set(key, result);
    return { result, fromCache: false };
  };
}

/**
 * 3. Stateful Sliding Window Rate Limiter via Closure
 */
export function createClosureRateLimiter(maxRequests: number, windowMs: number) {
  const timestamps: number[] = [];

  return function isAllowed(): boolean {
    const now = Date.now();
    // Evict timestamps older than the sliding window
    while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
      timestamps.shift();
    }
    if (timestamps.length < maxRequests) {
      timestamps.push(now);
      return true;
    }
    return false;
  };
}

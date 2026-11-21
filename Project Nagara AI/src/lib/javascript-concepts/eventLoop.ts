/**
 * JavaScript Concept: Event Loop
 * -------------------------------------------------------------
 * The JavaScript runtime is single-threaded with a non-blocking,
 * event-driven concurrency model powered by the Event Loop.
 *
 * Execution Order:
 * 1. Synchronous Code (Call Stack)
 * 2. Microtask Queue (Promise.then, queueMicrotask, MutationObserver)
 *    - Entire microtask queue is drained before any macrotask runs
 * 3. Macrotask Queue / Callback Queue (setTimeout, setInterval, setImmediate, I/O)
 *    - One macrotask is processed per event loop tick, followed by draining microtasks
 */

export interface EventLoopLogEntry {
  source: 'sync' | 'microtask' | 'macrotask';
  message: string;
  timestamp: number;
}

/**
 * Demonstrates the deterministic execution order between Synchronous code,
 * Microtasks (queueMicrotask, Promise.resolve()), and Macrotasks (setTimeout).
 */
export function demonstrateEventLoopOrder(): Promise<EventLoopLogEntry[]> {
  const executionLog: EventLoopLogEntry[] = [];
  const start = performance.now();

  return new Promise((resolve) => {
    // 1. Synchronous Step 1
    executionLog.push({
      source: 'sync',
      message: '1. Synchronous: Main thread initial execution',
      timestamp: performance.now() - start,
    });

    // 2. Macrotask Queue: Scheduled via setTimeout (delay 0ms)
    setTimeout(() => {
      executionLog.push({
        source: 'macrotask',
        message: '5. Macrotask: setTimeout callback executed in next tick',
        timestamp: performance.now() - start,
      });

      // Microtask spawned inside macrotask
      queueMicrotask(() => {
        executionLog.push({
          source: 'microtask',
          message: '6. Microtask: Spawned inside macrotask, runs before next macrotask',
          timestamp: performance.now() - start,
        });
        resolve(executionLog);
      });
    }, 0);

    // 3. Microtask Queue: Scheduled via queueMicrotask
    queueMicrotask(() => {
      executionLog.push({
        source: 'microtask',
        message: '3. Microtask: queueMicrotask executed before macrotasks',
        timestamp: performance.now() - start,
      });
    });

    // 4. Microtask Queue: Scheduled via Promise.resolve().then()
    Promise.resolve().then(() => {
      executionLog.push({
        source: 'microtask',
        message: '4. Microtask: Promise.then executed before macrotasks',
        timestamp: performance.now() - start,
      });
    });

    // 5. Synchronous Step 2
    executionLog.push({
      source: 'sync',
      message: '2. Synchronous: Main thread synchronous completion',
      timestamp: performance.now() - start,
    });
  });
}

/**
 * Non-blocking task chunking using the Event Loop to prevent UI thread freezing
 * when processing large municipal simulation calculations.
 */
export async function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

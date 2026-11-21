/**
 * JavaScript Concept: async / await
 * -------------------------------------------------------------
 * `async/await` is syntactic sugar built on top of ES2015 Promises.
 *
 * Characteristics:
 * - An `async` function always returns a Promise.
 * - The `await` keyword pauses the execution of the async function in a non-blocking
 *   manner until the awaited Promise is settled.
 * - Enables synchronous-looking code for asynchronous workflows.
 * - Handles errors cleanly using standard `try { ... } catch (err) { ... } finally { ... }`.
 * - Sequential vs Parallel execution pattern awareness:
 *   * Sequential: `await a(); await b();` (Takes time a + b)
 *   * Parallel: `await Promise.all([a(), b()]);` (Takes max(time a, time b))
 */

export interface WardMetricResponse {
  wardId: string;
  energyDemandMWh: number;
  carbonEmissionsTons: number;
}

/**
 * Simulates an asynchronous remote API request with delay.
 */
export async function fetchWardMetricsAsync(wardId: string): Promise<WardMetricResponse> {
  if (!wardId) {
    throw new Error('Ward identifier is required');
  }

  // Non-blocking wait using Promise & setTimeout
  await new Promise((resolve) => setTimeout(resolve, 15));

  return {
    wardId,
    energyDemandMWh: Math.round(150 + Math.random() * 80),
    carbonEmissionsTons: Math.round(45 + Math.random() * 30),
  };
}

/**
 * Demonstrates sequential execution using async/await.
 * Each ward is fetched one after another.
 */
export async function executeSequentialAsync(wardIds: string[]): Promise<WardMetricResponse[]> {
  const results: WardMetricResponse[] = [];
  for (const id of wardIds) {
    const data = await fetchWardMetricsAsync(id);
    results.push(data);
  }
  return results;
}

/**
 * Demonstrates parallel execution using async/await combined with Promise.all.
 * All wards are requested concurrently.
 */
export async function executeParallelAsync(wardIds: string[]): Promise<WardMetricResponse[]> {
  const promises = wardIds.map((id) => fetchWardMetricsAsync(id));
  return await Promise.all(promises);
}

/**
 * Demonstrates comprehensive error handling with try/catch/finally in async/await.
 */
export async function safeAsyncExecutor<T>(
  asyncTask: () => Promise<T>,
  fallbackValue: T
): Promise<{ result: T; success: boolean; errorMessage?: string }> {
  let executionCompleted = false;

  try {
    const result = await asyncTask();
    return { result, success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown async error occurred';
    return {
      result: fallbackValue,
      success: false,
      errorMessage: message,
    };
  } finally {
    executionCompleted = true;
    // Cleanup / telemetry logic executed unconditionally
    void executionCompleted;
  }
}

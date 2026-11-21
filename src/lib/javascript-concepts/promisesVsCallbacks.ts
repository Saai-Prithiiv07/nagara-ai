/**
 * JavaScript Concept: Promises vs Callbacks
 * -------------------------------------------------------------
 * Callbacks:
 * - Functions passed as arguments to be executed upon completion of an async operation.
 * - Suffer from "Callback Hell" (Pyramid of Doom), difficulty in centralized error handling,
 *   and inversion of control (lack of trust in when or how many times callback is invoked).
 *
 * Promises:
 * - First-class objects representing the eventual completion (or failure) of an async operation.
 * - 3 States: Pending, Fulfilled, Rejected.
 * - Allow chaining (.then, .catch, .finally) and compositional concurrency (Promise.all, Promise.race).
 */

export type NodeCallback<T> = (err: Error | null, result?: T) => void;

/**
 * Legacy callback-based asynchronous simulated sensor reader.
 */
export function readWardSensorCallback(
  wardId: string,
  callback: NodeCallback<{ wardId: string; temperature: number; aqi: number }>
): void {
  setTimeout(() => {
    if (!wardId || wardId.trim() === '') {
      callback(new Error('Invalid wardId provided to sensor reader'));
      return;
    }
    callback(null, {
      wardId,
      temperature: 31.4,
      aqi: 142,
    });
  }, 10);
}

/**
 * Generic `promisify` utility: Transforms a standard Node.js error-first callback function
 * into a modern Promise-returning function.
 */
export function promisify<T, A>(
  fn: (arg: A, cb: NodeCallback<T>) => void
): (arg: A) => Promise<T> {
  return (arg: A): Promise<T> => {
    return new Promise((resolve, reject) => {
      fn(arg, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result as T);
        }
      });
    });
  };
}

/**
 * Modern Promise-based sensor reader derived via promisify.
 */
export const readWardSensorPromise = promisify(readWardSensorCallback);

/**
 * Demonstrates Promise composition:
 * - Promise.all (fails fast if any reject)
 * - Promise.allSettled (resolves all regardless of individual failures)
 */
export async function comparePromiseComposition(wardIds: string[]): Promise<{
  settled: PromiseSettledResult<{ wardId: string; temperature: number; aqi: number }>[];
}> {
  const settled = await Promise.allSettled(
    wardIds.map((id) => readWardSensorPromise(id))
  );
  return { settled };
}

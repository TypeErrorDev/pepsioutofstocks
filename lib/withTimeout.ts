/**
 * Reject if a promise hasn't settled within `ms`.
 *
 * Used to guarantee that a stalled network request (or a wedged client) can
 * never leave a submit button spinning forever — the caller's `finally` always
 * runs because the race rejects instead of hanging.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message = "Request timed out. Please try again.",
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
}

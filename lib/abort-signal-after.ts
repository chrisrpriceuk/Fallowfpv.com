/**
 * Abort after `ms`. Prefer `AbortSignal.timeout` when present; otherwise
 * `AbortController` + `setTimeout` (older Node / some serverless runtimes).
 */
export function abortSignalAfter(ms: number): AbortSignal {
  const AS = AbortSignal as typeof AbortSignal & {
    timeout?: (milliseconds: number) => AbortSignal;
  };
  if (typeof AS.timeout === "function") {
    try {
      return AS.timeout(ms);
    } catch {
      /* fall through */
    }
  }
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  const timer = t as unknown as { unref?: () => void };
  if (typeof timer.unref === "function") timer.unref();
  return c.signal;
}

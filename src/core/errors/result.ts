import { N11ApiError, type N11ErrorContext } from './errors.js';

/** The `result` element n11 puts in every response. */
export interface ResultInfo {
  status?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  errorCategory?: string | null;
}

/** A decoded response body, which always carries `result`. */
export interface N11ResponseBody {
  result?: ResultInfo | null;
  [key: string]: unknown;
}

/**
 * Raise if n11 reported failure in the body of an otherwise successful HTTP response.
 *
 * The check is deliberately "not success" rather than "equals failure": n11 has been seen to
 * answer `failure`, `error` and, on some services, nothing at all. Anything that is not an
 * explicit success, with an error code attached, is treated as a failure.
 */
export function assertSuccess(body: N11ResponseBody | undefined, context: N11ErrorContext): void {
  const result = body?.result;
  if (!result) return;

  const status = result.status?.toLowerCase();
  const hasError = Boolean(result.errorCode || result.errorMessage);
  if (status === 'success' || (!hasError && status !== 'failure' && status !== 'error')) return;

  const detail = result.errorMessage || result.errorCode || status || 'unknown error';
  throw new N11ApiError(
    `${context.operation} failed: ${detail}`,
    context,
    result.errorCode ?? undefined,
    result.errorMessage ?? undefined,
    result.errorCategory ?? undefined
  );
}

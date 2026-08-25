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
 *
 * It runs on every response, including those whose `result` the WSDL never declared and which
 * therefore arrive as untyped passthrough — hence the string coercion rather than a cast.
 * Operations whose `result` carries data instead of a status (`ProductApprovalStatus` returns
 * counts) fall through untouched: no status, no error code, no exception.
 */
export function assertSuccess(body: N11ResponseBody | undefined, context: N11ErrorContext): void {
  const result = body?.result;
  if (!result || typeof result !== 'object') return;

  const status = text(result.status)?.toLowerCase();
  const errorCode = text(result.errorCode);
  const errorMessage = text(result.errorMessage);
  const hasError = Boolean(errorCode || errorMessage);
  if (status === 'success' || (!hasError && status !== 'failure' && status !== 'error')) return;

  const detail = errorMessage || errorCode || status || 'unknown error';
  throw new N11ApiError(
    `${context.operation} failed: ${detail}`,
    context,
    errorCode,
    errorMessage,
    text(result.errorCategory)
  );
}

/** Undeclared elements reach us as whatever the XML parser made of them, not always a string. */
function text(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'object') return text((value as Record<string, unknown>)['#text']);
  const string = String(value);
  return string === '' ? undefined : string;
}

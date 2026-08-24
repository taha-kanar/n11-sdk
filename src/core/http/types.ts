/** Case-insensitive header bag, normalised to lower-case keys by the transport. */
export type HttpHeaders = Record<string, string>;

/** A fully-resolved SOAP request, ready for an {@link HttpClient}. */
export interface HttpRequest {
  readonly method: 'POST';
  /** Absolute service endpoint — note this is not the WSDL URL. */
  readonly url: string;
  readonly headers: HttpHeaders;
  /** The SOAP envelope. */
  readonly body: string;
  readonly signal?: AbortSignal | undefined;
  readonly context: RequestContext;
}

/** Metadata carried alongside a request so middleware can reason about it. */
export interface RequestContext {
  /** n11 operation name, e.g. `OrderList`. */
  readonly operation: string;
  /** WSDL service name, e.g. `OrderService`. */
  readonly service: string;
  /** Attempt number, starting at 1. Incremented by retrying middleware. */
  attempt: number;
  readonly meta: Record<string, unknown>;
}

/** A response with its body already buffered as text. */
export interface HttpResponse {
  readonly status: number;
  readonly statusText: string;
  readonly headers: HttpHeaders;
  readonly body: string;
  readonly raw?: unknown;
}

/** Create a copy of a request with extra headers merged in (later wins). */
export function withHeaders(request: HttpRequest, headers: HttpHeaders): HttpRequest {
  return { ...request, headers: { ...request.headers, ...headers } };
}

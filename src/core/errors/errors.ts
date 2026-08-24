/** Details attached to every error this SDK throws. */
export interface N11ErrorContext {
  /** n11 operation name, e.g. `GetTopLevelCategories`. */
  readonly operation: string;
  /** WSDL service the operation belongs to, e.g. `CategoryService`. */
  readonly service: string;
  readonly url: string;
  readonly status?: number | undefined;
  /** Response body, truncated — invaluable when n11 answers with something unexpected. */
  readonly body?: string | undefined;
}

/** Base class for everything this SDK throws. */
export class N11Error extends Error {
  override readonly name: string = 'N11Error';

  constructor(message: string, readonly context: N11ErrorContext, options?: { cause?: unknown }) {
    super(message, options as ErrorOptions);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * n11 reported a failure **inside a 200 response**.
 *
 * Every n11 response carries a `result` element; `status: "failure"` means the call did not do
 * what you asked, regardless of what HTTP said. Treating that as success is the single most
 * common bug in n11 integrations, so the SDK raises it.
 */
export class N11ApiError extends N11Error {
  override readonly name = 'N11ApiError';

  constructor(
    message: string,
    context: N11ErrorContext,
    /** n11's error code, e.g. `SELLER_API.invalidCategory`. */
    readonly errorCode?: string | undefined,
    /** n11's human-readable message, usually Turkish. */
    readonly errorMessage?: string | undefined,
    /** n11's error grouping, e.g. `INVALID_PARAMETER`. */
    readonly errorCategory?: string | undefined
  ) {
    super(message, context);
  }
}

/** The SOAP envelope itself was rejected — malformed request, unknown operation, auth refused. */
export class N11SoapFaultError extends N11Error {
  override readonly name = 'N11SoapFaultError';

  constructor(
    message: string,
    context: N11ErrorContext,
    readonly faultCode?: string | undefined,
    readonly faultString?: string | undefined,
    readonly detail?: unknown
  ) {
    super(message, context);
  }
}

/** Non-2xx HTTP status: the gateway answered before the service did. */
export class N11HttpError extends N11Error {
  override readonly name = 'N11HttpError';

  get status(): number {
    return this.context.status ?? 0;
  }
}

/** The request never produced a response (DNS, TLS, socket, offline). */
export class N11ConnectionError extends N11Error {
  override readonly name = 'N11ConnectionError';
}

/** The request exceeded the configured timeout, or its signal was aborted. */
export class N11TimeoutError extends N11Error {
  override readonly name = 'N11TimeoutError';
}

/** The response was not a SOAP envelope this SDK could read. */
export class N11ParseError extends N11Error {
  override readonly name = 'N11ParseError';
}

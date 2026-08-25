import { assertSuccess, type N11ResponseBody } from '../core/errors/result.js';
import {
  N11HttpError,
  N11ParseError,
  N11SoapFaultError,
  type N11ErrorContext,
} from '../core/errors/errors.js';
import type { HttpClient, HttpRequest, HttpResponse } from '../core/http/index.js';
import { composeMiddleware, type Middleware } from '../core/middleware/index.js';
import { buildEnvelope, parseEnvelope, type Credentials } from './envelope.js';
import type { ServiceShapes } from './shape.js';

/** Options every service method accepts on top of its own parameters. */
export interface RequestOptions {
  /** Cancels the request. Works on every supported runtime. */
  signal?: AbortSignal;
  /** Extra headers for this call only. */
  headers?: Record<string, string>;
  /** Passed through to middleware via `request.context.meta`. */
  meta?: Record<string, unknown>;
}

export interface TransportOptions {
  credentials: Credentials;
  httpClient: HttpClient;
  middleware?: readonly Middleware[];
  defaultHeaders?: Record<string, string>;
  /** Overrides the endpoints in the WSDLs — a proxy, or a mock server. */
  baseUrl?: string | undefined;
}

/**
 * Turns an operation call into a SOAP exchange and back into a typed value.
 *
 * This is the only place that knows how an n11 call is assembled: envelope, credentials, headers,
 * the middleware chain, and the three ways a call can fail (HTTP, SOAP fault, and n11's own
 * in-band `result`). Services describe *what* to call; the transport decides *how*.
 */
export class SoapTransport {
  private readonly credentials: Credentials;
  private readonly httpClient: HttpClient;
  private readonly middleware: readonly Middleware[];
  private readonly defaultHeaders: Record<string, string>;
  private readonly baseUrl: string | undefined;

  constructor(options: TransportOptions) {
    this.credentials = options.credentials;
    this.httpClient = options.httpClient;
    this.middleware = options.middleware ?? [];
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.baseUrl = options.baseUrl;
  }

  /** Execute an operation and decode its response body as `TResponse`. */
  async call<TResponse>(
    shapes: ServiceShapes,
    operation: string,
    body: Record<string, unknown> = {},
    options: RequestOptions = {}
  ): Promise<TResponse> {
    const url = this.endpointFor(shapes);
    const envelope = buildEnvelope(shapes, operation, body, this.credentials);

    const request: HttpRequest = {
      method: 'POST',
      url,
      headers: {
        'content-type': 'text/xml; charset=utf-8',
        // SOAP 1.1 requires the header even though every n11 operation declares it empty.
        soapaction: '""',
        accept: 'text/xml',
        ...lowerCaseKeys(this.defaultHeaders),
        ...lowerCaseKeys(options.headers ?? {}),
      },
      body: envelope,
      signal: options.signal,
      context: { operation, service: shapes.service, attempt: 1, meta: options.meta ?? {} },
    };

    const run = composeMiddleware(this.middleware, (req) => this.httpClient.send(req));
    const response = await run(request);

    const context: N11ErrorContext = {
      operation,
      service: shapes.service,
      url,
      status: response.status,
      body: response.body ? response.body.slice(0, 2000) : undefined,
    };

    return this.decode<TResponse>(shapes, operation, response, context);
  }

  /** Where a service lives. The WSDL knows; `baseUrl` overrides it for proxies and tests. */
  endpointFor(shapes: ServiceShapes): string {
    if (!this.baseUrl) return shapes.endpoint;
    const path = new URL(shapes.endpoint).pathname;
    return `${this.baseUrl.replace(/\/+$/, '')}${path}`;
  }

  private decode<TResponse>(
    shapes: ServiceShapes,
    operation: string,
    response: HttpResponse,
    context: N11ErrorContext
  ): TResponse {
    let parsed;
    try {
      parsed = parseEnvelope(shapes, operation, response.body);
    } catch (cause) {
      // A non-envelope body with a bad status is an HTTP problem, not a parsing one.
      if (response.status < 200 || response.status >= 300) {
        throw new N11HttpError(`${operation} failed with HTTP ${response.status}`, context);
      }
      throw new N11ParseError(`${operation} returned a body that is not a SOAP envelope`, context, { cause });
    }

    if (parsed.fault) {
      const detail = parsed.fault.faultstring ?? parsed.fault.faultcode ?? 'unknown fault';
      throw new N11SoapFaultError(
        `${operation} was rejected: ${detail}`,
        context,
        parsed.fault.faultcode,
        parsed.fault.faultstring,
        parsed.fault.detail
      );
    }

    if (response.status < 200 || response.status >= 300) {
      throw new N11HttpError(`${operation} failed with HTTP ${response.status}`, context);
    }

    // n11 reports business failures inside a 200 — this is where that becomes an exception.
    //
    // The check runs on the decoded body rather than on what the schema promised. Gating it on
    // `result` being declared as `ResultInfo` looked tidier, but production disproved it: the
    // WSDL gives `GetProductQuestionList` no `result` at all, so a rate-limit refusal
    // (`SELLER_API.…accessLimit.reached`) decoded as a perfectly successful empty page. Anything
    // the schema has not caught up with — including the services reached through
    // `N11Client.call`, which have no schema — is checked all the same.
    //
    // `assertSuccess` only raises on an explicit failure or an attached error code, so
    // `ProductApprovalStatus`, whose `result` holds counts rather than a status, still passes.
    assertSuccess(parsed.body as N11ResponseBody | undefined, context);

    return (parsed.body ?? {}) as TResponse;
  }
}

function lowerCaseKeys(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]));
}

/**
 * n11-sdk — a typed client for the n11 Marketplace SOAP API.
 *
 * Every request and response type under `./generated` is derived from n11's own WSDL documents
 * (committed in `wsdl/`), and the codec is driven by the same schema — so a one-element list is
 * still an array and a seller code of `"0123"` is still a string.
 */

export { N11Client } from './client.js';
export { type ClientOptions, type ResolvedConfig } from './config.js';

// Core seams — implement these to swap transport or add pipeline steps.
export {
  FetchHttpClient,
  withHeaders,
  type FetchHttpClientOptions,
  type FetchLike,
  type HttpClient,
  type HttpHeaders,
  type HttpRequest,
  type HttpResponse,
  type RequestContext,
} from './core/http/index.js';
export { composeMiddleware, LoggingMiddleware, type Middleware, type Next } from './core/middleware/index.js';
export { consoleLogger, silentLogger, type Logger } from './core/logger.js';
export { BaseService } from './core/resource/base-service.js';

// SOAP layer, for building calls the services do not cover.
export {
  buildEnvelope,
  decodeFields,
  encodeFields,
  escapeXml,
  N11_NAMESPACE,
  operationShape,
  parseEnvelope,
  parserOptions,
  SoapTransport,
  type Credentials,
  type FieldShape,
  type OperationShape,
  type ParsedEnvelope,
  type RequestOptions,
  type ServiceShapes,
  type SoapFault,
  type TransportOptions,
} from './soap/index.js';

// Errors — `N11Error` is the base of everything this package throws.
export {
  assertSuccess,
  N11ApiError,
  N11ConnectionError,
  N11Error,
  N11HttpError,
  N11ParseError,
  N11SoapFaultError,
  N11TimeoutError,
  type N11ErrorContext,
  type N11ResponseBody,
  type ResultInfo,
} from './core/errors/index.js';

// Service classes, for typing your own dependency-injected wrappers.
export * from './resources/index.js';

// Generated contract: request/response types and the runtime shapes.
export * from './generated/index.js';

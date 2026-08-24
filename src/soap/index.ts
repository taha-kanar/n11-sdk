export { buildEnvelope, parseEnvelope, N11_NAMESPACE, type Credentials, type ParsedEnvelope, type SoapFault } from './envelope.js';
export { encodeFields, escapeXml } from './encode.js';
export { decodeFields, parserOptions } from './decode.js';
export { operationShape, type FieldShape, type OperationShape, type ServiceShapes } from './shape.js';
export { SoapTransport, type RequestOptions, type TransportOptions } from './transport.js';

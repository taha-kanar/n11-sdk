import { XMLParser } from 'fast-xml-parser';
import { encodeFields } from './encode.js';
import { decodeFields, parserOptions } from './decode.js';
import { operationShape, type FieldShape, type ServiceShapes } from './shape.js';

/** The namespace every n11 service shares. */
export const N11_NAMESPACE = 'http://www.n11.com/ws/schemas';
const SOAP_ENVELOPE_NS = 'http://schemas.xmlsoap.org/soap/envelope/';
const XSI_NS = 'http://www.w3.org/2001/XMLSchema-instance';

const parser = new XMLParser(parserOptions);

/** Credentials, sent in the body of every request rather than in a header. */
export interface Credentials {
  appKey: string;
  appSecret: string;
}

/**
 * Build the SOAP 1.1 envelope for an operation.
 *
 * Credentials are merged into the body and encoded through the schema like any other field, so
 * `auth` lands exactly where the WSDL declares it. That is not pedantry: `document/literal` binds
 * by position, and three CityService operations — `GetCity`, `GetDistrict`, `GetNeighborhoods` —
 * declare `auth` *after* their parameter rather than before it. Writing it first unconditionally
 * would put those three out of order.
 */
export function buildEnvelope(
  shapes: ServiceShapes,
  operation: string,
  body: Record<string, unknown>,
  credentials: Credentials
): string {
  const shape = operationShape(shapes, operation);
  const withAuth = { ...body, auth: { appKey: credentials.appKey, appSecret: credentials.appSecret } };

  // With no schema (see `N11Client.call`) there is no declared position, so auth leads.
  const authField: FieldShape = { n: 'auth', t: 'Authentication', c: 1 };
  const fields = shape.request.length ? shape.request : [authField];

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    `<soapenv:Envelope xmlns:soapenv="${SOAP_ENVELOPE_NS}" xmlns:sch="${N11_NAMESPACE}" xmlns:xsi="${XSI_NS}">` +
    '<soapenv:Header/>' +
    '<soapenv:Body>' +
    `<sch:${operation}Request>` +
    encodeFields(fields, withAuth, shapes) +
    `</sch:${operation}Request>` +
    '</soapenv:Body>' +
    '</soapenv:Envelope>'
  );
}

/** A `<soap:Fault>`, which arrives instead of a response body when the envelope itself is rejected. */
export interface SoapFault {
  faultcode?: string | undefined;
  faultstring?: string | undefined;
  detail?: unknown;
}

export interface ParsedEnvelope {
  /** The decoded `{Operation}Response` element, when the call produced one. */
  body?: Record<string, unknown>;
  fault?: SoapFault;
}

/**
 * Parse a response envelope into the operation's declared shape.
 *
 * @throws {Error} when the payload is not a SOAP envelope at all — an HTML error page from a
 *   proxy, say. Callers turn this into a typed parse error.
 */
export function parseEnvelope(shapes: ServiceShapes, operation: string, xml: string): ParsedEnvelope {
  const document = parser.parse(xml) as Record<string, any>;
  const envelope = document.Envelope;
  if (envelope === undefined) throw new Error('response is not a SOAP envelope');

  // A self-closing `<Body/>` parses to an empty string, which is still a valid envelope:
  // several n11 operations answer with no payload at all.
  const soapBody = envelope.Body;
  if (soapBody === undefined) throw new Error('SOAP envelope has no Body');
  if (typeof soapBody !== 'object') return { body: {} };

  if (soapBody.Fault) {
    const fault = soapBody.Fault as Record<string, unknown>;
    return {
      fault: {
        faultcode: asText(fault['faultcode']),
        faultstring: asText(fault['faultstring']),
        detail: fault['detail'],
      },
    };
  }

  const shape = operationShape(shapes, operation);
  const element = soapBody[`${operation}Response`];
  if (element === undefined) return { body: {} };

  return { body: decodeFields(shape.response, element as Record<string, unknown>, shapes) };
}

const asText = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'object') return asText((value as Record<string, unknown>)['#text']);
  return String(value);
};

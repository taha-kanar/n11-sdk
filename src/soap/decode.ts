import type { FieldShape, ServiceShapes } from './shape.js';

/**
 * Turn parsed XML into typed JavaScript, using the schema rather than the payload.
 *
 * The XML parser is configured to keep every value as a string and never to infer arrays
 * ({@link parserOptions}). All the interesting decisions happen here:
 *
 * - a `maxOccurs="unbounded"` element is always an array, even when one entry arrived;
 * - `xs:string` stays a string, so a seller code of `"0123"` is not silently renumbered;
 * - `xsi:nil="true"` and empty elements become `null`;
 * - elements the schema does not mention are kept as-is, so a field n11 adds is never lost.
 */

/** Options for `fast-xml-parser` that make this decoder the only place types are decided. */
export const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  isArray: () => false,
  removeNSPrefix: true,
} as const;

const isNil = (node: unknown): boolean =>
  typeof node === 'object' && node !== null && (node as Record<string, unknown>)['@nil'] === 'true';

function decodeScalar(type: string, node: unknown): unknown {
  // An element carrying attributes parses to an object; its text sits under `#text`.
  const raw =
    typeof node === 'object' && node !== null ? (node as Record<string, unknown>)['#text'] : node;

  if (raw === undefined || raw === null || raw === '') return type === 'string' ? '' : null;

  const text = String(raw);
  switch (type) {
    case 'number': {
      const parsed = Number(text);
      // Keep the original text rather than hand back NaN for something unparseable.
      return Number.isNaN(parsed) ? text : parsed;
    }
    case 'boolean':
      return text === 'true' || text === '1';
    default:
      return text;
  }
}

function decodeValue(field: FieldShape, node: unknown, shapes: ServiceShapes): unknown {
  if (node === undefined || node === null || isNil(node)) return null;
  if (!field.c) return decodeScalar(field.t, node);

  const nested = shapes.types[field.t];
  // Enumerations and any type the WSDL does not define are plain text.
  if (!nested) return decodeScalar('string', node);
  if (typeof node !== 'object') return node === '' ? {} : node;
  return decodeFields(nested, node as Record<string, unknown>, shapes);
}

/** Decode one `xs:sequence` worth of elements. */
export function decodeFields(
  fields: readonly FieldShape[],
  node: Record<string, unknown> | undefined,
  shapes: ServiceShapes
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (!node || typeof node !== 'object') return result;

  const known = new Set<string>();

  for (const field of fields) {
    known.add(field.n);
    const raw = node[field.n];
    if (raw === undefined) continue;

    if (field.l) {
      // The single-element trap: one `<category/>` parses to an object, two to an array.
      const items = Array.isArray(raw) ? raw : [raw];
      result[field.n] = items.map((item) => decodeValue(field, item, shapes));
      continue;
    }
    result[field.n] = decodeValue(field, raw, shapes);
  }

  // Anything n11 added since this WSDL was published: kept verbatim rather than dropped.
  for (const [key, value] of Object.entries(node)) {
    if (known.has(key) || key.startsWith('@') || key === '#text') continue;
    result[key] = value;
  }
  return result;
}

import type { FieldShape, ServiceShapes } from './shape.js';

/** Escape the five characters XML reserves in element text. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function scalarToText(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

/**
 * Serialise a value into XML elements, following the schema's order.
 *
 * `document/literal` binds by position: n11 rejects a body whose elements arrive in a different
 * order than the XSD declares. So the encoder iterates the *shape*, never `Object.keys(value)` —
 * object key order is an accident of how the caller built the literal.
 */
export function encodeFields(
  fields: readonly FieldShape[],
  value: Record<string, unknown> | undefined,
  shapes: ServiceShapes
): string {
  if (!value) return '';
  let xml = '';
  const known = new Set<string>();

  for (const field of fields) {
    known.add(field.n);
    const raw = value[field.n];
    if (raw === undefined) continue;

    if (raw === null) {
      // Only nillable elements may be sent empty; anything else would be a schema violation.
      if (field.x) xml += `<${field.n} xsi:nil="true"/>`;
      continue;
    }

    const items = field.l ? (Array.isArray(raw) ? raw : [raw]) : [raw];
    for (const item of items) {
      if (item === null || item === undefined) continue;
      xml += `<${field.n}>${encodeValue(field, item, shapes)}</${field.n}>`;
    }
  }

  // Keys the schema does not describe are still sent, after the ordered ones. That covers both
  // `N11Client.call`, which has no schema at all, and a field n11 adds before this SDK catches up.
  for (const [key, raw] of Object.entries(value)) {
    if (known.has(key) || raw === undefined || raw === null) continue;
    xml += encodeUnknown(key, raw);
  }
  return xml;
}

/** Encode a value the schema says nothing about: objects nest, arrays repeat, the rest is text. */
function encodeUnknown(name: string, value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== null && item !== undefined)
      .map((item) => encodeUnknown(name, item))
      .join('');
  }
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    const inner = Object.entries(value as Record<string, unknown>)
      .filter(([, child]) => child !== undefined && child !== null)
      .map(([childName, child]) => encodeUnknown(childName, child))
      .join('');
    return `<${name}>${inner}</${name}>`;
  }
  return `<${name}>${escapeXml(scalarToText(value))}</${name}>`;
}

function encodeValue(field: FieldShape, item: unknown, shapes: ServiceShapes): string {
  if (!field.c) return escapeXml(scalarToText(item));

  const nested = shapes.types[field.t];
  // Enumerations and unknown types carry plain text.
  if (!nested) return escapeXml(scalarToText(item));
  return encodeFields(nested, item as Record<string, unknown>, shapes);
}

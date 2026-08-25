/**
 * WSDL/XSD -> TypeScript generator.
 *
 * Reads `wsdl/*.wsdl` (committed copies of n11's published contracts) and emits, per service:
 *
 *   src/generated/<module>.types.ts   interfaces and unions — what callers see
 *   src/generated/<module>.shape.ts   the same schema as runtime data
 *
 * The shape file is what makes this SDK trustworthy. XML carries no types: a one-element list
 * looks like an object, `"0123"` looks like a number, and an empty element looks like `""`.
 * Rather than let the XML parser guess, the encoder and decoder walk these shapes and apply the
 * XSD's own answer.
 *
 *   node tools/generate.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WSDL_DIR = join(ROOT, 'wsdl');
const OUT_DIR = join(ROOT, 'src', 'generated');
const OVERLAY_DIR = join(WSDL_DIR, 'overlays');

/** XSD scalar -> how the decoder should coerce it, and how TypeScript should see it. */
const SCALARS = {
  string: { kind: 'string', ts: 'string' },
  date: { kind: 'string', ts: 'string' }, // n11 sends dd/MM/yyyy; parsing it here would lose information
  dateTime: { kind: 'string', ts: 'string' },
  boolean: { kind: 'boolean', ts: 'boolean' },
  int: { kind: 'number', ts: 'number' },
  integer: { kind: 'number', ts: 'number' },
  long: { kind: 'number', ts: 'number' },
  short: { kind: 'number', ts: 'number' },
  decimal: { kind: 'number', ts: 'number' },
  double: { kind: 'number', ts: 'number' },
  float: { kind: 'number', ts: 'number' },
  anyType: { kind: 'string', ts: 'unknown' },
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  parseTagValue: false,
  parseAttributeValue: false,
  isArray: (name) => ['element', 'complexType', 'simpleType', 'enumeration', 'operation'].includes(name),
  removeNSPrefix: true,
});

const pascal = (s) =>
  String(s)
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

const localName = (qname) => String(qname ?? '').split(':').pop();
const isIdent = (s) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(s);
const propKey = (s) => (isIdent(s) ? s : JSON.stringify(s));

/** Everything one WSDL tells us, in a shape the emitters can use. */
function readWsdl(xml) {
  const doc = parser.parse(xml);
  const definitions = doc.definitions;
  const schema = [].concat(definitions.types.schema)[0];

  const complexTypes = new Map(); // name -> field[]
  const simpleTypes = new Map(); // name -> string[] (enumeration values)
  const elements = new Map(); // name -> field[] (top-level request/response elements)

  /** Read an <xs:sequence> into ordered field descriptors. */
  const readSequence = (complexType) => {
    const sequence = complexType?.sequence;
    if (!sequence) return [];
    return [].concat(sequence.element ?? []).map((element) => {
      const type = localName(element['@type']);
      const scalar = SCALARS[type];
      return {
        name: element['@name'],
        type: scalar ? scalar.kind : type,
        complex: !scalar,
        ts: scalar?.ts,
        list: element['@maxOccurs'] === 'unbounded',
        nillable: element['@nillable'] === 'true',
        optional: element['@minOccurs'] === '0',
      };
    });
  };

  for (const type of schema.complexType ?? []) {
    complexTypes.set(type['@name'], readSequence(type));
  }
  for (const type of schema.simpleType ?? []) {
    const values = [].concat(type.restriction?.enumeration ?? []).map((e) => e['@value']);
    if (values.length) simpleTypes.set(type['@name'], values);
  }
  for (const element of schema.element ?? []) {
    // `complexType` is in the parser's isArray list, so an inline one arrives wrapped.
    elements.set(element['@name'], readSequence([].concat(element.complexType ?? [])[0]));
  }

  const operations = [];
  for (const binding of [].concat(definitions.binding ?? [])) {
    for (const operation of [].concat(binding.operation ?? [])) {
      const name = operation['@name'];
      if (!operations.includes(name)) operations.push(name);
    }
  }

  const endpoint = [].concat(definitions.service?.port ?? [])[0]?.address?.['@location'];
  return { complexTypes, simpleTypes, elements, operations, endpoint };
}

/**
 * Fold `wsdl/overlays/<Service>.json` into a parsed WSDL.
 *
 * n11's published contracts lag its production API: `ProductSku` is declared empty yet returns
 * eleven elements, and two operations answer with a `result` the schema never mentions. Rather
 * than hand-edit generated files — which the next `npm run generate` would erase — the observed
 * corrections live in a reviewed JSON document and are applied here.
 *
 * A field the WSDL already declares is skipped, so an overlay entry becomes a no-op the moment
 * n11 publishes the field itself. Entries are appended: responses decode by element name, so
 * order is irrelevant there, and appended request fields are only ever emitted when a caller
 * sets them.
 */
function applyOverlay(service, wsdl) {
  const file = join(OVERLAY_DIR, `${service}.json`);
  if (!existsSync(file)) return { applied: 0, obsolete: [] };

  const overlay = JSON.parse(readFileSync(file, 'utf8'));
  let applied = 0;
  const obsolete = [];

  const toField = (entry) => {
    const scalar = SCALARS[entry.type];
    return {
      name: entry.name,
      type: scalar ? scalar.kind : entry.type,
      complex: !scalar,
      ts: scalar?.ts,
      list: entry.list === true,
      nillable: entry.nillable === true,
      // Overlay fields describe what production *may* send, never what it must.
      optional: true,
      observed: true,
    };
  };

  const extend = (fields, entries, where) => {
    for (const entry of entries ?? []) {
      if (fields.some((f) => f.name === entry.name)) {
        obsolete.push(`${where}.${entry.name}`);
        continue;
      }
      fields.push(toField(entry));
      applied++;
    }
  };

  for (const [name, entries] of Object.entries(overlay.types ?? {})) {
    const fields = wsdl.complexTypes.get(name);
    if (!fields) throw new Error(`${service} overlay targets unknown type "${name}"`);
    extend(fields, entries, name);
  }

  for (const [operation, patch] of Object.entries(overlay.operations ?? {})) {
    for (const suffix of ['request', 'response']) {
      if (!patch[suffix]) continue;
      const key = `${operation}${suffix === 'request' ? 'Request' : 'Response'}`;
      const fields = wsdl.elements.get(key);
      if (!fields) throw new Error(`${service} overlay targets unknown element "${key}"`);
      extend(fields, patch[suffix], key);
    }
  }

  return { applied, obsolete };
}

// ------------------------------------------------------------------ types ----

function tsType(field, wsdl, renames = new Map()) {
  let base;
  if (!field.complex) base = field.ts ?? 'string';
  else if (wsdl.simpleTypes.has(field.type)) base = pascal(field.type);
  else if (wsdl.complexTypes.has(field.type)) base = renames.get(field.type) ?? pascal(field.type);
  else base = 'unknown';

  if (field.list) base = /[|]/.test(base) ? `Array<${base}>` : `${base}[]`;
  if (field.nillable && !field.list) base += ' | null';
  return base;
}

function emitInterface(name, fields, wsdl, { allOptional = false, alias = false, renames } = {}) {
  // Request bodies are emitted as type aliases, not interfaces: only aliases get an implicit
  // index signature, which is what lets them flow into the transport's Record<string, unknown>.
  const open = alias ? `export type ${name} = {` : `export interface ${name} {`;
  const close = alias ? '};\n' : '}\n';
  if (!fields.length) return alias ? `export type ${name} = {};\n` : `export interface ${name} {}\n`;

  const lines = [open];
  for (const field of fields) {
    const optional = allOptional || field.optional || field.nillable ? '?' : '';
    // Overlay fields are real but undeclared: mark them so a reader knows where they came from.
    const note = field.observed ? ' // observed in production; not in the WSDL' : '';
    lines.push(`  ${propKey(field.name)}${optional}: ${tsType(field, wsdl, renames)};${note}`);
  }
  lines.push(close);
  return lines.join('\n');
}

/** Field list signature, used to prove two services declare the very same type. */
function signature(fields) {
  return JSON.stringify(fields.map((f) => [f.name, f.type, f.complex ?? false, f.list, f.nillable, f.optional]));
}

function emitTypes(service, wsdl, shared) {
  const body = [];
  const out = [
    '/* eslint-disable */',
    '/**',
    ` * ${service} — request and response types.`,
    ' *',
    ' * Fields are optional unless an operation takes exactly one argument. The XSD marks almost',
    " * everything required, search filters included, so its requiredness describes JAXB's default",
    ' * rather than what n11 accepts — encoding it here would only force callers to pass',
    ' * placeholders.',
    ' *',
    ' * GENERATED FILE — do not edit by hand.',
    ` * Source: wsdl/${service}.wsdl · regenerate with \`npm run generate\`.`,
    ' */',
    '',
  ];

  // n11 sometimes declares a complexType with the same name as an operation's element
  // (ProductApprovalStatusResponse is both). The element is what travels on the wire, so it
  // keeps the name and the complexType is suffixed rather than dropped.
  const elementNames = new Set(wsdl.elements.keys());
  const renames = new Map();
  for (const name of wsdl.complexTypes.keys()) {
    if (elementNames.has(name)) renames.set(name, `${pascal(name)}Type`);
  }

  for (const [name, values] of wsdl.simpleTypes) {
    out.push(`export type ${pascal(name)} = ${values.map((v) => JSON.stringify(v)).join(' | ')};\n`);
  }
  for (const [name, fields] of wsdl.complexTypes) {
    // Types every service repeats verbatim live in common.types.ts, declared once.
    if (shared.has(name)) continue;
    // Nested types are optional throughout, for the same reason request fields are: the XSD's
    // requiredness is a default rather than a statement about what n11 accepts or returns.
    const renamed = renames.get(name);
    if (renamed) out.push(`/** The \`${name}\` complex type, distinct from the element of the same name. */`);
    out.push(emitInterface(renamed ?? pascal(name), fields, wsdl, { allOptional: true, renames }));
  }
  for (const operation of wsdl.operations) {
    for (const suffix of ['Request', 'Response']) {
      const fields = wsdl.elements.get(`${operation}${suffix}`);
      if (!fields) continue;
      // `auth` is supplied by the client, never by the caller.
      const visible = suffix === 'Request' ? fields.filter((f) => f.name !== 'auth') : fields;
      // Requiredness in these WSDLs is a JAXB default, not a decision: ~97% of elements are
      // marked required, search filters included. Encoding that in TypeScript would force
      // callers to pass placeholders for filters they do not want. So a request field is
      // required only when it is the operation's single argument — `productId` for
      // `GetProductByProductId`, `product` for `SaveProduct` — where the call is meaningless
      // without it. Everything else is optional, and n11's error messages remain the authority.
      const singleArgument = suffix === 'Request' && visible.length === 1;
      out.push(`/** \`${operation}\` ${suffix.toLowerCase()} body. */`);
      out.push(
        emitInterface(`${operation}${suffix}`, visible, wsdl, {
          allOptional: suffix === 'Response' || !singleArgument,
          alias: suffix === 'Request',
          renames,
        })
      );
    }
  }

  // Import only the shared types this service actually mentions: `noUnusedLocals` is on.
  const rendered = out.join('\n');
  const used = [...shared].filter((name) => new RegExp(`\\b${pascal(name)}\\b`).test(rendered)).sort();
  if (used.length) {
    const importLine = `import type { ${used.map(pascal).join(', ')} } from './common.types.js';\n`;
    const marker = out.indexOf('');
    out.splice(marker + 1, 0, importLine);
  }
  body.push(...out);
  return body.join('\n');
}

// ----------------------------------------------------------------- shapes ----

/** Serialise a field list as the runtime descriptor the codec walks. */
function shapeLiteral(fields) {
  const entries = fields.map((field) => {
    const parts = [`n:${JSON.stringify(field.name)}`, `t:${JSON.stringify(field.type)}`];
    if (field.complex) parts.push('c:1');
    if (field.list) parts.push('l:1');
    if (field.nillable) parts.push('x:1');
    return `{ ${parts.join(', ')} }`;
  });
  return `[${entries.join(', ')}]`;
}

function emitShapes(service, wsdl, module) {
  const out = [
    '/* eslint-disable */',
    '/**',
    ` * ${service} — the schema as runtime data.`,
    ' *',
    ' * The codec walks these descriptors so a one-element list is still an array and a seller',
    ' * code like `"0123"` survives as a string. Nothing here is guessed from the payload.',
    ' *',
    ' * GENERATED FILE — do not edit by hand. Run `npm run generate`.',
    ' */',
    "import type { ServiceShapes } from '../soap/shape.js';",
    '',
  ];

  const types = [...wsdl.complexTypes.entries()].map(
    ([name, fields]) => `  ${propKey(name)}: ${shapeLiteral(fields)},`
  );

  const operations = wsdl.operations
    .filter((operation) => wsdl.elements.has(`${operation}Request`))
    .map((operation) => {
      const request = wsdl.elements.get(`${operation}Request`) ?? [];
      const response = wsdl.elements.get(`${operation}Response`) ?? [];
      return `  ${propKey(operation)}: { request: ${shapeLiteral(request)}, response: ${shapeLiteral(response)} },`;
    });

  // Enumerations decode as plain strings; listing them keeps the shape self-describing.
  const enums = [...wsdl.simpleTypes.keys()].map((name) => JSON.stringify(name)).join(', ');

  out.push(`export const ${module}Shapes: ServiceShapes = {`);
  out.push(`  service: ${JSON.stringify(service)},`);
  out.push(`  endpoint: ${JSON.stringify(wsdl.endpoint)},`);
  out.push(`  enums: new Set([${enums}]),`);
  out.push('  types: {');
  out.push(...types);
  out.push('  },');
  out.push('  operations: {');
  out.push(...operations);
  out.push('  },');
  out.push('};');
  return out.join('\n');
}

// ------------------------------------------------------------------- main ----

const manifest = JSON.parse(readFileSync(join(WSDL_DIR, 'manifest.json'), 'utf8'));
const modules = [];
let totalOperations = 0;

// Pass 1: read every WSDL, and find the types they all repeat verbatim.
const parsed = manifest.services.map((entry) => ({
  entry,
  wsdl: readWsdl(readFileSync(join(WSDL_DIR, entry.file), 'utf8')),
}));

// Overlays are folded in before the sharing pass, so a type that production extends in one
// service is correctly no longer "identical everywhere" and stays per-service.
let overlaid = 0;
for (const { entry, wsdl } of parsed) {
  const { applied, obsolete } = applyOverlay(entry.service, wsdl);
  overlaid += applied;
  if (obsolete.length) {
    console.log(`  ~ ${entry.service}: WSDL now declares ${obsolete.join(', ')} — drop from the overlay`);
  }
}
if (overlaid) console.log(`overlays          ${overlaid} observed fields folded in (wsdl/overlays)`);

const occurrences = new Map(); // type name -> Set of distinct signatures
for (const { wsdl } of parsed) {
  for (const [name, fields] of wsdl.complexTypes) {
    if (!occurrences.has(name)) occurrences.set(name, { count: 0, signatures: new Set() });
    const record = occurrences.get(name);
    record.count++;
    record.signatures.add(signature(fields));
  }
}
const shared = new Set(
  [...occurrences.entries()]
    .filter(([, record]) => record.count > 1 && record.signatures.size === 1)
    .map(([name]) => name)
);
const conflicting = [...occurrences.entries()].filter(([, r]) => r.signatures.size > 1).map(([name]) => name);
if (conflicting.length) {
  // Same name, different shape: emitting either one would be a lie about the other.
  console.warn(`  ! services disagree on ${conflicting.join(', ')} — left per-service, check by hand`);
}

// Emit the shared declarations once, resolving them against the first WSDL that defines each.
const commonSource = parsed.find(({ wsdl }) => [...shared].every((name) => wsdl.complexTypes.has(name)))?.wsdl;
if (commonSource) {
  const lines = [
    '/* eslint-disable */',
    '/**',
    ' * Types every n11 service declares identically — authentication, paging and result envelopes.',
    ' *',
    ' * GENERATED FILE — do not edit by hand. Run `npm run generate`.',
    ' */',
    '',
  ];
  for (const name of [...shared].sort()) {
    lines.push(emitInterface(pascal(name), commonSource.complexTypes.get(name), commonSource, { allOptional: true }));
  }
  writeFileSync(join(OUT_DIR, 'common.types.ts'), lines.join('\n') + '\n');
  console.log(`common            ${String(shared.size).padStart(2)} shared types`);
}

for (const { entry, wsdl } of parsed) {
  const camel = entry.service.charAt(0).toLowerCase() + entry.service.slice(1);

  writeFileSync(join(OUT_DIR, `${entry.module}.types.ts`), emitTypes(entry.service, wsdl, shared) + '\n');
  writeFileSync(join(OUT_DIR, `${entry.module}.shape.ts`), emitShapes(entry.service, wsdl, camel) + '\n');

  modules.push({ module: entry.module, camel, operations: wsdl.operations, endpoint: wsdl.endpoint });
  totalOperations += wsdl.operations.length;
  console.log(
    `${entry.module.padEnd(18)} ${String(wsdl.operations.length).padStart(2)} operations, ` +
      `${wsdl.complexTypes.size} types, ${wsdl.simpleTypes.size} enums`
  );
}

writeFileSync(
  join(OUT_DIR, 'index.ts'),
  [
    '/**',
    ' * Barrel for the generated contract.',
    ' *',
    ' * GENERATED FILE — do not edit by hand. Run `npm run generate`.',
    ' */',
    '',
    "export type * from './common.types.js';",
    ...modules.map((m) => `export type * from './${m.module}.types.js';`),
    '',
    ...modules.map((m) => `export { ${m.camel}Shapes } from './${m.module}.shape.js';`),
    '',
  ].join('\n')
);

writeFileSync(
  join(WSDL_DIR, 'catalog.json'),
  JSON.stringify(
    modules.map(({ module, camel, operations, endpoint }) => ({ module, service: camel, endpoint, operations })),
    null,
    2
  ) + '\n'
);

console.log(`\n${totalOperations} operations across ${modules.length} services.`);

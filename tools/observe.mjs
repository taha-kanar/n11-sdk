/**
 * Compare the published WSDLs against what n11 actually returns.
 *
 * The WSDLs in `wsdl/` are n11's own, but they lag production: `ProductSku` is declared as an
 * empty complexType while every listing returns eleven elements inside it, and two operations
 * answer with a `result` element the schema never mentions — which is how a rate-limited call
 * used to decode as a successful empty page.
 *
 * This tool calls the read-only operations with real credentials, walks every element on the
 * wire against its declared shape, and reports what disagrees. Reviewed findings become entries
 * in `wsdl/overlays/*.json`, which `npm run generate` folds into the generated code.
 *
 *   N11_APP_KEY=… N11_APP_SECRET=… npm run observe
 *   N11_APP_KEY=… N11_APP_SECRET=… npm run observe -- --write   # also refresh wsdl/observation.json
 *
 * It runs against the built package (`npm run observe` builds first), so what it exercises is
 * exactly what a consumer would install.
 *
 * Two rules hold this tool to "safe to run against a live seller account":
 *
 * 1. Only operations on the {@link READ_ONLY} allowlist are ever called; anything else throws
 *    before a request is built. Nothing here creates, updates, ships or deletes.
 * 2. Values of fields that can identify a buyer are redacted before anything is printed or
 *    written. Order payloads carry names, e-mail addresses, phone numbers and national id
 *    numbers, and a drift report is not a place for them.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import {
  N11Client,
  categoryServiceShapes,
  cityServiceShapes,
  orderServiceShapes,
  productServiceShapes,
  shipmentCompanyServiceShapes,
  shipmentServiceShapes,
} from '../dist/index.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const SHAPES = {
  CategoryService: categoryServiceShapes,
  CityService: cityServiceShapes,
  OrderService: orderServiceShapes,
  ProductService: productServiceShapes,
  ShipmentCompanyService: shipmentCompanyServiceShapes,
  ShipmentService: shipmentServiceShapes,
};

/** The only operations this tool may call. Every one of them is a read. */
const READ_ONLY = new Set([
  'GetTopLevelCategories', 'GetSubCategories', 'GetParentCategory',
  'GetCategoryAttributes', 'GetCategoryAttributesId', 'GetCategoryAttributeValue',
  'GetCities', 'GetCity', 'GetDistrict', 'GetNeighborhoods',
  'GetShipmentCompanies', 'GetShipmentTemplateList', 'GetShipmentTemplate',
  'GetProductList', 'SearchProducts', 'GetProductByProductId', 'GetProductBySellerCode',
  'ProductApprovalStatus', 'GetProductQuestionList', 'GetProductQuestionDetail',
  'OrderList', 'DetailedOrderList', 'OrderDetail',
]);

/** Fields whose values identify a person. Names are reported; values never are. */
const SENSITIVE = new Set([
  'fullName', 'email', 'gsm', 'tcId', 'taxId', 'taxHouse', 'taxOffice', 'address',
  'phoneNumber', 'tcNo', 'buyerName', 'recipient', 'citizenshipId', 'question', 'answer',
  'shipmenCompanyCampaignNumber', 'trackingNumber',
]);

const parser = new XMLParser({
  ignoreAttributes: false, attributeNamePrefix: '@', parseTagValue: false,
  parseAttributeValue: false, trimValues: true, isArray: () => false, removeNSPrefix: true,
});

// ------------------------------------------------------------- comparison ----

const NUMERIC = /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/;
const BOOLEAN = /^(true|false|0|1)$/;
const isNil = (n) => typeof n === 'object' && n !== null && n['@nil'] === 'true';

const redact = (name, value) => {
  if (SENSITIVE.has(name)) return `<${String(value).length} chars, redacted>`;
  return String(value).slice(0, 60);
};

function sample(name, value) {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return `array[${value.length}]`;
  if (typeof value === 'object') {
    const keys = Object.keys(value).filter((k) => !k.startsWith('@') && k !== '#text');
    return keys.length ? `object{${keys.slice(0, 8).join(',')}}` : 'empty';
  }
  return redact(name, value);
}

/** Guess an XSD type for an undeclared element, conservatively. */
function inferType(name, values) {
  if (!values.length) return 'unknown';
  if (values.every((v) => BOOLEAN.test(v) && /^(true|false)$/.test(v))) return 'boolean';
  // A leading zero means the value is an identifier, not a quantity — never call it a number.
  if (values.every((v) => NUMERIC.test(v)) && !values.some((v) => /^0\d/.test(v))) return 'number';
  return 'string';
}

function compare(shapes, operation, element) {
  const findings = [];
  const undeclared = new Map(); // "Owner.field" -> observed values

  const walk = (fields, node, owner, path, depth) => {
    if (depth > 12 || node === null || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(fields, item, owner, path, depth);
      return;
    }
    const byName = new Map(fields.map((f) => [f.n, f]));
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('@') || key === '#text') continue;
      const child = `${path}.${key}`;
      const field = byName.get(key);

      if (!field) {
        findings.push({ kind: 'undeclared-field', path: child, owner, actual: sample(key, value) });
        const bucket = `${owner}.${key}`;
        if (!undeclared.has(bucket)) undeclared.set(bucket, []);
        const seen = undeclared.get(bucket);
        for (const item of [].concat(value)) {
          if (item !== null && typeof item !== 'object' && String(item) !== '' && seen.length < 8) {
            seen.push(String(item));
          }
        }
        continue;
      }

      if (Array.isArray(value) && !field.l) {
        findings.push({
          kind: 'repeats-but-declared-single', path: child, owner,
          expected: `maxOccurs=1 (${field.t})`, actual: `${value.length} occurrences`,
        });
      }

      for (const item of [].concat(value)) {
        if (field.c) {
          const nested = shapes.types[field.t];
          if (!nested) {
            if (!shapes.enums.has(field.t)) findings.push({ kind: 'unknown-type', path: child, owner, expected: field.t });
          } else if (item !== null && typeof item === 'object' && !isNil(item)) {
            walk(nested, item, field.t, child, depth + 1);
          }
          continue;
        }
        if (isNil(item)) {
          if (!field.x) findings.push({ kind: 'nil-but-not-nillable', path: child, owner, expected: field.t });
          continue;
        }
        if (item !== null && typeof item === 'object') {
          const keys = Object.keys(item).filter((k) => !k.startsWith('@') && k !== '#text');
          if (keys.length) {
            findings.push({
              kind: 'complex-for-scalar', path: child, owner,
              expected: field.t, actual: `children: ${keys.slice(0, 6).join(', ')}`,
            });
          }
          continue;
        }
        const text = item === null ? '' : String(item);
        if (text === '') continue;
        if (field.t === 'number' && !NUMERIC.test(text)) {
          findings.push({ kind: 'not-a-number', path: child, owner, expected: 'number', actual: redact(key, text) });
        }
        if (field.t === 'boolean' && !BOOLEAN.test(text)) {
          findings.push({ kind: 'not-a-boolean', path: child, owner, expected: 'boolean', actual: redact(key, text) });
        }
      }
    }
  };

  const op = shapes.operations[operation];
  if (!op) return { findings: [{ kind: 'unknown-operation', path: operation }], undeclared };
  walk(op.response, element, `@op:${operation}`, operation, 0);
  return { findings, undeclared };
}

// ------------------------------------------------------------------ probe ----

const appKey = process.env.N11_APP_KEY;
const appSecret = process.env.N11_APP_SECRET;
if (!appKey || !appSecret) {
  console.error('N11_APP_KEY and N11_APP_SECRET must be set. They are read from the environment and never written anywhere.');
  process.exit(1);
}

const exchanges = [];
const guard = {
  name: 'observe',
  async handle(request, next) {
    const { operation } = request.context;
    if (!READ_ONLY.has(operation)) {
      throw new Error(`observe refuses to call "${operation}": not on the read-only allowlist`);
    }
    const startedAt = Date.now();
    const response = await next(request);
    exchanges.push({
      service: request.context.service, operation,
      status: response.status, bytes: response.body?.length ?? 0,
      ms: Date.now() - startedAt, xml: response.body,
    });
    return response;
  },
};

const n11 = new N11Client({ appKey, appSecret, timeoutMs: 60_000, middleware: [guard] });
const outcomes = [];

async function step(label, fn) {
  try {
    const value = await fn();
    outcomes.push({ label, ok: true });
    console.log(`  ok    ${label}`);
    return value;
  } catch (error) {
    outcomes.push({ label, ok: false, error: error.name, code: error.errorCode ?? null });
    console.log(`  fail  ${label} — ${error.name}: ${error.errorMessage ?? error.message}`);
    return undefined;
  }
}

const one = (v) => [].concat(v ?? [])[0];
const paging = (pageSize) => ({ currentPage: 0, pageSize });

console.log('CategoryService');
const top = await step('categories.topLevel', () => n11.categories.topLevel());
const rootId = one(top?.categoryList?.category)?.id;
let leafId;
if (rootId) {
  // Attribute calls only accept a bottom-level category, so walk down until the tree ends.
  let current = rootId;
  for (let depth = 0; depth < 4; depth++) {
    const res = await step(`categories.subCategories(${current})`, () => n11.categories.subCategories({ categoryId: current }));
    const next = one(one(res?.category)?.subCategoryList?.subCategory)?.id;
    if (!next) break;
    leafId = current = next;
  }
  if (leafId) {
    await step('categories.parent', () => n11.categories.parent(leafId));
    await step('categories.attributes', () => n11.categories.attributes({ categoryId: leafId, pagingData: paging(10) }));
    const ids = await step('categories.attributeIds', () => n11.categories.attributeIds(leafId));
    const attributeId = one(ids?.categoryProductAttributeList?.categoryProductAttribute)?.id;
    if (attributeId) {
      await step('categories.attributeValues', () =>
        n11.categories.attributeValues({ categoryProductAttributeId: attributeId, categoryId: leafId, pagingData: paging(10) })
      );
    }
  }
}

console.log('CityService');
const cities = await step('cities.list', () => n11.cities.list());
const city = ([].concat(cities?.cities?.city ?? [])).find((c) => String(c.cityCode) === '34') ?? one(cities?.cities?.city);
if (city) {
  await step(`cities.get(${city.cityCode})`, () => n11.cities.get(Number(city.cityCode)));
  const districts = await step(`cities.districts(${city.cityCode})`, () => n11.cities.districts(Number(city.cityCode)));
  const districtId = one(districts?.districts?.district)?.id;
  if (districtId) await step('cities.neighborhoods', () => n11.cities.neighborhoods(Number(districtId)));
}

console.log('ShipmentCompanyService / ShipmentService');
await step('shipmentCompanies.list', () => n11.shipmentCompanies.list());
const templates = await step('shipments.listTemplates', () => n11.shipments.listTemplates({ pagingData: paging(10) }));
const templateName = one(templates?.shipmentTemplates?.shipmentTemplate)?.templateName;
if (templateName) await step('shipments.getTemplate', () => n11.shipments.getTemplate(String(templateName)));

console.log('ProductService');
const products = await step('products.list', () => n11.products.list({ pagingData: paging(5) }));
const product = one(products?.products?.product);
if (product?.id) await step('products.getById', () => n11.products.getById(Number(product.id)));
if (product?.productSellerCode) {
  await step('products.getBySellerCode', () => n11.products.getBySellerCode(String(product.productSellerCode)));
}
await step('products.search', () => n11.products.search({ pagingData: paging(5), productSearch: {} }));
await step('products.approvalStatus', () => n11.products.approvalStatus());
const questions = await step('products.questions', () => n11.products.questions({ pagingData: paging(5), productQuestionSearch: {} }));
const questionId = one(questions?.productQuestions?.productQuestion)?.id;
if (questionId) await step('products.question', () => n11.products.question(Number(questionId)));

console.log('OrderService');
const orders = await step('orders.list', () => n11.orders.list({ searchData: {}, pagingData: paging(5) }));
const orderId = one(orders?.orderList?.order)?.id;
if (orderId) await step('orders.detail', () => n11.orders.detail({ orderRequest: { id: Number(orderId) } }));
await step('orders.listDetailed', () => n11.orders.listDetailed({ searchData: {}, pagingData: paging(5) }));

// ----------------------------------------------------------------- report ----

console.log('\n=== schema vs. reality ===');
const report = [];
const suggestions = new Map(); // "Service|Owner|field" -> {type, count}

for (const exchange of exchanges) {
  const shapes = SHAPES[exchange.service];
  if (!shapes) continue;
  const element = parser.parse(exchange.xml)?.Envelope?.Body?.[`${exchange.operation}Response`];
  if (!element || typeof element !== 'object') continue;

  const { findings, undeclared } = compare(shapes, exchange.operation, element);
  report.push({
    service: exchange.service, operation: exchange.operation,
    status: exchange.status, bytes: exchange.bytes,
    findings: findings.map(({ kind, path, expected, actual }) => ({ kind, path, expected, actual })),
  });

  for (const [bucket, values] of undeclared) {
    const [owner, field] = [bucket.slice(0, bucket.lastIndexOf('.')), bucket.slice(bucket.lastIndexOf('.') + 1)];
    const key = `${exchange.service}|${owner}|${field}`;
    if (!suggestions.has(key)) suggestions.set(key, { type: inferType(field, values), count: 0 });
    suggestions.get(key).count++;
  }

  if (findings.length) {
    console.log(`\n${exchange.service}.${exchange.operation} — ${findings.length} finding(s)`);
    for (const finding of collapse(findings)) {
      console.log(
        `  [${finding.kind}] ${finding.path}` +
          (finding.expected ? ` expected=${finding.expected}` : '') +
          (finding.actual ? ` actual=${finding.actual}` : '') +
          (finding.times > 1 ? ` (x${finding.times})` : '')
      );
    }
  }
}

const clean = report.filter((r) => !r.findings.length).length;
console.log(`\n${clean}/${report.length} probed operations matched the WSDL exactly.`);

if (suggestions.size) {
  console.log('\nOverlay candidates — review each before adding it to wsdl/overlays:');
  for (const [key, { type }] of [...suggestions].sort()) {
    const [service, owner, field] = key.split('|');
    console.log(`  ${service.padEnd(22)} ${owner.padEnd(28)} ${field.padEnd(30)} ${type}`);
  }
  console.log('\n  Prefer a type n11 already declares for the same field name elsewhere in the service');
  console.log('  over the inferred one: a sample without a leading zero says nothing about the next one.');
}

if (process.argv.includes('--write')) {
  // Field *names* and counts only. Values stay out of the repository.
  const file = join(ROOT, 'wsdl', 'observation.json');
  writeFileSync(file, JSON.stringify({
    observedAt: new Date().toISOString().slice(0, 10),
    endpoint: 'https://api.n11.com/ws',
    note: 'Written by tools/observe.mjs. Records which operations were exercised and which elements disagreed with the WSDL. No payload values are stored.',
    outcomes,
    operations: report.map(({ service, operation, status, bytes, findings }) => ({
      service, operation, status, bytes,
      findings: collapse(findings).map(({ kind, path, expected, times }) => ({ kind, path, expected, times })),
    })),
  }, null, 2) + '\n');
  console.log(`\nwrote wsdl/observation.json (${report.length} operations, no payload values)`);
}

function collapse(findings) {
  const map = new Map();
  for (const finding of findings) {
    const key = `${finding.kind}|${finding.path}|${finding.expected ?? ''}`;
    const hit = map.get(key);
    if (hit) hit.times++;
    else map.set(key, { ...finding, times: 1 });
  }
  return [...map.values()];
}

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as generated from '../src/generated/index.js';
import type { ServiceShapes } from '../src/index.js';

/**
 * Guards the SDK against n11 changing its contract.
 *
 * `wsdl/catalog.json` is regenerated from the WSDLs, so after
 * `npm run fetch-wsdl && npm run generate` these tests fail the moment n11 adds, removes,
 * renames or re-routes an operation. That failure is the point: a documentation change that
 * would otherwise surface as a production SOAP fault becomes a red build.
 */

const ROOT = join(__dirname, '..');

interface CatalogEntry {
  module: string;
  service: string;
  endpoint: string;
  operations: string[];
}

const catalog: CatalogEntry[] = JSON.parse(readFileSync(join(ROOT, 'wsdl', 'catalog.json'), 'utf8'));
const documented = catalog.flatMap((entry) => entry.operations.map((operation) => ({ ...entry, operation })));

/** Every operation name the service classes actually call. */
function readImplementedOperations(): Map<string, string> {
  const implemented = new Map<string, string>();
  const dir = join(ROOT, 'src', 'resources');

  for (const file of readdirSync(dir).filter((f) => f.endsWith('.service.ts'))) {
    const source = readFileSync(join(dir, file), 'utf8');
    for (const [, operation] of source.matchAll(/this\.call<[^>]*>\(\s*'(\w+)'/g)) {
      implemented.set(operation!, file);
    }
  }
  return implemented;
}

const implemented = readImplementedOperations();
const shapesByService = new Map(
  Object.values(generated as Record<string, unknown>)
    .filter((value): value is ServiceShapes => typeof value === 'object' && value !== null && 'operations' in value)
    .map((shapes) => [shapes.service, shapes])
);

describe('wsdl coverage', () => {
  it('implements every documented operation, and nothing else', () => {
    expect(implemented.size).toBe(documented.length);

    const documentedNames = new Set(documented.map((entry) => entry.operation));
    const orphans = [...implemented.keys()].filter((operation) => !documentedNames.has(operation));
    expect(orphans, 'these operations are gone from the WSDLs').toEqual([]);
  });

  it.each(documented)('implements $operation ($module)', ({ operation }) => {
    expect(implemented.get(operation), `${operation} is documented but no service calls it`).toBeDefined();
  });

  it.each(catalog)('generates shapes for $service at its own endpoint', (entry) => {
    const shapes = shapesByService.get(entry.service.charAt(0).toUpperCase() + entry.service.slice(1));
    expect(shapes, `no generated shapes for ${entry.service}`).toBeDefined();
    expect(shapes!.endpoint).toBe(entry.endpoint);

    for (const operation of entry.operations) {
      expect(Object.keys(shapes!.operations), `${operation} missing from shapes`).toContain(operation);
    }
  });

  it('gives every operation an auth element somewhere in its request', () => {
    for (const shapes of shapesByService.values()) {
      for (const [operation, shape] of Object.entries(shapes.operations)) {
        const auth = shape.request.find((field) => field.n === 'auth');
        expect(auth, `${operation} has no auth element`).toBeDefined();
        expect(auth!.t).toBe('Authentication');
      }
    }
  });

  it('records that three CityService operations declare auth last', () => {
    // Not a quirk worth hiding: it is why the envelope builder places auth by schema position
    // rather than always first. If n11 ever normalises this, the test says so.
    const city = shapesByService.get('CityService')!;
    const authLast = Object.entries(city.operations)
      .filter(([, shape]) => shape.request.length > 1 && shape.request[0]?.n !== 'auth')
      .map(([operation]) => operation);

    expect(authLast.sort()).toEqual(['GetCity', 'GetDistrict', 'GetNeighborhoods']);
  });
});

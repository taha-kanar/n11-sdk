/**
 * Refresh `wsdl/*.wsdl` from n11.
 *
 *   node tools/fetch-wsdl.mjs            # refresh everything
 *   node tools/fetch-wsdl.mjs OrderService ProductService
 *
 * Afterwards run `npm run generate` and review the diff: a changed WSDL means n11 changed the
 * contract, and `npm test` will say whether the service classes still line up.
 *
 * Note that only six of n11's nine services publish a WSDL. `api.n11.com` answers 405 for
 * `ProductStockService`, `ProductSellingService` and `WebHookService` — the same 405 it gives
 * for a service name that does not exist — so there is nothing to fetch. Reach those through
 * `N11Client.call`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WSDL_DIR = join(ROOT, 'wsdl');

const manifest = JSON.parse(readFileSync(join(WSDL_DIR, 'manifest.json'), 'utf8'));
const only = process.argv.slice(2);
const targets = only.length ? manifest.services.filter((s) => only.includes(s.service)) : manifest.services;

if (!targets.length) {
  console.error(`No services matched: ${only.join(', ')}`);
  process.exit(1);
}

let changed = 0;

for (const entry of targets) {
  try {
    const response = await fetch(entry.wsdlUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const xml = await response.text();
    if (!xml.includes('<wsdl:definitions')) throw new Error('response is not a WSDL');

    const target = join(WSDL_DIR, entry.file);
    let previous = '';
    try {
      previous = readFileSync(target, 'utf8');
    } catch {
      // First fetch of a newly added service.
    }

    writeFileSync(target, xml);
    const operations = new Set([...xml.matchAll(/<wsdl:operation name="(\w+)"/g)].map((m) => m[1]));
    if (previous !== xml) changed++;
    console.log(
      `${previous === xml ? 'unchanged' : 'updated  '} ${entry.service.padEnd(24)} ${String(operations.size).padStart(2)} operations`
    );
  } catch (error) {
    console.error(`failed    ${entry.service.padEnd(24)} ${error.message}`);
    process.exitCode = 1;
  }
}

console.log(
  changed
    ? `\n${changed} WSDL(s) changed — run \`npm run generate\` and check the diff.`
    : '\nAll WSDLs already up to date.'
);

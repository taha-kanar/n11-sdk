import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { N11ApiError, productServiceShapes, orderServiceShapes, categoryServiceShapes, shipmentServiceShapes } from '../src/index.js';
import type { FieldShape, ServiceShapes } from '../src/index.js';
import { createTestClient } from './support/client.js';

/**
 * What production returns, as opposed to what the WSDL promises.
 *
 * Every expectation here was observed against api.n11.com (see `tools/observe.mjs` and
 * `wsdl/observation.json`) and encoded in `wsdl/overlays/*.json`. They exist so that a future
 * `npm run fetch-wsdl && npm run generate` cannot quietly drop a correction: if n11 publishes a
 * WSDL that omits these again, the overlay keeps them and these tests keep passing; if the
 * overlay is deleted, they fail.
 */

const ROOT = join(__dirname, '..');
const OVERLAY_DIR = join(ROOT, 'wsdl', 'overlays');

const field = (shapes: ServiceShapes, type: string, name: string): FieldShape | undefined =>
  shapes.types[type]?.find((f) => f.n === name);

describe('in-band failures the schema does not predict', () => {
  it('surfaces the rate-limit refusal that used to decode as an empty page', async () => {
    // GetProductQuestionList has no `result` element in the WSDL at all, so this call reported
    // success and an empty list. Two independent changes now catch it: the overlay declares the
    // `result`, and the transport checks the decoded body rather than the schema.
    const { client, http } = createTestClient();
    http.enqueue({
      status: 200,
      body:
        '<?xml version="1.0"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<SOAP-ENV:Body><ns3:GetProductQuestionListResponse xmlns:ns3="http://www.n11.com/ws/schemas">' +
        '<result><status>failure</status>' +
        '<errorCode>SELLER_API.getProductQuestionListRequest.accessLimit.reached</errorCode>' +
        '<errorMessage>Ürün soruları 1 dakikada bir kez listelenebilmektedir.</errorMessage>' +
        '<errorCategory>SELLER_API</errorCategory></result>' +
        '<productQuestions/></ns3:GetProductQuestionListResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>',
    });

    await expect(client.products.questions({ pagingData: { currentPage: 0, pageSize: 5 } })).rejects.toThrow(
      N11ApiError
    );
  });

  it('reports n11s own error code rather than a generic message', async () => {
    const { client, http } = createTestClient();
    http.enqueue({
      status: 200,
      body:
        '<?xml version="1.0"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<SOAP-ENV:Body><ns3:GetProductQuestionListResponse xmlns:ns3="http://www.n11.com/ws/schemas">' +
        '<result><status>failure</status><errorCode>SELLER_API.accessLimit.reached</errorCode>' +
        '<errorMessage>limit</errorMessage></result>' +
        '</ns3:GetProductQuestionListResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>',
    });

    await expect(client.products.questions({})).rejects.toMatchObject({
      errorCode: 'SELLER_API.accessLimit.reached',
      errorMessage: 'limit',
    });
  });

  it('leaves ProductApprovalStatus alone, whose result carries counts rather than a status', async () => {
    const { client, http } = createTestClient();
    http.enqueueSoap(
      'ProductApprovalStatus',
      '',
      '<result><approvedCount>12</approvedCount><waitingCount>3</waitingCount><totalCount>15</totalCount></result>'
    );

    const response = await client.products.approvalStatus();
    expect(response.result?.approvedCount).toBe(12);
    expect(response.result?.totalCount).toBe(15);
  });

  it('checks operations reached through the untyped escape hatch too', async () => {
    // The load-bearing half of that fix: the three services whose WSDL n11 no longer publishes
    // have no schema at all, so the failure check cannot depend on one. Restoring the old
    // schema-gated check fails this test and only this test.
    const { client, http } = createTestClient();
    http.enqueue({
      status: 200,
      body:
        '<?xml version="1.0"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<SOAP-ENV:Body><ns3:UpdateStockByStockIdResponse xmlns:ns3="http://www.n11.com/ws/schemas">' +
        '<result><status>failure</status><errorMessage>stok bulunamadı</errorMessage></result>' +
        '</ns3:UpdateStockByStockIdResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>',
    });

    await expect(
      client.call('https://api.n11.com/ws/productStockService/', 'UpdateStockByStockId', {})
    ).rejects.toMatchObject({ errorMessage: 'stok bulunamadı' });
  });
});

describe('overlays: fields production sends that the WSDL omits', () => {
  it('gives ProductSku the eleven elements every listing returns', () => {
    // The WSDL declares ProductSku as an empty complexType; without the overlay a caller could
    // not read the stock id or quantity off a product listing at all.
    const names = productServiceShapes.types['ProductSku']?.map((f) => f.n) ?? [];
    expect(names).toEqual(
      expect.arrayContaining([
        'id', 'quantity', 'sellerStockCode', 'n11CatalogId', 'optionPrice',
        'displayPrice', 'currencyAmount', 'bundle', 'version', 'attributes', 'images',
      ])
    );
  });

  it('keeps a seller stock code a string and a quantity a number', () => {
    expect(field(productServiceShapes, 'ProductSku', 'sellerStockCode')?.t).toBe('string');
    expect(field(productServiceShapes, 'ProductSku', 'quantity')?.t).toBe('number');
  });

  it('decodes a stock item without renumbering a leading-zero seller code', async () => {
    const { client, http } = createTestClient();
    http.enqueueSoap(
      'GetProductByProductId',
      '<product><id>1</id><stockItems><stockItem>' +
        '<sellerStockCode>00742</sellerStockCode><quantity>7</quantity><id>127371500417</id>' +
        '</stockItem></stockItems></product>'
    );

    const { product } = await client.products.getById(1);
    const sku = product?.stockItems?.stockItem?.[0];
    expect(sku?.sellerStockCode).toBe('00742');
    expect(sku?.quantity).toBe(7);
    expect(sku?.id).toBe(127371500417);
  });

  it('gives DetailedOrderList the buyer and addresses it omits, reusing n11s own types', () => {
    expect(field(orderServiceShapes, 'DetailedOrderData', 'buyer')?.t).toBe('BuyerWithTaxFields');
    expect(field(orderServiceShapes, 'DetailedOrderData', 'shippingAddress')?.t).toBe('AddressModel');
    expect(field(orderServiceShapes, 'DetailedOrderData', 'billingAddress')?.t).toBe('AddressModel');
  });

  it('keeps postal codes and identity numbers as strings', () => {
    // A Turkish postal code can start with a zero (Adana is 01xxx). Inferring `number` from a
    // sample that happened not to would corrupt one in eighty-one cities.
    expect(field(orderServiceShapes, 'AddressModel', 'postalCode')?.t).toBe('string');
    expect(field(orderServiceShapes, 'AddressModel', 'tcId')?.t).toBe('string');
    expect(field(orderServiceShapes, 'OrderItemData', 'shipmenCompanyCampaignNumber')?.t).toBe('string');
  });

  it('carries lastModifiedDate on every category type, so an incremental sync is possible', () => {
    for (const type of ['CategoryData', 'SubCategoryData', 'ParentCategoryData', 'ParentCategory']) {
      expect(field(categoryServiceShapes, type, 'lastModifiedDate')?.t).toBe('string');
    }
  });

  it('adds the shipment template fee condition returned on both addresses', () => {
    expect(field(shipmentServiceShapes, 'ShipmentSaveAddress', 'feeCondition')?.t).toBe('number');
    expect(field(shipmentServiceShapes, 'ShipmentSaveAddress', 'feeConditionPrice')?.t).toBe('number');
  });
});

describe('overlay documents', () => {
  const files = readdirSync(OVERLAY_DIR).filter((name) => name.endsWith('.json'));

  it('exist for the services observation found gaps in', () => {
    expect(files.sort()).toEqual([
      'CategoryService.json', 'OrderService.json', 'ProductService.json', 'ShipmentService.json',
    ]);
  });

  it.each(files)('%s records evidence for every field it adds', (name) => {
    const overlay = JSON.parse(readFileSync(join(OVERLAY_DIR, name), 'utf8'));
    const entries = [
      ...Object.values(overlay.types ?? {}).flat(),
      ...Object.values(overlay.operations ?? {}).flatMap((patch: any) => [
        ...(patch.request ?? []), ...(patch.response ?? []),
      ]),
    ] as Array<{ name: string; type: string; evidence?: string; sample?: string }>;

    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      // An overlay entry without evidence is a guess, and guesses are what this SDK exists to avoid.
      expect(entry.evidence, `${name}: ${entry.name} has no evidence`).toBeTruthy();
      expect(entry.sample, `${name}: ${entry.name} has no sample`).toBeTruthy();
    }
    expect(overlay.observedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('never records a value that could identify a buyer', () => {
    // Order payloads carry names, e-mail addresses, phone numbers and national id numbers.
    // They are read during observation and must not survive into the repository.
    const corpus = [
      ...files.map((name) => readFileSync(join(OVERLAY_DIR, name), 'utf8')),
      readFileSync(join(ROOT, 'wsdl', 'observation.json'), 'utf8'),
    ].join('\n');

    expect(corpus).not.toMatch(/@[a-z0-9.-]+\.(com|net|org|tr)\b/i); // e-mail addresses
    expect(corpus).not.toMatch(/\b\d{11}\b/); // TC kimlik numbers
    expect(corpus).not.toMatch(/\b5\d{9}\b/); // GSM numbers
  });
});

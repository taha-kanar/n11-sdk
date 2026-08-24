import { describe, expect, it } from 'vitest';
import {
  N11ApiError,
  N11HttpError,
  N11ParseError,
  N11SoapFaultError,
  N11TimeoutError,
  type Middleware,
} from '../src/index.js';
import { createTestClient } from './support/client.js';

const fault =
  '<?xml version="1.0"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">' +
  '<SOAP-ENV:Body><SOAP-ENV:Fault><faultcode>SOAP-ENV:Client</faultcode>' +
  '<faultstring>Unmarshalling Error</faultstring></SOAP-ENV:Fault></SOAP-ENV:Body></SOAP-ENV:Envelope>';

describe('transport', () => {
  it('sends credentials in the body, not in a header', async () => {
    const { client, http } = createTestClient();
    await client.categories.topLevel();

    const { envelope, request } = http.lastCall;
    expect(envelope).toContain('<auth><appKey>test-key</appKey><appSecret>test-secret</appSecret></auth>');
    expect(Object.keys(request.headers)).not.toContain('authorization');
  });

  it('posts to the service endpoint from the WSDL, not the WSDL URL', async () => {
    const { client, http } = createTestClient();
    await client.categories.topLevel();

    expect(http.lastCall.request.url).toBe('https://api.n11.com/ws/categoryService/');
    expect(http.lastCall.request.method).toBe('POST');
  });

  it('sends the SOAP 1.1 headers n11 expects', async () => {
    const { client, http } = createTestClient();
    await client.cities.list();

    expect(http.lastCall.request.headers['content-type']).toBe('text/xml; charset=utf-8');
    expect(http.lastCall.request.headers['soapaction']).toBe('""');
  });

  it('places auth where the schema declares it, not always first', async () => {
    const { client, http } = createTestClient();

    // CategoryService declares auth first...
    await client.categories.topLevel();
    expect(http.lastCall.envelope).toContain('<sch:GetTopLevelCategoriesRequest><auth>');

    // ...while GetCity declares it after cityCode. document/literal binds by position, so the
    // envelope has to follow.
    await client.cities.get(34);
    expect(http.lastCall.envelope).toContain('<sch:GetCityRequest><cityCode>34</cityCode><auth>');
  });

  it('names the request element after the operation', async () => {
    const { client, http } = createTestClient();
    await client.products.getById(42);

    expect(http.lastCall.envelope).toContain('<sch:GetProductByProductIdRequest>');
    expect(http.lastCall.envelope).toContain('<productId>42</productId>');
  });

  it('routes each service to its own endpoint', async () => {
    const { client, http } = createTestClient();
    await client.orders.list({ searchData: {}, pagingData: { currentPage: 0, pageSize: 10 } });
    expect(http.lastCall.request.url).toBe('https://api.n11.com/ws/orderService/');

    await client.shipmentCompanies.list();
    expect(http.lastCall.request.url).toBe('https://api.n11.com/ws/shipmentCompanyService/');
  });

  it('honours a baseUrl override while keeping each service path', async () => {
    const { client, http } = createTestClient({ baseUrl: 'http://localhost:8080' });
    await client.cities.list();

    expect(http.lastCall.request.url).toBe('http://localhost:8080/ws/cityService/');
  });

  it('decodes a response into the shape the WSDL declares', async () => {
    const { client, http } = createTestClient();
    http.enqueueSoap(
      'GetTopLevelCategories',
      '<categoryList><category><id>1000</id><name>Elektronik</name></category></categoryList>'
    );

    const response = await client.categories.topLevel();
    expect(response.categoryList?.category).toEqual([{ id: 1000, name: 'Elektronik' }]);
  });

  it('throws when n11 reports failure inside a 200', async () => {
    const { client, http } = createTestClient();
    http.enqueueSoap(
      'GetCities',
      '',
      '<result><status>failure</status><errorCode>SELLER_API.invalidAuth</errorCode>' +
        '<errorMessage>Geçersiz kullanıcı</errorMessage><errorCategory>AUTHENTICATION</errorCategory></result>'
    );

    const error = await client.cities.list().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(N11ApiError);
    expect((error as N11ApiError).errorCode).toBe('SELLER_API.invalidAuth');
    expect((error as N11ApiError).errorMessage).toBe('Geçersiz kullanıcı');
    expect((error as N11ApiError).errorCategory).toBe('AUTHENTICATION');
    expect((error as N11ApiError).context.status).toBe(200);
  });

  it('does not read ProductApprovalStatus counts as a failure', async () => {
    const { client, http } = createTestClient();
    http.enqueueSoap('ProductApprovalStatus', '', '<result><approvedCount>5</approvedCount><totalCount>7</totalCount></result>');

    const response = await client.products.approvalStatus();
    expect(response.result).toEqual({ approvedCount: 5, totalCount: 7 });
  });

  it('turns a SOAP fault into a typed error', async () => {
    const { client, http } = createTestClient();
    http.enqueue({ status: 500, body: fault });

    const error = await client.cities.list().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(N11SoapFaultError);
    expect((error as N11SoapFaultError).faultString).toBe('Unmarshalling Error');
  });

  it('reports a non-envelope body by status', async () => {
    const { client, http } = createTestClient();
    http.enqueue({ status: 502, body: '<html>bad gateway</html>' });

    await expect(client.cities.list()).rejects.toBeInstanceOf(N11HttpError);
  });

  it('reports a 200 that is not an envelope as a parse error', async () => {
    const { client, http } = createTestClient();
    http.enqueue({ status: 200, body: 'not xml at all' });

    await expect(client.cities.list()).rejects.toBeInstanceOf(N11ParseError);
  });

  it('runs middleware outermost-first', async () => {
    const order: string[] = [];
    const trace = (name: string): Middleware => ({
      name,
      async handle(request, next) {
        order.push(`>${name}`);
        const response = await next(request);
        order.push(`<${name}`);
        return response;
      },
    });

    const { client } = createTestClient({ middleware: [trace('outer'), trace('inner')] });
    await client.cities.list();
    expect(order).toEqual(['>outer', '>inner', '<inner', '<outer']);
  });

  it('surfaces an aborted call as a timeout error', async () => {
    const controller = new AbortController();
    controller.abort();

    const { client } = createTestClient({
      // The real fetch rejects when handed an already-aborted signal; mimic that.
      fetch: async (_url, init) => {
        if ((init.signal as AbortSignal).aborted) throw new Error('The operation was aborted');
        throw new Error('unreachable');
      },
    });

    await expect(client.cities.list({ signal: controller.signal })).rejects.toBeInstanceOf(N11TimeoutError);
  });

  it('rejects a client without credentials', () => {
    expect(() => createTestClient({ appKey: '' })).toThrow(/appKey/);
  });

  it('reuses one instance per service', () => {
    const { client } = createTestClient();
    expect(client.orders).toBe(client.orders);
  });
});

describe('escape hatch', () => {
  it('calls an operation the SDK does not type', async () => {
    const { client, http } = createTestClient();
    http.enqueueSoap('UpdateStockByStockId', '<stockItems><stockItem><id>1</id></stockItem></stockItems>');

    const result = await client.call<{ stockItems: unknown }>(
      'https://api.n11.com/ws/productStockService/',
      'UpdateStockByStockId',
      { stockItems: { stockItem: [{ id: 1, quantity: 5 }] } }
    );

    expect(http.lastCall.request.url).toBe('https://api.n11.com/ws/productStockService/');
    expect(http.lastCall.envelope).toContain('<sch:UpdateStockByStockIdRequest>');
    expect(http.lastCall.envelope).toContain('<stockItem><id>1</id><quantity>5</quantity></stockItem>');
    expect(http.lastCall.envelope).toContain('<appKey>test-key</appKey>');
    expect(result.stockItems).toBeDefined();
  });
});

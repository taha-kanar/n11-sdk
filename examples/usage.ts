/**
 * The snippets from README.md, kept compiling.
 *
 * `npm run typecheck` includes this file, so an example that drifts out of date with the
 * generated types breaks the build instead of misleading a reader.
 */
import {
  N11ApiError,
  N11Client,
  N11Error,
  N11SoapFaultError,
  type HttpClient,
  type HttpRequest,
  type HttpResponse,
  type Middleware,
} from '../src/index.js';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const n11 = new N11Client({
  appKey: process.env.N11_APP_KEY!,
  appSecret: process.env.N11_APP_SECRET!,
});

// --- Quick start -------------------------------------------------------------

export async function browseCategories(): Promise<void> {
  const { categoryList } = await n11.categories.topLevel();

  for (const category of categoryList?.category ?? []) {
    console.log(category.id, category.name);
  }
}

// --- Orders ------------------------------------------------------------------

export async function acceptNewOrders(): Promise<void> {
  const { orderList } = await n11.orders.list({
    searchData: { status: 'New' },
    pagingData: { currentPage: 0, pageSize: 100 },
  });

  for (const order of orderList?.order ?? []) {
    console.log(order.orderNumber, order.totalAmount);
  }
}

// --- Errors ------------------------------------------------------------------

export async function updatePrice(): Promise<void> {
  try {
    await n11.products.updatePriceBySellerCode({ productSellerCode: 'ACME-1', price: 149.9 });
  } catch (error) {
    if (error instanceof N11ApiError) {
      // n11 answered HTTP 200 and reported the failure in the body.
      console.error(error.errorCode, error.errorMessage, error.errorCategory);
    } else if (error instanceof N11SoapFaultError) {
      console.error('envelope rejected:', error.faultString);
    } else if (error instanceof N11Error) {
      console.error(error.context.service, error.context.operation, error.context.status);
    }
  }
}

// --- Middleware --------------------------------------------------------------

export const retry: Middleware = {
  name: 'retry',
  async handle(request, next) {
    for (let attempt = 1; ; attempt++) {
      const response = await next({ ...request, context: { ...request.context, attempt } });
      if (response.status < 500 || attempt === 3) return response;
      await sleep(2 ** attempt * 500);
    }
  },
};

// --- Testing seam ------------------------------------------------------------

export class StubHttpClient implements HttpClient {
  async send(_request: HttpRequest): Promise<HttpResponse> {
    return {
      status: 200,
      statusText: 'OK',
      headers: {},
      body:
        '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Body>' +
        '<GetCitiesResponse><result><status>success</status></result></GetCitiesResponse>' +
        '</Body></Envelope>',
    };
  }
}

export const stubbed = new N11Client({
  appKey: 'k',
  appSecret: 's',
  httpClient: new StubHttpClient(),
  middleware: [retry],
});

// --- The services n11 no longer publishes ------------------------------------

export function updateStock(): Promise<unknown> {
  return n11.call('https://api.n11.com/ws/productStockService/', 'UpdateStockByStockId', {
    stockItems: { stockItem: [{ id: 123456, quantity: 5 }] },
  });
}

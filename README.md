# n11-sdk

Typed TypeScript client for the **n11 Marketplace SOAP API** — 43 operations across categories,
cities, orders, products and shipping.

- **Types come from n11.** Every request and response type is generated from n11's own WSDL
  documents, committed under [`wsdl/`](./wsdl). No hand-typed field names.
- **The XML traps are handled.** A one-element list is still an array, a seller code of `"0123"`
  is still a string, and a failure hidden inside an HTTP 200 still throws.
- **One dependency.** `fast-xml-parser` for reading; the rest is the platform `fetch` — Node 18+,
  Deno, Bun, Workers.
- **Swappable everywhere.** Transport and the middleware pipeline are interfaces: mock them in
  tests, wrap them in production.

> Community project. Not affiliated with or endorsed by n11.

## Install

Not published to a registry — install it from the repository:

```bash
npm install github:taha-kanar/n11-sdk
```

## Quick start

```ts
import { N11Client } from 'n11-sdk';

const n11 = new N11Client({
  appKey: process.env.N11_APP_KEY!,
  appSecret: process.env.N11_APP_SECRET!,
});

const { categoryList } = await n11.categories.topLevel();

for (const category of categoryList?.category ?? []) {
  console.log(category.id, category.name);
}
```

Credentials come from the n11 seller panel: **Mağaza Ayarları → Entegrasyon Bilgileri**. They
travel in the body of every request, not in a header — the SDK writes them for you.

## What SOAP makes hard, and what this does about it

XML carries no type information, so a naive client gets three things wrong. The generator writes
n11's schema out as runtime data, and the codec reads *that* rather than guessing at the payload.

**One-element lists.** `<categoryList><category/></categoryList>` parses to an object when a
category is alone and to an array when it has company — so `.map()` throws in production on the
seller with one category. Here the schema says `maxOccurs="unbounded"`, so it is always an array.

**Number coercion.** Left to itself, an XML parser turns the seller code `"0123"` into `123`. This
one parses every value as text and converts only what the XSD types as numeric.

**Errors inside a 200.** n11 answers `HTTP 200` with `result.status = "failure"` in the body. That
becomes an `N11ApiError`, carrying n11's own `errorCode`, `errorMessage` and `errorCategory`. The
check runs on every decoded response, not only on the operations whose WSDL declares a `result` —
[see below](#what-production-returns-that-the-wsdl-does-not) for why that distinction cost a
silently-swallowed failure.

```ts
import { N11ApiError, N11SoapFaultError, N11Error } from 'n11-sdk';

try {
  await n11.products.updatePriceBySellerCode({ productSellerCode: 'ACME-1', price: 149.9 });
} catch (error) {
  if (error instanceof N11ApiError) {
    console.error(error.errorCode, error.errorMessage); // n11 said no, in a 200
  } else if (error instanceof N11SoapFaultError) {
    console.error('envelope rejected:', error.faultString);
  } else if (error instanceof N11Error) {
    console.error(error.context.service, error.context.operation, error.context.status);
  }
}
```

| Class | When |
| --- | --- |
| `N11ApiError` | n11 reported failure in the response body, over HTTP 200 |
| `N11SoapFaultError` | `<soap:Fault>` — malformed envelope, unknown operation, refused credentials |
| `N11HttpError` | non-2xx with no usable envelope |
| `N11ConnectionError` | never reached n11 (DNS, TLS, offline) |
| `N11TimeoutError` | timed out or aborted |
| `N11ParseError` | a 200 that was not a SOAP envelope |
| `N11Error` | the base of all of the above |

## Configuration

```ts
new N11Client({
  appKey: '…',
  appSecret: '…',

  timeoutMs: 60_000,        // per request; 0 disables. n11's product calls are slow
  logger: console,          // anything with debug/warn/error; silent by default
  baseUrl: 'http://localhost:8080', // proxy or mock; each service keeps its own path
  defaultHeaders: { 'x-tenant': 'acme' },

  fetch: customFetch,
  httpClient: myHttpClient,
  middleware: [retryMiddleware],
});
```

## Extending

The pipeline is `service → transport → middleware → HttpClient`, and every arrow is an interface.
Retries are deliberately not built in — here is the whole of one:

```ts
import type { Middleware } from 'n11-sdk';

const retry: Middleware = {
  name: 'retry',
  async handle(request, next) {
    for (let attempt = 1; ; attempt++) {
      const response = await next({ ...request, context: { ...request.context, attempt } });
      if (response.status < 500 || attempt === 3) return response;
      await sleep(2 ** attempt * 500);
    }
  },
};
```

Testing works the same way — implement `HttpClient` and no network is involved.

## The three services n11 stopped publishing

n11 documents nine services. Only six still serve a WSDL: `api.n11.com` answers **405 for
`ProductStockService`, `ProductSellingService` and `WebHookService`** — the same 405 it returns for
a service name that does not exist. There is no contract to generate from, and inventing one from a
third-party mirror would mean typing a promise nobody can keep.

So they are reachable, but untyped:

```ts
const result = await n11.call('https://api.n11.com/ws/productStockService/', 'UpdateStockByStockId', {
  stockItems: { stockItem: [{ id: 123456, quantity: 5 }] },
});
```

`call()` runs the same credentialed, middleware-wrapped pipeline and returns `unknown` — the honest
type for a contract we cannot read. If n11 publishes those WSDLs again, drop them into `wsdl/`, add
them to `wsdl/manifest.json`, and `npm run generate` types them like the rest.

## What production returns that the WSDL does not

n11's published WSDLs lag its production API. Running the read-only operations against a live
seller account on **2026-08-25** and comparing every element on the wire against its declared type
turned up **42 elements the schema does not mention** across 22 operations, and one bug in this
SDK:

| What the WSDL says | What production does |
| --- | --- |
| `ProductSku` is an **empty** complexType | every `<stockItem>` carries eleven elements — including the `id` and `quantity` you need to manage stock |
| `DetailedOrderData` has no buyer or address | `DetailedOrderList` returns `buyer`, `shippingAddress` and `billingAddress` — the fields that make the call worth its name |
| `OrderItemData` has 11 fewer fields than `OrderSearchData` | the same eleven come back, `sellerInvoiceAmount` and `shippingDate` among them |
| `lastModifiedDate` exists on `SubCategory` only | every category type carries it — which is what makes an incremental category sync possible |
| `GetProductQuestionList` has **no `result`** | it returns the standard one, failures included |

That last row was the bug. The failure check used to ask the schema whether a response carried a
`result`, which is exactly the question a stale schema answers wrongly: a rate-limited call came
back `HTTP 200`, `status=failure`, `SELLER_API.…accessLimit.reached` — and this SDK reported an
empty page of questions. It now checks the decoded body instead, so an operation the schema has not
caught up with still raises, and so does one reached through the untyped `call()` escape hatch.

The corrections live in `wsdl/overlays/*.json` and are folded in by `npm run generate`. Every entry
records **evidence**, never a guess — nearly all of them reuse a type n11 itself declares for the
same field name elsewhere in the same service:

```json
{ "name": "sellerStockCode", "type": "string",
  "evidence": "ProductSkuRequest.sellerStockCode", "sample": "EDT-K71-1000" }
```

That rule is not pedantry. Inferring types from samples is how a seller code loses its leading zero
and a postal code becomes a number — Adana's is `01000`. n11's own schema already types
`AddressModel.postalCode` and `tcId` as strings, and the overlay takes its word for it. Fields the
schema declares are skipped, so an overlay entry becomes a no-op the day n11 publishes the field
itself, and `npm run generate` says which entries have gone obsolete.

Overlay fields are marked in the generated types, so nothing is silently invented:

```ts
export interface ProductSku {
  id?: number;       // observed in production; not in the WSDL
  quantity?: number; // observed in production; not in the WSDL
}
```

## Keeping up with the API

```bash
npm run fetch-wsdl     # refresh wsdl/*.wsdl from api.n11.com
npm run generate       # wsdl/*.wsdl -> src/generated/* , applying wsdl/overlays/*
npm test               # fails if an operation was added, removed, renamed or re-routed
npm run observe        # call the read-only operations for real, and diff the wire against the schema
```

`tests/wsdl-coverage.test.ts` compares every operation in the WSDLs against what the service
classes actually call, and checks each service still points at its own endpoint. An n11 change that
would otherwise surface as a production SOAP fault becomes a failing test instead.
`tests/drift.test.ts` does the same for the overlays: delete one and the build goes red.

Those two catch a contract that *changes*. `npm run observe` catches a contract that was never
described accurately in the first place:

```bash
N11_APP_KEY=… N11_APP_SECRET=… npm run observe
```

It walks the read-only operations, chaining real ids as it goes, and reports every element that
disagrees with its declared shape — undeclared fields, single elements that turned out to repeat,
`xsi:nil` on something not nillable, a number that is not one. It ends with a review list of
overlay candidates. Two rules make it safe against a live seller account:

- **It cannot write.** Only operations on an explicit read-only allowlist are callable; anything
  else throws before a request is built.
- **It cannot leak a customer.** Order payloads carry names, e-mail addresses, phone numbers and
  national id numbers. Values of those fields are redacted before anything is printed, and
  `--write` records field *names* and counts to `wsdl/observation.json` — never payload values. A
  test asserts the repository contains no e-mail address, TC number or GSM number.

With the overlays in place the run is clean, and it caught the rate limit on the way past:

```
  fail  products.questions — N11ApiError: Ürün soruları 1 dakikada bir kez listelenebilmektedir.

25/25 probed operations matched the WSDL exactly.
```

That `fail` line is the fix working: before it, the same refusal decoded as a successful empty
page. `wsdl/observation.json` records the run.

It reaches **22 of the 43 operations**. The other 21 are writes — everything that creates, ships or
deletes — plus `GetProductQuestionDetail`, whose list call is rate-limited to one request a minute.
Those are described by the schema alone, so treat their types as the WSDL's claim rather than an
observed fact, and re-run `npm run observe` after any n11 release.

## Architecture

```
src/
├─ client.ts              N11Client — composition root, lazy services, .call() escape hatch
├─ config.ts              credentials and options, validated once
├─ core/
│  ├─ http/               HttpClient interface + FetchHttpClient
│  ├─ middleware/         pipeline, Middleware interface, logging
│  ├─ errors/             error hierarchy + the in-band result check
│  └─ resource/           BaseService
├─ soap/
│  ├─ envelope.ts         build the request envelope, unwrap the response
│  ├─ encode.ts           JS -> XML, in the schema's element order
│  ├─ decode.ts           XML -> JS, schema-driven arrays and scalars
│  ├─ shape.ts            the runtime contract the codec walks
│  └─ transport.ts        endpoint, headers, auth, error mapping
├─ generated/             *.types.ts + *.shape.ts, from wsdl/ — never hand-edited
└─ resources/             one class per service, thin and typed
```

## Notes

- **`document/literal` binds by position**, so the encoder follows the schema's order rather than
  the caller's object keys. It matters: `GetCity`, `GetDistrict` and `GetNeighborhoods` declare
  `auth` *after* their parameter, and every other operation declares it first.
- **Requiredness is not encoded**, except where an operation takes a single argument. The XSD marks
  almost every element required — search filters included — which reflects the default its
  generator applied, not what n11 accepts.
- **Dates stay strings.** n11 uses `dd/MM/yyyy`, which no `Date` constructor parses correctly.
- **`ProductApprovalStatus` is the one operation whose `result` holds counts**, not a status. The
  in-band error check is schema-driven, so it is not mistaken for a failure.
- **Unknown fields survive** in both directions: anything n11 adds to a response is kept, and any
  key you pass that the schema does not describe is still sent.

## Operations

### `client.products` — The product catalogue: listing, saving, pricing, deleting, and customer questions.

`https://api.n11.com/ws/productService/`

| Method | n11 operation |
| --- | --- |
| `products.list()` | `GetProductList` |
| `products.search()` | `SearchProducts` |
| `products.getById()` | `GetProductByProductId` |
| `products.getBySellerCode()` | `GetProductBySellerCode` |
| `products.save()` | `SaveProduct` |
| `products.updateBasic()` | `UpdateProductBasic` |
| `products.updatePriceById()` | `UpdateProductPriceById` |
| `products.updatePriceBySellerCode()` | `UpdateProductPriceBySellerCode` |
| `products.updateDiscountById()` | `UpdateDiscountValueByProductId` |
| `products.updateDiscountBySellerCode()` | `UpdateDiscountValueBySellerCode` |
| `products.addOptionPrice()` | `ProductPriceAddOptionPrice` |
| `products.deleteById()` | `DeleteProductById` |
| `products.deleteBySellerCode()` | `DeleteProductBySellerCode` |
| `products.approvalStatus()` | `ProductApprovalStatus` |
| `products.adaptUnification()` | `AdaptUnificationProducts` |
| `products.questions()` | `GetProductQuestionList` |
| `products.question()` | `GetProductQuestionDetail` |
| `products.answerQuestion()` | `SaveProductAnswer` |

### `client.orders` — Orders and the items inside them.

`https://api.n11.com/ws/orderService/`

| Method | n11 operation |
| --- | --- |
| `orders.list()` | `OrderList` |
| `orders.listDetailed()` | `DetailedOrderList` |
| `orders.detail()` | `OrderDetail` |
| `orders.acceptItems()` | `OrderItemAccept` |
| `orders.rejectItems()` | `OrderItemReject` |
| `orders.ship()` | `MakeOrderItemShipment` |
| `orders.setDelivery()` | `OrderItemDelivery` |
| `orders.setItemIdentity()` | `OrderItemIdentity` |
| `orders.combineItems()` | `CombineItems` |
| `orders.separateItems()` | `SeparateCombinedItems` |
| `orders.complementaryItemDetail()` | `ComplementaryItemDetail` |

### `client.categories` — The category tree and the attributes each category demands.

`https://api.n11.com/ws/categoryService/`

| Method | n11 operation |
| --- | --- |
| `categories.topLevel()` | `GetTopLevelCategories` |
| `categories.subCategories()` | `GetSubCategories` |
| `categories.parent()` | `GetParentCategory` |
| `categories.attributes()` | `GetCategoryAttributes` |
| `categories.attributeIds()` | `GetCategoryAttributesId` |
| `categories.attributeValues()` | `GetCategoryAttributeValue` |

### `client.cities` — Address reference data: cities, districts and neighbourhoods of Türkiye.

`https://api.n11.com/ws/cityService/`

| Method | n11 operation |
| --- | --- |
| `cities.list()` | `GetCities` |
| `cities.get()` | `GetCity` |
| `cities.districts()` | `GetDistrict` |
| `cities.neighborhoods()` | `GetNeighborhoods` |

### `client.shipments` — Shipment templates — the delivery terms a product is sold under.

`https://api.n11.com/ws/shipmentService/`

| Method | n11 operation |
| --- | --- |
| `shipments.listTemplates()` | `GetShipmentTemplateList` |
| `shipments.getTemplate()` | `GetShipmentTemplate` |
| `shipments.saveTemplate()` | `CreateOrUpdateShipmentTemplate` |

### `client.shipmentCompanies` — The carriers n11 can hand a package to.

`https://api.n11.com/ws/shipmentCompanyService/`

| Method | n11 operation |
| --- | --- |
| `shipmentCompanies.list()` | `GetShipmentCompanies` |


## Licence

MIT

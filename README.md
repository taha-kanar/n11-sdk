# n11-sdk

Typed TypeScript client for the **n11 Marketplace SOAP API** — 43 operations across categories,
cities, orders, products and shipping.

> ### Unofficial
>
> This is **not** n11's own SDK, and n11 did not write, review or endorse it. It is an independent
> community project, not affiliated with n11 in any way. The types are generated from n11's
> published WSDL documents, but everything else here is third-party work — use it at your own risk,
> and treat n11's own documentation as the authority when the two differ.

## Install

Not published to npm — install it from the repository:

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

Credentials come from **Mağaza Ayarları → Entegrasyon Bilgileri**. They travel in the body of every
request, not in a header — the SDK writes them for you.

## What it handles for you

XML carries no type information, so a naive client gets three things wrong. The generator writes
n11's schema out as runtime data and the codec reads that, rather than guessing at the payload:

- **One-element lists.** A seller with one category gets an object where a seller with two gets an
  array. The schema says `unbounded`, so it is always an array.
- **Number coercion.** The seller code `"0123"` stays a string instead of becoming `123`.
- **Errors inside a 200.** n11 answers `HTTP 200` with `result.status = "failure"`. That throws
  `N11ApiError`, carrying n11's own error code and message.

One dependency (`fast-xml-parser`); the rest is platform `fetch`. Transport and middleware are
interfaces. Types are generated from the WSDLs under [`wsdl/`](./wsdl), with what production returns
beyond them recorded as overlays.

## Development

```bash
npm install
npm run generate    # WSDLs → src/generated/
npm run typecheck
npm test
npm run build
```

## Licence

MIT

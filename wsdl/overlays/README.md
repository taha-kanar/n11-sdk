# Overlays — what production returns that the WSDL does not declare

n11's published WSDLs lag its production API. `npm run observe` calls the read-only operations
with real credentials, compares every element on the wire against the schema, and reports the
gaps; the reviewed gaps are written here, and `npm run generate` folds them into the generated
types and shapes.

Each entry records **evidence**, never a guess:

- `evidence: "<Type>.<field>"` — n11 itself declares this exact field name elsewhere in the same
  service, so the overlay reuses that declaration rather than inferring a type from a sample.
- `evidence: "observed"` — the field exists nowhere in the schema; `sample` shows what the wire
  actually carried, and the type follows from it.

Overlay fields are **appended** to the end of a sequence. Responses are decoded by element name,
so order does not matter there. Two of these types (`ShipmentSaveAddress`) are also used in
requests, where order does matter — appending is safe because the encoder emits a field only when
the caller sets it, but a value n11 expects in a different position would need the WSDL to say so.

Regenerating from a fresh WSDL that already declares a field makes its overlay entry a no-op:
`npm run generate` skips any field the schema already has, and reports how many entries it applied.

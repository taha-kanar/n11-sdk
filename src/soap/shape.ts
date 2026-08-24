/**
 * The runtime half of the WSDL contract.
 *
 * XML says nothing about types: `<id>0123</id>` could be a string or a number, and a list with
 * one entry is indistinguishable from a single object. Rather than let a parser guess — and get
 * seller codes and one-item lists wrong — the generator writes the XSD out as data, and the codec
 * walks it. Every decision below is n11's, not ours.
 */

/** One element in an `xs:sequence`, in document order. Keys are terse because they repeat ~1500 times. */
export interface FieldShape {
  /** Element name, exactly as it appears on the wire. */
  n: string;
  /** `string` | `number` | `boolean` for scalars, otherwise the complex type's name. */
  t: string;
  /** Set when `t` names a complex type rather than a scalar. */
  c?: 1;
  /** Set when `maxOccurs="unbounded"` — always decoded as an array, even with one entry. */
  l?: 1;
  /** Set when `nillable="true"` — may arrive as `xsi:nil` and decode to `null`. */
  x?: 1;
}

/** An operation's request and response element sequences. */
export interface OperationShape {
  request: FieldShape[];
  response: FieldShape[];
}

/** Everything one WSDL describes. */
export interface ServiceShapes {
  /** WSDL name, e.g. `CategoryService`. */
  service: string;
  /** Absolute SOAP endpoint — note it is *not* the WSDL URL. */
  endpoint: string;
  /** Names of `xs:simpleType` enumerations; they decode as plain strings. */
  enums: Set<string>;
  /** Complex type name -> its ordered fields. */
  types: Record<string, FieldShape[]>;
  /** Operation name -> its request/response sequences. */
  operations: Record<string, OperationShape>;
}

/** Look up an operation, failing loudly rather than silently sending an empty body. */
export function operationShape(shapes: ServiceShapes, operation: string): OperationShape {
  const shape = shapes.operations[operation];
  if (!shape) {
    throw new Error(
      `${shapes.service} has no operation "${operation}". Known: ${Object.keys(shapes.operations).join(', ')}`
    );
  }
  return shape;
}

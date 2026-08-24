import { describe, expect, it } from 'vitest';
import { decodeFields, encodeFields, escapeXml, type FieldShape, type ServiceShapes } from '../src/index.js';

/** A miniature service, exercising every decision the codec makes. */
const shapes: ServiceShapes = {
  service: 'TestService',
  endpoint: 'https://api.n11.com/ws/testService/',
  enums: new Set(),
  types: {
    CategoryList: [{ n: 'category', t: 'Category', c: 1, l: 1 }],
    Category: [
      { n: 'id', t: 'number' },
      { n: 'name', t: 'string' },
    ],
    Product: [
      { n: 'sellerCode', t: 'string' },
      { n: 'price', t: 'number' },
      { n: 'active', t: 'boolean' },
      { n: 'note', t: 'string', x: 1 },
    ],
  },
  operations: {},
};

const listField: FieldShape[] = [{ n: 'categoryList', t: 'CategoryList', c: 1 }];
const productField: FieldShape[] = [{ n: 'product', t: 'Product', c: 1 }];

describe('decode', () => {
  it('makes a one-element list an array, like a many-element one', () => {
    const one = decodeFields(listField, { categoryList: { category: { id: '1', name: 'Ayakkabı' } } }, shapes);
    const many = decodeFields(
      listField,
      { categoryList: { category: [{ id: '1', name: 'A' }, { id: '2', name: 'B' }] } },
      shapes
    );

    expect((one['categoryList'] as any).category).toHaveLength(1);
    expect((many['categoryList'] as any).category).toHaveLength(2);
  });

  it('keeps a leading-zero seller code a string', () => {
    const decoded = decodeFields(productField, { product: { sellerCode: '0123', price: '19.90' } }, shapes);

    expect((decoded['product'] as any).sellerCode).toBe('0123');
    expect((decoded['product'] as any).price).toBe(19.9);
  });

  it('coerces booleans as the schema declares them', () => {
    const decoded = decodeFields(productField, { product: { active: 'true' } }, shapes);
    expect((decoded['product'] as any).active).toBe(true);
  });

  it('decodes xsi:nil and empty elements to null', () => {
    const nil = decodeFields(productField, { product: { note: { '@nil': 'true' } } }, shapes);
    const empty = decodeFields(productField, { product: { price: '' } }, shapes);

    expect((nil['product'] as any).note).toBeNull();
    expect((empty['product'] as any).price).toBeNull();
  });

  it('keeps unparseable numbers as text rather than handing back NaN', () => {
    const decoded = decodeFields(productField, { product: { price: 'n/a' } }, shapes);
    expect((decoded['product'] as any).price).toBe('n/a');
  });

  it('keeps fields the schema does not know about', () => {
    const decoded = decodeFields(productField, { product: { sellerCode: 'X', brandNew: 'kept' } }, shapes);
    expect((decoded['product'] as any).brandNew).toBe('kept');
  });
});

describe('encode', () => {
  it('follows the schema order, not the object key order', () => {
    const xml = encodeFields(productField, { product: { active: true, price: 10, sellerCode: 'A1' } }, shapes);
    expect(xml).toBe('<product><sellerCode>A1</sellerCode><price>10</price><active>true</active></product>');
  });

  it('repeats an element per array entry', () => {
    const xml = encodeFields(listField, { categoryList: { category: [{ id: 1 }, { id: 2 }] } }, shapes);
    expect(xml).toBe('<categoryList><category><id>1</id></category><category><id>2</id></category></categoryList>');
  });

  it('wraps a lone value when the schema says the element repeats', () => {
    const xml = encodeFields(listField, { categoryList: { category: { id: 7 } } }, shapes);
    expect(xml).toBe('<categoryList><category><id>7</id></category></categoryList>');
  });

  it('omits undefined, and sends null only where nillable allows it', () => {
    const xml = encodeFields(productField, { product: { sellerCode: undefined, price: null, note: null } }, shapes);
    expect(xml).toBe('<product><note xsi:nil="true"/></product>');
  });

  it('escapes XML metacharacters', () => {
    const xml = encodeFields(productField, { product: { name: '', sellerCode: 'a&b<c>' } }, shapes);
    expect(xml).toContain('a&amp;b&lt;c&gt;');
    expect(escapeXml(`"'`)).toBe('&quot;&apos;');
  });

  it('still sends fields the schema does not describe', () => {
    const xml = encodeFields(productField, { product: { sellerCode: 'A' }, futureField: 'x' }, shapes);
    expect(xml).toBe('<product><sellerCode>A</sellerCode></product><futureField>x</futureField>');
  });
});

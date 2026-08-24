import { resolveConfig, type ClientOptions, type ResolvedConfig } from './config.js';
import { FetchHttpClient, type HttpClient } from './core/http/index.js';
import { silentLogger, type Logger } from './core/logger.js';
import { LoggingMiddleware, type Middleware } from './core/middleware/index.js';
import { SoapTransport, type RequestOptions } from './soap/transport.js';
import type { ServiceShapes } from './soap/shape.js';
import {
  categoryServiceShapes,
  cityServiceShapes,
  orderServiceShapes,
  productServiceShapes,
  shipmentCompanyServiceShapes,
  shipmentServiceShapes,
} from './generated/index.js';
import {
  CategoriesService,
  CitiesService,
  OrdersService,
  ProductsService,
  ShipmentCompaniesService,
  ShipmentsService,
} from './resources/index.js';

/**
 * Entry point of the SDK.
 *
 * ```ts
 * const n11 = new N11Client({
 *   appKey: process.env.N11_APP_KEY!,
 *   appSecret: process.env.N11_APP_SECRET!,
 * });
 *
 * const { categoryList } = await n11.categories.topLevel();
 * ```
 *
 * The client is a thin composition root: it validates configuration, wires the transport, and
 * hands the same transport to every service. Services are created lazily.
 */
export class N11Client {
  /** Effective configuration after defaults were applied. */
  readonly config: ResolvedConfig;

  private readonly transport: SoapTransport;
  private readonly cache = new Map<string, unknown>();

  constructor(options: ClientOptions) {
    const logger: Logger = options.logger ?? silentLogger;
    this.config = resolveConfig(options, logger);

    const httpClient: HttpClient =
      options.httpClient ??
      new FetchHttpClient({
        ...(options.fetch ? { fetch: options.fetch } : {}),
        ...(options.timeoutMs !== undefined ? { timeoutMs: options.timeoutMs } : {}),
      });

    const middleware: Middleware[] = [
      ...(options.logger ? [new LoggingMiddleware(logger)] : []),
      ...(options.middleware ?? []),
    ];

    this.transport = new SoapTransport({
      credentials: { appKey: this.config.appKey, appSecret: this.config.appSecret },
      httpClient,
      middleware,
      defaultHeaders: this.config.defaultHeaders,
      baseUrl: this.config.baseUrl,
    });
  }

  /** Category tree and per-category attributes. */
  get categories(): CategoriesService {
    return this.service('categories', CategoriesService, categoryServiceShapes);
  }

  /** Cities, districts and neighbourhoods. */
  get cities(): CitiesService {
    return this.service('cities', CitiesService, cityServiceShapes);
  }

  /** Orders and their items: search, accept, reject, ship. */
  get orders(): OrdersService {
    return this.service('orders', OrdersService, orderServiceShapes);
  }

  /** Product catalogue, pricing and customer questions. */
  get products(): ProductsService {
    return this.service('products', ProductsService, productServiceShapes);
  }

  /** Carriers available to the seller. */
  get shipmentCompanies(): ShipmentCompaniesService {
    return this.service('shipmentCompanies', ShipmentCompaniesService, shipmentCompanyServiceShapes);
  }

  /** Shipment templates. */
  get shipments(): ShipmentsService {
    return this.service('shipments', ShipmentsService, shipmentServiceShapes);
  }

  /**
   * Call an operation this SDK does not type.
   *
   * n11 runs three services — `ProductStockService`, `ProductSellingService` and
   * `WebHookService` — whose WSDLs it no longer publishes (`api.n11.com` answers 405 for every
   * URL, exactly as it does for a service that does not exist). Rather than invent types from
   * hearsay, this sends a hand-built body through the same credentialed, middleware-wrapped
   * pipeline and hands back whatever comes out:
   *
   * ```ts
   * const result = await n11.call('https://api.n11.com/ws/ProductStockService.wsdl', 'UpdateStockByStockId', {
   *   stockItems: { stockItem: [{ id: 123, quantity: 5 }] },
   * });
   * ```
   *
   * The return type is `unknown` on purpose: a contract we cannot read is a contract we should
   * not pretend to know. Decoding is generic — text stays text, and repeated elements come back
   * as arrays only when they repeat.
   *
   * @param endpoint Absolute service endpoint, e.g. `https://api.n11.com/ws/productStockService/`.
   * @param operation Operation name without the `Request` suffix.
   */
  call<TResponse = unknown>(
    endpoint: string,
    operation: string,
    body: Record<string, unknown> = {},
    options: RequestOptions = {}
  ): Promise<TResponse> {
    const shapes = untypedShapes(endpoint, operation);
    return this.transport.call<TResponse>(shapes, operation, body, options);
  }

  /** Instantiate a service once and reuse it. */
  private service<TService>(
    key: string,
    Ctor: new (transport: SoapTransport, shapes: ServiceShapes) => TService,
    shapes: ServiceShapes
  ): TService {
    let instance = this.cache.get(key) as TService | undefined;
    if (!instance) {
      instance = new Ctor(this.transport, shapes);
      this.cache.set(key, instance);
    }
    return instance;
  }
}

/**
 * A schema-free {@link ServiceShapes} for {@link N11Client.call}.
 *
 * With no field descriptors the codec passes values through: objects nest, scalars become text,
 * and arrays repeat their element. That is exactly right for a contract we have not seen.
 */
function untypedShapes(endpoint: string, operation: string): ServiceShapes {
  const service = endpoint.replace(/\/+$/, '').split('/').pop() ?? 'UnknownService';
  return {
    service,
    endpoint,
    enums: new Set(),
    // Only `Authentication` is known: every n11 service declares it identically, and the
    // envelope builder needs it to write the credentials.
    types: { Authentication: [{ n: 'appKey', t: 'string' }, { n: 'appSecret', t: 'string' }] },
    operations: { [operation]: { request: [], response: [] } },
  };
}

import type { ServiceShapes } from '../../soap/shape.js';
import type { RequestOptions, SoapTransport } from '../../soap/transport.js';

/**
 * Shared base for the service classes.
 *
 * A service owns exactly one thing: mapping typed method arguments onto an n11 operation name.
 * It depends on {@link SoapTransport} and its own generated shapes, so any service can be
 * exercised with a stub HTTP client.
 */
export abstract class BaseService {
  constructor(
    protected readonly transport: SoapTransport,
    protected readonly shapes: ServiceShapes
  ) {}

  /** Invoke an operation of this service. */
  protected call<TResponse>(
    operation: string,
    body: Record<string, unknown> = {},
    options: RequestOptions = {}
  ): Promise<TResponse> {
    return this.transport.call<TResponse>(this.shapes, operation, body, options);
  }
}

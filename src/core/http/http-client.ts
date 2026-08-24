import type { HttpRequest, HttpResponse } from './types.js';

/**
 * The single seam between the SDK and the network.
 *
 * Everything above it — the codec, the services, the error model — is pure logic that can be
 * tested by substituting an implementation. Implementations throw only for transport failures;
 * any HTTP status, 500 included, is a successful `send`, because n11 returns SOAP faults with a
 * 500 and the fault is more informative than the status.
 */
export interface HttpClient {
  send(request: HttpRequest): Promise<HttpResponse>;
}

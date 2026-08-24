import { N11Client, type ClientOptions } from '../../src/index.js';
import { MockHttpClient } from './mock-http-client.js';

/** A client wired to a {@link MockHttpClient}, with credentials that never leave the process. */
export function createTestClient(options: Partial<ClientOptions> = {}): {
  client: N11Client;
  http: MockHttpClient;
} {
  const http = new MockHttpClient();
  // A test that supplies its own `fetch` wants the real FetchHttpClient around it, so the
  // recording client is only wired in when nothing else was asked for.
  const transport = options.fetch || options.httpClient ? {} : { httpClient: http };

  const client = new N11Client({
    appKey: 'test-key',
    appSecret: 'test-secret',
    ...transport,
    ...options,
  } as ClientOptions);
  return { client, http };
}

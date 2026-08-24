import type { HttpClient, HttpRequest, HttpResponse } from '../../src/index.js';

export interface RecordedCall {
  request: HttpRequest;
  url: URL;
  envelope: string;
}

/** Test double for {@link HttpClient}: records envelopes, replays canned responses. */
export class MockHttpClient implements HttpClient {
  readonly calls: RecordedCall[] = [];
  private readonly queue: Array<Partial<HttpResponse> | Error> = [];

  /** Queue a raw response. Defaults to an empty 200 envelope. */
  enqueue(response: Partial<HttpResponse> | Error): this {
    this.queue.push(response);
    return this;
  }

  /** Queue a successful `{Operation}Response` carrying `body` XML. */
  enqueueSoap(operation: string, body: string, result = '<result><status>success</status></result>'): this {
    return this.enqueue({
      status: 200,
      body:
        '<?xml version="1.0"?>' +
        '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">' +
        `<SOAP-ENV:Body><ns2:${operation}Response xmlns:ns2="http://www.n11.com/ws/schemas">` +
        result +
        body +
        `</ns2:${operation}Response></SOAP-ENV:Body></SOAP-ENV:Envelope>`,
    });
  }

  get lastCall(): RecordedCall {
    const call = this.calls.at(-1);
    if (!call) throw new Error('MockHttpClient: no request was made');
    return call;
  }

  async send(request: HttpRequest): Promise<HttpResponse> {
    this.calls.push({ request, url: new URL(request.url), envelope: request.body });

    const next = this.queue.shift();
    if (next instanceof Error) throw next;

    return {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'text/xml' },
      body:
        '<?xml version="1.0"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<SOAP-ENV:Body/></SOAP-ENV:Envelope>',
      ...next,
    };
  }
}

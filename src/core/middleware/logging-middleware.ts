import type { HttpRequest, HttpResponse } from '../http/types.js';
import type { Logger } from '../logger.js';
import type { Middleware, Next } from './types.js';

/** Logs one line per call with its status and duration. Off unless a logger is configured. */
export class LoggingMiddleware implements Middleware {
  readonly name = 'logging';

  constructor(
    private readonly logger: Logger,
    private readonly now: () => number = () => Date.now()
  ) {}

  async handle(request: HttpRequest, next: Next): Promise<HttpResponse> {
    const startedAt = this.now();
    const { operation, service, attempt } = request.context;
    this.logger.debug(`-> ${service}.${operation}`, { url: request.url, attempt });

    try {
      const response = await next(request);
      this.logger.debug(`<- ${response.status} ${service}.${operation}`, {
        durationMs: this.now() - startedAt,
      });
      return response;
    } catch (error) {
      this.logger.error(`x- ${service}.${operation}`, { durationMs: this.now() - startedAt, error });
      throw error;
    }
  }
}

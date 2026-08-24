import type { FetchLike, HttpClient } from './core/http/index.js';
import type { Logger } from './core/logger.js';
import type { Middleware } from './core/middleware/index.js';

export interface ClientOptions {
  /** API key from the n11 seller panel (Mağaza Ayarları → Entegrasyon Bilgileri). */
  appKey: string;
  /** API secret paired with {@link appKey}. */
  appSecret: string;
  /**
   * Overrides the service host, keeping each service's path.
   *
   * The WSDLs pin absolute endpoints (`https://api.n11.com/ws/orderService/`); this exists for
   * proxies and mock servers, not for switching environments — n11 publishes only production.
   */
  baseUrl?: string;
  /** Per-request timeout in ms. `0` disables. Default 60000. Ignored if `httpClient` is given. */
  timeoutMs?: number;
  /** Custom fetch. Ignored if `httpClient` is given. */
  fetch?: FetchLike;
  /** Replaces the whole transport implementation (tests, instrumentation, proxies). */
  httpClient?: HttpClient;
  /** Extra pipeline steps: retries, metrics, caching. First entry is outermost. */
  middleware?: readonly Middleware[];
  /** Receives one debug line per call. Defaults to a silent logger. */
  logger?: Logger;
  /** Headers merged into every request; per-call headers still win. */
  defaultHeaders?: Record<string, string>;
}

/** Normalised, validated configuration. */
export interface ResolvedConfig {
  readonly appKey: string;
  readonly appSecret: string;
  readonly baseUrl: string | undefined;
  readonly defaultHeaders: Record<string, string>;
  readonly logger: Logger;
}

/** Validate user input once, at construction, so failures point at the config. */
export function resolveConfig(options: ClientOptions, logger: Logger): ResolvedConfig {
  const appKey = String(options.appKey ?? '').trim();
  const appSecret = String(options.appSecret ?? '').trim();

  if (!appKey || !appSecret) {
    throw new Error('N11Client: `appKey` and `appSecret` are required.');
  }

  return {
    appKey,
    appSecret,
    baseUrl: options.baseUrl?.replace(/\/+$/, ''),
    defaultHeaders: options.defaultHeaders ?? {},
    logger,
  };
}

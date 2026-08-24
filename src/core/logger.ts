/** Minimal logging surface — anything with these three methods fits (pino, console, …). */
export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

/** Default logger: drops everything, so call sites never need `if (logger)`. */
export const silentLogger: Logger = { debug: () => {}, warn: () => {}, error: () => {} };

/** Adapter over the global `console`, for quick debugging. */
export const consoleLogger: Logger = {
  debug: (message, meta) => console.debug(`[n11] ${message}`, meta ?? ''),
  warn: (message, meta) => console.warn(`[n11] ${message}`, meta ?? ''),
  error: (message, meta) => console.error(`[n11] ${message}`, meta ?? ''),
};

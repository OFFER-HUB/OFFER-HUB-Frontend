/**
 * HTTP Client Types
 *
 * Type definitions for the HTTP client utility.
 */

/**
 * Supported HTTP methods
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Request options for HTTP client methods
 */
export interface RequestOptions {
  /** Custom headers to merge with defaults */
  headers?: Record<string, string>;
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
  /** Whether to include credentials (cookies) */
  credentials?: RequestCredentials;
  /** Cache mode */
  cache?: RequestCache;
  /** Next.js specific options */
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

/**
 * HTTP Error class for handling API errors
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message?: string
  ) {
    super(message || `HTTP Error: ${status} ${statusText}`);
    this.name = "HttpError";
  }
}

/**
 * HTTP Client
 *
 * A functional fetch wrapper for making API requests.
 * Provides typed methods with automatic JSON handling and error normalization.
 */

import type { ApiResponse, ResponseCode } from "@/types/api-response.types";
import type { RequestOptions } from "@/types/http.types";
import { HttpError } from "@/types/http.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const DEFAULT_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/**
 * Build URL with query parameters
 */
function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(path, API_BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Create an error response in the standard API format
 */
function createErrorResponse<T>(
  status: number,
  message: string,
  title = "Request Failed"
): ApiResponse<T> {
  return {
    ok: false,
    code: status >= 500 ? 5000 : 4000,
    type: "error",
    title,
    message,
    data: null,
    errors: null,
    meta: {},
    timestamp: new Date().toISOString(),
  };
}

/**
 * Execute a fetch request with error handling
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { headers, params, timeout, signal, credentials, cache, next } = options;

  const url = buildUrl(path, params);

  const controller = new AbortController();
  const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...DEFAULT_HEADERS,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: signal || controller.signal,
      credentials,
      cache,
      next,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      // Try to parse error response body
      try {
        const errorData = (await response.json()) as ApiResponse<T>;
        return errorData;
      } catch {
        throw new HttpError(response.status, response.statusText);
      }
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {
        ok: true,
        code: 1004 as typeof ResponseCode.NO_CONTENT,
        type: "success",
        title: "Success",
        message: "Request completed successfully",
        data: null,
        errors: null,
        meta: {},
        timestamp: new Date().toISOString(),
      };
    }

    return (await response.json()) as ApiResponse<T>;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);

    if (error instanceof HttpError) {
      return createErrorResponse<T>(error.status, error.message, error.statusText);
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return createErrorResponse<T>(408, "Request timeout", "Timeout");
      }
      return createErrorResponse<T>(0, error.message, "Network Error");
    }

    return createErrorResponse<T>(0, "An unexpected error occurred", "Unknown Error");
  }
}

/**
 * HTTP GET request
 */
export async function httpGet<T>(
  path: string,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return request<T>("GET", path, undefined, options);
}

/**
 * HTTP POST request
 */
export async function httpPost<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return request<T>("POST", path, body, options);
}

/**
 * HTTP PUT request
 */
export async function httpPut<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return request<T>("PUT", path, body, options);
}

/**
 * HTTP PATCH request
 */
export async function httpPatch<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return request<T>("PATCH", path, body, options);
}

/**
 * HTTP DELETE request
 */
export async function httpDelete<T>(
  path: string,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return request<T>("DELETE", path, undefined, options);
}

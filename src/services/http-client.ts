/**
 * HTTP Client
 *
 * A functional fetch wrapper for making API requests.
 * Provides typed methods with automatic JSON handling and error normalization.
 *
 * Authentication is transparent to callers:
 * - Reads the backend access token from `useAuthStore` and attaches it as
 *   `Authorization: Bearer <token>` on every request.
 * - On a 401, attempts to refresh the token ONCE via `refreshAccessToken()`
 *   and retries the original request with the new token. If the refresh is
 *   also rejected, the auth store logs the user out and the original caller
 *   receives the original 401 response unchanged.
 *
 * This satisfies the "401 → attempt refresh → retry or redirect to login"
 * acceptance criterion in issue #209.
 */

import type { ApiResponse, ResponseCode } from "@/types/api-response.types";
import type { RequestOptions } from "@/types/http.types";
import { HttpError } from "@/types/http.types";
import { API_URL } from "@/config/api";
import { useAuthStore } from "@/stores/auth-store";
import { refreshAccessToken } from "@/lib/api/refresh";

const API_BASE_URL = API_URL;

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

function buildAuthHeader(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface RawRequestArgs {
  method: string;
  url: string;
  body: unknown;
  options: RequestOptions;
  token: string | null;
}

/**
 * Execute one raw HTTP round-trip (fetch + parse).
 * Does NOT attempt to refresh on 401; the caller drives the retry policy.
 */
async function executeRawRequest<T>({
  method,
  url,
  body,
  options,
  token,
}: RawRequestArgs): Promise<{ status: number; response: ApiResponse<T> }> {
  const { headers, timeout, signal, credentials, cache, next } = options;

  const controller = new AbortController();
  const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...DEFAULT_HEADERS,
        ...buildAuthHeader(token),
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
      // Try to parse error response body so callers still get structured errors
      try {
        const errorData = (await response.json()) as ApiResponse<T>;
        return { status: response.status, response: errorData };
      } catch {
        throw new HttpError(response.status, response.statusText);
      }
    }

    // Handle empty / non-JSON responses
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {
        status: response.status,
        response: {
          ok: true,
          code: 1004 as typeof ResponseCode.NO_CONTENT,
          type: "success",
          title: "Success",
          message: "Request completed successfully",
          data: null,
          errors: null,
          meta: {},
          timestamp: new Date().toISOString(),
        },
      };
    }

    const parsed = (await response.json()) as ApiResponse<T>;
    return { status: response.status, response: parsed };
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);

    if (error instanceof HttpError) {
      return {
        status: error.status,
        response: createErrorResponse<T>(error.status, error.message, error.statusText),
      };
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          status: 408,
          response: createErrorResponse<T>(408, "Request timeout", "Timeout"),
        };
      }
      return {
        status: 0,
        response: createErrorResponse<T>(0, error.message, "Network Error"),
      };
    }

    return {
      status: 0,
      response: createErrorResponse<T>(0, "An unexpected error occurred", "Unknown Error"),
    };
  }
}

/**
 * Execute a fetch request with full auth handling:
 * 1. Send the request with the current access token.
 * 2. If the backend returns 401 AND we have a refresh token (or could fetch
 *    one), try refreshing once and retry the request with the new token.
 * 3. If the retry also fails (or refresh itself failed), return the
 *    401 error response unchanged so the caller can handle redirect to
 *    login.
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params } = options;
  const url = buildUrl(path, params);

  const initialToken = useAuthStore.getState().token;

  const first = await executeRawRequest<T>({
    method,
    url,
    body,
    options,
    token: initialToken,
  });

  // Only attempt a refresh if:
  //  - The request was authenticated (we sent a token), otherwise 401 is the
  //    expected response from the backend and there is nothing to refresh.
  //  - The backend actually returned 401.
  //
  // We retry exactly once via a direct call to `executeRawRequest` (not
  // `request()`) so we cannot get stuck in an infinite refresh loop.
  if (first.status !== 401 || !initialToken) {
    return first.response;
  }

  const refresh = await refreshAccessToken();
  if (!refresh) {
    // Refresh failed, user has been logged out — surface the original 401
    // to the caller; the auth-store change will drive the UI redirect.
    return first.response;
  }

  const retry = await executeRawRequest<T>({
    method,
    url,
    body,
    options,
    token: refresh.token,
  });

  return retry.response;
}

/**
 * HTTP GET request
 */
export async function httpGet<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
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

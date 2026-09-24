/**
 * Standard API Response Types
 *
 * This module defines the standard response contract between frontend and backend.
 * All API responses should conform to this structure.
 */

/**
 * Response type indicator
 */
export type ResponseType = "success" | "error" | "warning";

/**
 * Validation error details for form field errors
 */
export interface ValidationError {
  /** The field name that failed validation */
  field: string;
  /** The validation rule that failed (e.g., "required", "minLength", "email") */
  rule: string;
  /** Human-readable error message */
  message: string;
}

/**
 * Response metadata for pagination and additional context
 */
export interface ResponseMeta {
  /** Current page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  perPage?: number;
  /** Total number of items */
  total?: number;
  /** Total number of pages */
  totalPages?: number;
  /** Additional metadata fields */
  [key: string]: unknown;
}

/**
 * Standard API Response structure
 *
 * @template T - The type of data returned in the response
 *
 * @example Success response
 * ```json
 * {
 *   "ok": true,
 *   "code": 1000,
 *   "type": "success",
 *   "title": "User Created",
 *   "message": "The user account was created successfully.",
 *   "data": { "id": "123", "email": "user@example.com" },
 *   "errors": null,
 *   "meta": {},
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "traceId": "abc-123-def"
 * }
 * ```
 *
 * @example Error response
 * ```json
 * {
 *   "ok": false,
 *   "code": 4001,
 *   "type": "error",
 *   "title": "Validation Failed",
 *   "message": "Please correct the errors below.",
 *   "data": null,
 *   "errors": [
 *     { "field": "email", "rule": "email", "message": "Invalid email format" }
 *   ],
 *   "meta": {},
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "traceId": "abc-123-def"
 * }
 * ```
 */
export interface ApiResponse<T = unknown> {
  /** Whether the request was successful */
  ok: boolean;
  /** Numeric status code (see ResponseCode) */
  code: number;
  /** Response type indicator */
  type: ResponseType;
  /** Short title describing the result */
  title: string;
  /** Detailed message for the user */
  message: string;
  /** Response data (null on error) */
  data: T | null;
  /** Validation errors (null on success) */
  errors: ValidationError[] | null;
  /** Additional metadata */
  meta: ResponseMeta;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Optional trace ID for debugging */
  traceId?: string;
}

/**
 * Standard Response Codes
 *
 * 1000-1999: Success codes
 * 2000-2999: Warning codes
 * 4000-4999: Client error codes
 * 5000-5999: Server error codes
 */
export const ResponseCode = {
  // Success (1000-1999)
  SUCCESS: 1000,
  CREATED: 1001,
  UPDATED: 1002,
  DELETED: 1003,
  NO_CONTENT: 1004,

  // Warnings (2000-2999)
  WARNING_PARTIAL: 2000,
  WARNING_DEPRECATED: 2001,

  // Client Errors (4000-4999)
  BAD_REQUEST: 4000,
  VALIDATION_ERROR: 4001,
  UNAUTHORIZED: 4010,
  FORBIDDEN: 4030,
  NOT_FOUND: 4040,
  CONFLICT: 4090,
  RATE_LIMITED: 4290,

  // Server Errors (5000-5999)
  INTERNAL_ERROR: 5000,
  SERVICE_UNAVAILABLE: 5030,
  GATEWAY_TIMEOUT: 5040,
} as const;

export type ResponseCodeType = (typeof ResponseCode)[keyof typeof ResponseCode];

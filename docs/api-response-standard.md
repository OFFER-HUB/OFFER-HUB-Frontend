# API Response Standard

## Overview

All API responses follow a consistent structure to simplify frontend handling and provide a great developer experience.

## Response Structure

```typescript
interface ApiResponse<T = unknown> {
  ok: boolean;           // Quick success check
  code: number;          // Numeric status code
  type: ResponseType;    // "success" | "error" | "warning"
  title: string;         // Short title for UI
  message: string;       // Detailed message for user
  data: T | null;        // Response payload
  errors: ValidationError[] | null;  // Field-level errors
  meta: ResponseMeta;    // Pagination/extra info
  timestamp: string;     // ISO 8601 timestamp
  traceId?: string;      // Optional request trace ID
}
```

### Validation Error Structure

```typescript
interface ValidationError {
  field: string;    // Field name (e.g., "email", "password")
  rule: string;     // Rule that failed (e.g., "required", "minLength")
  message: string;  // Human-readable message
}
```

### Response Meta Structure

```typescript
interface ResponseMeta {
  page?: number;       // Current page (1-indexed)
  perPage?: number;    // Items per page
  total?: number;      // Total items
  totalPages?: number; // Total pages
  [key: string]: unknown;  // Additional context
}
```

## Response Codes

### Success Codes (1000-1999)

| Code | Name | Description |
|------|------|-------------|
| 1000 | SUCCESS | Generic success |
| 1001 | CREATED | Resource created |
| 1002 | UPDATED | Resource updated |
| 1003 | DELETED | Resource deleted |
| 1004 | NO_CONTENT | Success with no data |

### Warning Codes (2000-2999)

| Code | Name | Description |
|------|------|-------------|
| 2000 | WARNING_PARTIAL | Partial success |
| 2001 | WARNING_DEPRECATED | Using deprecated feature |

### Client Error Codes (4000-4999)

| Code | Name | Description |
|------|------|-------------|
| 4000 | BAD_REQUEST | Invalid request |
| 4001 | VALIDATION_ERROR | Validation failed |
| 4010 | UNAUTHORIZED | Authentication required |
| 4030 | FORBIDDEN | Permission denied |
| 4040 | NOT_FOUND | Resource not found |
| 4090 | CONFLICT | Resource conflict |
| 4290 | RATE_LIMITED | Too many requests |

### Server Error Codes (5000-5999)

| Code | Name | Description |
|------|------|-------------|
| 5000 | INTERNAL_ERROR | Server error |
| 5030 | SERVICE_UNAVAILABLE | Service down |
| 5040 | GATEWAY_TIMEOUT | Upstream timeout |

## Examples

### Success Response (with data)

```json
{
  "ok": true,
  "code": 1000,
  "type": "success",
  "title": "User Retrieved",
  "message": "User profile loaded successfully.",
  "data": {
    "id": "usr_123abc",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "errors": null,
  "meta": {},
  "timestamp": "2024-01-15T12:00:00.000Z",
  "traceId": "req_abc123def"
}
```

### Success Response (with pagination)

```json
{
  "ok": true,
  "code": 1000,
  "type": "success",
  "title": "Users List",
  "message": "Found 150 users.",
  "data": [
    { "id": "usr_1", "name": "Alice" },
    { "id": "usr_2", "name": "Bob" }
  ],
  "errors": null,
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 150,
    "totalPages": 8
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Created Response

```json
{
  "ok": true,
  "code": 1001,
  "type": "success",
  "title": "User Created",
  "message": "Your account has been created successfully.",
  "data": {
    "id": "usr_new123",
    "email": "newuser@example.com"
  },
  "errors": null,
  "meta": {},
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### General Error Response

```json
{
  "ok": false,
  "code": 4040,
  "type": "error",
  "title": "Not Found",
  "message": "The requested user could not be found.",
  "data": null,
  "errors": null,
  "meta": {},
  "timestamp": "2024-01-15T12:00:00.000Z",
  "traceId": "req_xyz789"
}
```

### Validation Error Response

```json
{
  "ok": false,
  "code": 4001,
  "type": "error",
  "title": "Validation Failed",
  "message": "Please correct the errors below and try again.",
  "data": null,
  "errors": [
    {
      "field": "email",
      "rule": "email",
      "message": "Please enter a valid email address."
    },
    {
      "field": "password",
      "rule": "minLength",
      "message": "Password must be at least 8 characters."
    },
    {
      "field": "username",
      "rule": "unique",
      "message": "This username is already taken."
    }
  ],
  "meta": {},
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Server Error Response

```json
{
  "ok": false,
  "code": 5000,
  "type": "error",
  "title": "Server Error",
  "message": "An unexpected error occurred. Please try again later.",
  "data": null,
  "errors": null,
  "meta": {},
  "timestamp": "2024-01-15T12:00:00.000Z",
  "traceId": "req_err456"
}
```

## Frontend Usage

### Basic Usage

```typescript
const response = await httpGet<User>("/api/users/123");

if (response.ok) {
  // Success - data is typed as User
  console.log(response.data?.name);
} else {
  // Error - show message to user
  showToast(response.title, response.message, "error");
}
```

### Handling Validation Errors

```typescript
const response = await httpPost<User>("/api/users", formData);

if (!response.ok && response.errors) {
  // Map errors to form fields
  response.errors.forEach((error) => {
    setFieldError(error.field, error.message);
  });
}
```

### Handling Pagination

```typescript
const response = await httpGet<User[]>("/api/users", {
  params: { page: 1, perPage: 20 }
});

if (response.ok) {
  setUsers(response.data ?? []);
  setPagination({
    page: response.meta.page ?? 1,
    totalPages: response.meta.totalPages ?? 1,
    total: response.meta.total ?? 0
  });
}
```

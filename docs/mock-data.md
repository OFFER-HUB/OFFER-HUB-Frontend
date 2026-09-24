# Mock Data

## Overview

Mock data is essential during frontend development when backend APIs are unavailable or incomplete. This document defines the standards for organizing, creating, and managing mock data in OFFER-HUB.

## Directory Structure

```
src/
  mocks/
    data/                    # Static mock data files
      users.mock.ts
      products.mock.ts
      orders.mock.ts
    handlers/                # MSW request handlers (optional)
      users.handlers.ts
      products.handlers.ts
    factories/               # Data factories for dynamic generation
      user.factory.ts
      product.factory.ts
    index.ts                 # Central export
```

## File Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Static data | `{entity}.mock.ts` | `users.mock.ts` |
| Factories | `{entity}.factory.ts` | `user.factory.ts` |
| MSW handlers | `{entity}.handlers.ts` | `users.handlers.ts` |

## Static Mock Data

For simple, static data that doesn't need dynamic generation.

### Structure

```typescript
// src/mocks/data/users.mock.ts
import type { User } from "@/types/user.types";

export const MOCK_USER: User = {
  id: "usr_mock_001",
  email: "john.doe@example.com",
  name: "John Doe",
  role: "user",
  createdAt: "2024-01-15T10:00:00.000Z",
};

export const MOCK_USERS: User[] = [
  MOCK_USER,
  {
    id: "usr_mock_002",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    role: "admin",
    createdAt: "2024-01-10T08:30:00.000Z",
  },
];

export const MOCK_USER_EMPTY: User = {
  id: "",
  email: "",
  name: "",
  role: "user",
  createdAt: "",
};
```

### Naming Conventions

| Pattern | Usage | Example |
|---------|-------|---------|
| `MOCK_{ENTITY}` | Single default item | `MOCK_USER` |
| `MOCK_{ENTITIES}` | Array of items | `MOCK_USERS` |
| `MOCK_{ENTITY}_EMPTY` | Empty/default state | `MOCK_USER_EMPTY` |
| `MOCK_{ENTITY}_{VARIANT}` | Specific variant | `MOCK_USER_ADMIN` |

## Data Factories

For generating dynamic mock data with variations.

### Structure

```typescript
// src/mocks/factories/user.factory.ts
import type { User } from "@/types/user.types";

interface CreateUserOptions {
  id?: string;
  email?: string;
  name?: string;
  role?: "user" | "admin";
}

let userIdCounter = 1;

export function createMockUser(options: CreateUserOptions = {}): User {
  const id = options.id ?? `usr_mock_${String(userIdCounter++).padStart(3, "0")}`;

  return {
    id,
    email: options.email ?? `user${userIdCounter}@example.com`,
    name: options.name ?? `User ${userIdCounter}`,
    role: options.role ?? "user",
    createdAt: new Date().toISOString(),
  };
}

export function createMockUsers(count: number, options: CreateUserOptions = {}): User[] {
  return Array.from({ length: count }, () => createMockUser(options));
}

export function resetUserFactory(): void {
  userIdCounter = 1;
}
```

### Factory Guidelines

1. **Reset functions**: Always provide a reset function for counters
2. **Default values**: Provide sensible defaults for all fields
3. **Overrides**: Accept partial options to override defaults
4. **Deterministic IDs**: Use predictable ID patterns for testing

## API Response Mocks

Wrap mock data in the standard API response format.

```typescript
// src/mocks/data/responses.mock.ts
import type { ApiResponse } from "@/types/api-response.types";
import { MOCK_USER, MOCK_USERS } from "./users.mock";

export const MOCK_USER_RESPONSE: ApiResponse<typeof MOCK_USER> = {
  ok: true,
  code: 1000,
  type: "success",
  title: "User Retrieved",
  message: "User loaded successfully.",
  data: MOCK_USER,
  errors: null,
  meta: {},
  timestamp: "2024-01-15T12:00:00.000Z",
};

export const MOCK_USERS_PAGINATED_RESPONSE: ApiResponse<typeof MOCK_USERS> = {
  ok: true,
  code: 1000,
  type: "success",
  title: "Users List",
  message: "Found 2 users.",
  data: MOCK_USERS,
  errors: null,
  meta: {
    page: 1,
    perPage: 20,
    total: 2,
    totalPages: 1,
  },
  timestamp: "2024-01-15T12:00:00.000Z",
};

export const MOCK_ERROR_RESPONSE: ApiResponse<null> = {
  ok: false,
  code: 4040,
  type: "error",
  title: "Not Found",
  message: "The requested resource was not found.",
  data: null,
  errors: null,
  meta: {},
  timestamp: "2024-01-15T12:00:00.000Z",
};
```

## Central Export

Export all mocks from a central index for easy imports.

```typescript
// src/mocks/index.ts

// Data
export * from "./data/users.mock";
export * from "./data/products.mock";
export * from "./data/responses.mock";

// Factories
export * from "./factories/user.factory";
export * from "./factories/product.factory";
```

## Usage in Components

### Development-Only Mocks

Use environment checks to conditionally use mocks.

```typescript
// src/hooks/use-users.ts
import { useQuery } from "@tanstack/react-query";
import { httpGet } from "@/services/http-client";
import { MOCK_USERS_PAGINATED_RESPONSE } from "@/mocks";
import type { User } from "@/types/user.types";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (USE_MOCKS) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_USERS_PAGINATED_RESPONSE;
      }
      return httpGet<User[]>("/users");
    },
  });
}
```

### Environment Variable

Add to `.env.example` and `.env.local`:

```env
# Mock Data
NEXT_PUBLIC_USE_MOCKS=true
```

## Best Practices

### Do

- Keep mock data close to real data structure
- Use TypeScript types to ensure mock data matches interfaces
- Create factories for complex or frequently varied data
- Reset factories between tests
- Use realistic but obviously fake data (e.g., `example.com` emails)
- Document any edge cases the mock represents

### Don't

- Use mocks in production builds
- Hardcode mock data directly in components
- Create mocks without corresponding types
- Use sequential IDs that could conflict with real data
- Include sensitive-looking data (even if fake)

## Mock Data Checklist

When creating new mock data:

- [ ] Type matches the actual interface
- [ ] File follows naming convention (`*.mock.ts` or `*.factory.ts`)
- [ ] Exported from `src/mocks/index.ts`
- [ ] Uses realistic but obviously fake values
- [ ] Includes variants if needed (empty, error, loading states)
- [ ] Factory includes reset function if using counters

## Testing with Mocks

```typescript
// Example test
import { createMockUser, resetUserFactory } from "@/mocks";

describe("UserCard", () => {
  beforeEach(() => {
    resetUserFactory();
  });

  it("renders user name", () => {
    const user = createMockUser({ name: "Test User" });
    // ... test implementation
  });
});
```

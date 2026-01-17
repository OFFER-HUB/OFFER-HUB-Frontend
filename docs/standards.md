# Code Standards

## TypeScript

### Strict Mode

TypeScript strict mode is enabled. All code must be fully typed.

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

### Type Safety Rules

| Rule | Requirement |
|------|-------------|
| No `any` | Use `unknown` and narrow types |
| No unused variables | Remove or prefix with `_` |
| No implicit `any` | Always provide explicit types |
| Strict null checks | Handle `null` and `undefined` |

### Avoiding `any` - Critical Rule

The use of `any` defeats TypeScript's purpose. It is **strictly forbidden** except in extremely rare cases with explicit justification.

#### Why `any` is Dangerous

```typescript
// With any - no type safety, bugs slip through
function processData(data: any) {
  return data.foo.bar.baz; // No errors, crashes at runtime
}

// With unknown - forces safe handling
function processData(data: unknown) {
  if (isValidData(data)) {
    return data.foo.bar.baz; // Type-safe after validation
  }
  throw new Error("Invalid data");
}
```

#### Alternatives to `any`

| Instead of | Use |
|------------|-----|
| `any` | `unknown` + type narrowing |
| `any[]` | `unknown[]` or generic `T[]` |
| `Record<string, any>` | `Record<string, unknown>` |
| `Function` | Specific function signature |
| `object` | Specific interface or `Record<string, unknown>` |

#### Type Narrowing Examples

```typescript
// Type guard function
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value
  );
}

// Usage
function handleResponse(data: unknown) {
  if (isUser(data)) {
    // data is now typed as User
    console.log(data.email);
  }
}

// Zod validation (preferred for API responses)
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

function parseUser(data: unknown) {
  return UserSchema.parse(data); // Returns typed User or throws
}
```

#### When `any` Might Be Acceptable (Rare)

Only with an explicit comment explaining why:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Reason: Third-party library X returns untyped data, creating proper types is tracked in issue #123
const result = externalLib.getData() as any;
```

#### ESLint Enforcement

This rule is enforced by ESLint:

```javascript
"@typescript-eslint/no-explicit-any": "error"
```

PRs with `any` will be rejected unless accompanied by:
1. A comment explaining why it's necessary
2. A tracking issue for proper typing
3. Approval from a senior developer

### Exports

Prefer named exports:
```typescript
// Correct
export function formatDate(date: Date): string { ... }
export const MAX_ITEMS = 100;

// Exception: Next.js pages and layouts use default exports
export default function Page() { ... }
```

## ESLint Configuration

Key rules enforced:

```javascript
{
  "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  "@typescript-eslint/no-explicit-any": "error",
  "prefer-const": "error",
  "no-console": ["warn", { allow: ["warn", "error"] }]
}
```

## Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## Import Order

Imports should be ordered:

1. React/Next.js imports
2. Third-party packages
3. Internal imports (`@/`)

```typescript
// 1. React/Next
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

// 3. Internal
import { cn } from "@/lib/cn";
import type { ApiResponse } from "@/types/api-response.types";
```

## Import Rules

### Always Use Path Aliases

```typescript
// Correct
import { cn } from "@/lib/cn";

// Incorrect
import { cn } from "../../lib/cn";
import { cn } from "./lib/cn";
```

### No Barrel Exports

Do not create `index.ts` files that re-export everything. Import directly from source files.

## Error Handling

### Never Throw Raw Strings

```typescript
// Correct
throw new Error("User not found");
throw new HttpError(404, "Not Found", "User not found");

// Incorrect
throw "User not found";
```

### Use Typed Errors

```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}
```

## Do / Don't List

### Do

- Use `const` by default, `let` only when reassignment is needed
- Write pure functions for utilities
- Validate environment variables at startup
- Use descriptive variable and function names
- Handle all error cases explicitly
- Keep functions small and focused

### Don't

- Use `var` - always use `const` or `let`
- Use `any` - use `unknown` and type narrowing
- Mutate function parameters
- Use inline styles
- Use CSS-in-JS libraries
- Commit `.env` files
- Use relative imports (`../`)
- Create unnecessary abstractions

## File Size Guidelines

- Components: Max ~200 lines
- Utility functions: Max ~50 lines per function
- Type files: Split by domain when > 100 lines

## Scroll Behavior - CRITICAL RULES

The app uses a specific scroll system that **MUST NOT be modified**. The layout is configured in `/src/app/app/layout.tsx` and `/src/app/globals.css`.

### How the Scroll System Works

1. **App Layout** (`/src/app/app/layout.tsx`):
   - The root container has `overflow-hidden` (class `app-no-scroll`)
   - The main content area has class `app-main-content` which enables `overflow-y: auto`
   - This allows pages to scroll by default

2. **CSS Classes** (`/src/app/globals.css`):
   - `.app-no-scroll`: Disables scroll on html/body
   - `.app-main-content`: Enables vertical scroll on the main content area
   - `.page-full-height`: Used for pages that should NOT scroll externally

### Page Categories

#### Pages that NEED scroll (DEFAULT behavior):
- Dashboard (`/app/freelancer/dashboard`)
- Disputes list (`/app/freelancer/disputes`)
- Profile (`/app/freelancer/profile`)
- Services list (`/app/freelancer/services`)
- Service detail (`/app/freelancer/services/[id]`)
- Portfolio (`/app/freelancer/portfolio`)
- Any page with content that extends beyond the viewport

**DO NOT add `page-full-height` class to these pages.**

#### Pages that should NOT have external scroll:
- Chat/Messages (`/app/chat/[id]`)
- Any page that displays everything within the viewport and manages its own internal scroll

**These pages MUST have `page-full-height` class on their root container.**

### Rules for Developers and AI

| Rule | Description |
|------|-------------|
| Never remove `app-main-content` | This class enables scroll on the main content area |
| Never change overflow settings | Do not modify overflow properties in globals.css for these classes |
| Never add `page-full-height` to scrollable pages | Only use for pages that fill the viewport completely |
| Always verify scroll | After making changes to any page, verify scroll works correctly |
| Default is scrollable | When creating new pages, follow the default (scrollable) pattern |

### Correct Page Structure Examples

**Scrollable page (default - most pages):**
```tsx
export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="space-y-4">
      {/* Content that may exceed viewport height - WILL SCROLL */}
    </div>
  );
}
```

**Full-height page (no external scroll - only Chat/Messages):**
```tsx
export default function ChatPage(): React.JSX.Element {
  return (
    <div className="page-full-height flex flex-col">
      {/* Content that manages its own internal scroll */}
      <div className="flex-1 overflow-y-auto">
        {/* Scrollable area inside */}
      </div>
    </div>
  );
}
```

### Warning

This scroll behavior has been broken multiple times. **DO NOT MODIFY** the scroll-related CSS classes or layout structure without explicit approval. If scroll is not working on a page, the issue is likely:
1. Incorrectly added `page-full-height` class
2. Missing `min-h-0` on flex containers
3. Conflicting overflow styles

## Comments

- Avoid obvious comments
- Document "why" not "what"
- Use JSDoc for public APIs
- IT IS ESSENTIAL THAT WHEN DESIGNING NEW COMPONENTS OR PAGES,  RESPONSIVE BEHAVIOR IS ENSURED AND PROPERLY IMPLEMENTED. THIS IS A CRITICAL POINT THAT MUST BE ADDRESSED.
```typescript
/**
 * Merges class names with Tailwind conflict resolution.
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

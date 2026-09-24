# Naming Conventions

## Overview

Consistent naming improves code readability and maintainability. Follow these conventions throughout the project.

## Files and Folders

### Folders: kebab-case

```
src/
  components/
    user-profile/
    auth-form/
  services/
    http-client.ts
  types/
    api-response.types.ts
```

### Files by Type

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase.tsx | `UserProfile.tsx` |
| Hooks | use-xxx.ts | `use-auth.ts` |
| Types | xxx.types.ts | `api-response.types.ts` |
| Schemas | xxx.schema.ts | `user.schema.ts` |
| Constants | xxx.constants.ts | `routes.constants.ts` |
| Utilities | kebab-case.ts | `http-client.ts` |
| Pages | page.tsx (Next.js) | `app/dashboard/page.tsx` |
| Layouts | layout.tsx (Next.js) | `app/dashboard/layout.tsx` |

## Code Elements

### Variables and Functions: camelCase

```typescript
// Variables
const userName = "John";
const isAuthenticated = true;
const maxRetryCount = 3;

// Functions
function getUserById(id: string) { ... }
function formatCurrency(amount: number) { ... }
async function fetchUserProfile() { ... }
```

### Constants: SCREAMING_SNAKE_CASE or camelCase

Use SCREAMING_SNAKE_CASE for true constants (compile-time values):
```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const API_VERSION = "v1";
const DEFAULT_PAGE_SIZE = 20;
```

Use camelCase for runtime constants:
```typescript
const defaultConfig = { ... };
const initialState = { ... };
```

### Components: PascalCase

```typescript
// Component definition
function UserProfile({ user }: UserProfileProps) { ... }

// Component usage
<UserProfile user={currentUser} />
<AuthForm onSubmit={handleAuth} />
```

### Types and Interfaces: PascalCase

```typescript
// Types
type UserId = string;
type ResponseType = "success" | "error" | "warning";

// Interfaces
interface UserProfile {
  id: string;
  email: string;
  name: string;
}

interface ApiResponse<T> {
  ok: boolean;
  data: T | null;
}
```

### Type Props: ComponentNameProps

```typescript
interface UserCardProps {
  user: User;
  onSelect?: (user: User) => void;
}

function UserCard({ user, onSelect }: UserCardProps) { ... }
```

### Hooks: useXxx

```typescript
// Custom hooks
function useAuth() { ... }
function useLocalStorage<T>(key: string) { ... }
function useDebounce<T>(value: T, delay: number) { ... }
```

### Event Handlers: handleXxx or onXxx

```typescript
// In component
function handleSubmit(event: FormEvent) { ... }
function handleUserSelect(user: User) { ... }

// Props
interface FormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}
```

### Boolean Variables: is/has/can/should

```typescript
const isLoading = true;
const hasError = false;
const canEdit = user.role === "admin";
const shouldRefetch = data === null;
```

## CSS Classes

### Tailwind: utility classes as-is

```tsx
<div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
```

### Custom classes: kebab-case

```css
.hero-gradient {
  background: var(--gradient-hero);
}

.card-neumorphic {
  box-shadow: var(--shadow-neumorphic-dark);
}
```

## API and Routes

### API Routes: kebab-case

```
/api/auth/sign-in
/api/users/[id]
/api/products/featured
```

### Query Parameters: camelCase

```
?pageSize=20&sortBy=createdAt&isActive=true
```

## Examples Summary

```typescript
// File: src/components/user-card/UserCard.tsx

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { User } from "@/types/user.types";

interface UserCardProps {
  user: User;
  isSelected?: boolean;
  onSelect?: (user: User) => void;
}

const MAX_NAME_LENGTH = 50;

export function UserCard({ user, isSelected = false, onSelect }: UserCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onSelect?.(user);
  };

  const displayName = user.name.length > MAX_NAME_LENGTH
    ? `${user.name.slice(0, MAX_NAME_LENGTH)}...`
    : user.name;

  return (
    <div
      className={cn(
        "p-4 rounded-lg",
        isSelected && "ring-2 ring-primary",
        isHovered && "bg-secondary/50"
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3>{displayName}</h3>
      <p>{user.email}</p>
    </div>
  );
}
```

# Architecture

## Overview

OFFER-HUB Frontend is a Next.js 15 application using the App Router pattern. The project follows a modular architecture with clear separation of concerns.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4 (CSS-first configuration)
- **Auth**: NextAuth v5 + custom JWT (Zustand-persisted)
- **State Management**: Zustand
- **Server State**: TanStack React Query
- **Forms**: React Hook Form + Zod
- **Blockchain**: Stellar (Soroban via TrustlessWork, SWK client-side signing)

## Directory Structure

```
src/
  app/              # Next.js App Router pages and layouts
    app/            # Authenticated app shell (sidebar + header)
    auth/           # Auth flows (login, register, OAuth callback, …)
    api/            # Next.js API routes (minimal — most logic is in the NestJS API)
    layout.tsx      # Root layout
    globals.css     # Global styles and CSS variables

  components/       # Reusable React components
    ui/             # Low-level UI primitives (Icon, Modal, …)
    wallet/         # Wallet-specific display components
    settings/       # Settings page card components
    admin/          # Admin panel components
    …               # Feature-specific component folders

  hooks/            # Custom React hooks
    useOrderActions.ts          # All order-page escrow/signing actions
    useEscrowSigningAction.ts   # Unified hook for on-chain signing steps
    useClientDashboardData.ts   # Data-fetching hook for client dashboard
    …

  lib/
    api/            # API call functions (the canonical HTTP layer — see below)
    cn.ts           # Class name utility (clsx + tailwind-merge)
    styles.ts       # Neumorphic Tailwind class constants
    …

  stores/           # Zustand global state stores
    auth-store.ts   # Auth + wallet connection state

  types/            # TypeScript type definitions (domain types live here)
    user.types.ts            # User, UserWallet, UserBalance
    wallet.types.ts          # All wallet domain types
    order.types.ts           # Order, OrderStatus, …
    dispute.types.ts         # Dispute domain
    …                        # One file per domain

  config/
    api.ts          # API_URL — the single base-URL source for all fetch calls

  data/             # Static mock data and constants (development / fallback)
  services/         # Legacy entry point — see "API Layer" section below
```

## Why App Router?

1. **Server Components**: Default server rendering for better performance
2. **Streaming**: Progressive rendering with Suspense
3. **Nested Layouts**: Shared UI across routes
4. **Parallel Routes**: Multiple pages in the same view
5. **Intercepting Routes**: Modal patterns without breaking back button

## Path Aliases

All imports use the `@/` alias mapped to `src/`:

```typescript
// Correct
import { cn } from "@/lib/cn";
import type { ApiResponse } from "@/types/api-response.types";

// Incorrect - never use relative imports
import { cn } from "../../lib/cn";
```

Configuration in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Styling Architecture

### CSS Variables

All design tokens are defined as CSS variables in `globals.css`:

- Colors: `--color-*`
- Shadows: `--shadow-*`
- Gradients: `--gradient-*`

### Tailwind CSS 4

Uses CSS-first configuration with `@theme` directive instead of JavaScript config.

Theme customization happens in `globals.css`:
```css
@theme {
  --color-primary: #149A9B;
}
```

### Dark Mode

Dark mode is class-based (`.dark` on `<html>`):
```css
@custom-variant dark (&:where(.dark, .dark *));
```

## Authentication

Auth.js v5 is configured in `src/auth.ts` and exposes:
- `auth()` - Get session (server-side)
- `handlers` - API route handlers
- `signIn()` - Sign in function
- `signOut()` - Sign out function

## API Layer

All communication with the NestJS backend goes through `src/lib/api/`.

```
src/lib/api/
  auth.ts             # Login, register, OAuth, wallet-auth
  orders.ts           # Order CRUD and escrow operations
  wallet.ts           # Platform ledger (balance, transactions, withdrawal)
  wallet-connect.ts   # Link/unlink external wallets
  disputes.ts         # Dispute creation and resolution
  services.ts         # Freelancer service listings
  community.ts        # Public community map
  …                   # One file per backend resource
```

### Rules

- **`src/config/api.ts` is the single base-URL source.** Every `fetch` call in
  `lib/api/` reads `API_URL` from there — never hard-code `localhost` or a full URL.
- **No component or page may call `fetch` directly.** All network calls go through a
  function exported from `lib/api/*.ts`.
- **All exported function return types must be fully typed** — `Promise<any>` is not
  allowed (see [standards.md §Avoiding any](standards.md)).
- **Domain types belong in `src/types/`**, not inline in the api file. Each api file
  imports from the corresponding `src/types/<domain>.types.ts`.

### What `src/services/` is for

`src/services/` is a leftover entry point from an earlier scaffold. It no longer
contains live HTTP client code. Do not add new files there — add them to `src/lib/api/`
instead. The folder will be removed once confirmed empty.

# Auth: NextAuth ↔ Backend JWT Handshake

This document describes how the frontend turns **NextAuth (v5) sessions** (GitHub / Google OAuth) into the **backend (NestJS) JWT** that the rest of `src/lib/api/*` consumes, and how we handle 401s on the request layer.

This is the implementation for **issue #209 — "Fix: Connect NextAuth session with backend JWT for authenticated API calls"**.

## Why

- `src/auth.ts` boots NextAuth with two OAuth providers (GitHub, Google). NextAuth has its own (encrypted) session cookies that **are not** accepted by the backend NestJS API.
- The backend (`/api/v1`) issues JWTs on `POST /auth/login`, `POST /auth/oauth/callback`, and `POST /auth/refresh`. These are the tokens every authenticated backend endpoint expects.
- Before #209, the two systems were loosely connected at the surface but the request layer had **no automatic refresh path**, so any expired access token surfaced as a hard 401 and effectively broke authenticated features.

## Single Source of Truth

`src/stores/auth-store.ts` (Zustand, persisted to `localStorage`) now owns:

```ts
{
  user: User | null;
  token: string | null; // backend access token (Bearer)
  refreshToken: string | null; // backend refresh token, rotated on /auth/refresh
  isAuthenticated: boolean;
  // ...
}
```

Tokens live in `localStorage` rather than cookies to dodge the 4 KB cookie size ceiling (which was the original reason for the localStorage migration documented in `docs/mock-authentication.md`).

`next-auth`'s session is **only** used as the OAuth handshake transport. Once the backend JWT is in the auth store, the NextAuth session is signed out (`/src/app/auth/callback/page.tsx` calls `signOut({ redirect: false })` on success).

## Sign-in Flows

### Credentials (`POST /api/auth/login` → backend `POST /auth/login`)

1. The browser submits email + password to the Next.js BFF at `POST /api/auth/login`.
2. The BFF proxies to `${API_URL}/auth/login` and returns `{ user, token, refreshToken }`.
3. The login page (`src/app/login/page.tsx`) calls `useAuthStore.login(user, token, refreshToken)` so all three are persisted.
4. Subsequent `httpGet` / `httpPost` calls auto-attach `Authorization: Bearer <token>`.

### OAuth (`/api/auth/[...nextauth]` ↔ backend `POST /auth/oauth/callback`)

1. The user clicks the Google / GitHub button in `SocialAuthButtons.tsx`, which calls `signIn(provider, { callbackUrl: "/auth/callback" })`.
2. NextAuth finishes the OAuth dance and exposes the provider identity on its session via the `jwt` / `session` callbacks in `src/auth.ts`:
   - `provider`
   - `providerAccountId`
   - `oauthEmail`
   - `oauthName`
   - `oauthAvatarUrl`
3. The callback page (`src/app/auth/callback/page.tsx`) reads `useSession()` and POSTs those fields to `/api/v1/auth/oauth/callback`, which returns `{ action: "LOGIN" \| "REGISTER", user, token, refreshToken }`.
4. The callback page writes all three into the auth store, then signs NextAuth out so it does not leak the OAuth identity into the rest of the app.
5. If `action === "REGISTER"`, the onboarding tour is queued via `localStorage`.

## Request Layer (401 → refresh → retry)

`src/services/http-client.ts` automatically attaches the bearer token from the store on every call.

When a request returns **401** AND we sent a token (so it was an authenticated request):

1. `refreshAccessToken()` in `src/lib/api/refresh.ts` is called. This hits `${API_URL}/auth/refresh` with `{ refreshToken }` from the store.
2. The refresh helper is de-duplicated: if several concurrent requests all hit a 401, they share one in-flight `refreshAccessToken()` promise (`inFlightRefresh`).
3. On success, the helper calls `useAuthStore.setAuthTokens(token, refreshToken)` so the rotated pair is persisted and the original 401-causing request is retried **exactly once** with the new token.
4. On failure (expired refresh token, network error, etc.):
   - If the backend said the refresh token is invalid, `useAuthStore.logout()` is called — clearing localStorage AND the httpOnly auth-token cookies (`/api/auth/token` DELETE).
   - If the network itself failed, we **do not** kick the user out (a flaky connection should not force re-login). The caller receives the original 401.

The retry happens through a direct call to `executeRawRequest` (not back through `request`), so we can never loop.

## Token Storage Layout

```
┌────────────────────────────────────────────────────────┐
│  localStorage["auth-state"] (Zustand persist)          │
│  { user, token, refreshToken, isAuthenticated }        │
└────────────────────────────────────────────────────────┘
                 ▲                                  ▲
   login(user,    │                                  │ setAuthTokens
   token, refreshToken)                             │ (token, refreshToken)
                 │                                  │
   ┌─────────────────────────────────────────────────────────┐
   │ src/app/api/auth/login/route.ts        (BFF)            │
   │ src/app/auth/callback/page.tsx        (OAuth callback) │
   └─────────────────────────────────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────┐
   │ Backend (${API_URL}/auth/...)                          │
   │  POST /auth/login                                       │
   │  POST /auth/oauth/callback                              │
   │  POST /auth/refresh   ← rotated tokens                 │
   └─────────────────────────────────────────────────────────┘
                                  ▲   ▲
                                  │   │
   ┌──────────────────────┐  401  │   │  successful refresh
   │ src/services/        │ ──────┘   │
   │ http-client.ts       │ ──────────┘
   └──────────────────────┘
```

## Files changed/added in #209

| File                                          | Purpose                                                                                |
| --------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/stores/auth-store.ts`                    | adds `refreshToken` state, `setAuthTokens()` action, persists refreshToken             |
| `src/lib/api/refresh.ts` (new)                | single-call backend refresh helper with in-flight dedup                                |
| `src/services/http-client.ts`                 | automatic 401 → refresh → retry once (uses `refreshAccessToken`)                       |
| `src/lib/api/oauth.ts`                        | `OAuthCallbackResult` now exposes `refreshToken?`                                      |
| `src/app/api/auth/login/route.ts`             | forwards backend `refreshToken` in the BFF response                                    |
| `src/app/auth/callback/page.tsx`              | persists the OAuth `refreshToken`                                                      |
| `src/app/login/page.tsx`                      | persists credentials `refreshToken`                                                    |
| `src/app/register/page.tsx`                   | persists credentials `refreshToken` (auto-login)                                       |
| `src/lib/auth-client.ts`                      | trimmed: removes unused interval polling / refreshAuthToken; keeps `clearAuthTokens()` |
| `src/app/api/auth/refresh/route.ts` (deleted) | was a mocked BFF; replaced by direct client → backend refresh call                     |
| `src/app/api/auth/token/route.ts`             | kept `DELETE` for logout cleanup; dropped the unused `POST` (write cookies) and `GET` (read auth status) since tokens now live in `localStorage` |

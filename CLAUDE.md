# OfferHub Frontend — CLAUDE.md

> **If you are an AI agent:** Read this file completely, then read every file in `/docs/` before writing any line of code. Do not skip this step.

---

## What is OfferHub

OfferHub is a non-custodial freelance marketplace built on Stellar. Clients lock payments in Soroban escrow contracts via TrustlessWork. Freelancers deliver work and receive funds settled to local bank accounts across 7 LATAM corridors via BlindPay — without OfferHub ever holding user funds.

- **Live:** Testnet with 103 registered users, 15 Soroban escrows, 4 on-chain transactions
- **Architecture page:** https://www.offer-hub.tech/architecture
- **GitHub org:** https://github.com/OFFER-HUB

---

## SCF Build Award #44 — $74,000

OfferHub is an SCF Integration Track grantee. Every line of code written under this grant must directly serve the defined deliverables. Read the full context in the API repo:

- `OFFER-HUB-API/docs/scf-build-submission-en.md` — Full English submission (canonical reference)
- `OFFER-HUB-API/docs/scf-build-submission.md` — Spanish version

### Tranche Deliverables

#### T1 — MVP: SWK Connection & Auth ($16,000) — deadline Sep 10, 2026
- **D1.1** Multi-wallet connection UI (Freighter, Lobstr, xBull) with balance display — `$7,500`
- **D1.2** Wallet-based authentication — hybrid login (wallet tab + email/password tab) — `$8,500`
- SCF verification: video demo + end-to-end testnet walkthrough

#### T2 — Testnet: Core Integrations ($19,500) — deadline Oct 20, 2026
- **D2.1** SWK client-side Soroban signing UI — 4 operations from browser
- **D2.2** BlindPay off-ramp UI — corridor selection, fiat payout confirmation
- **D2.3** Off-ramp orchestration frontend layer
- **D2.4** E2E integration tests

#### T3 — Mainnet Launch & OS Adapters ($30,500) — deadline Dec 5, 2026
- **D3.1** Stellar RPC migration (frontend SDK update)
- **D3.2** Mainnet deployment
- **D3.3** offer-hub.org/stats — live public metrics dashboard
- **D3.4** QA + monitoring
- **D3.5** Open-source adapter packages published to npm

### Custodial → Non-Custodial Migration

103 existing users have auto-generated server-side wallets. Migration is opt-in and phased:
- **T1:** Users can connect their own wallet (Freighter/Lobstr/xBull) and link it to their account
- **T2:** All Soroban operations sign client-side via SWK — user must be online to approve
- **T3:** Server-side signing removed entirely from codebase

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| UI | React 19, Tailwind CSS |
| State | Zustand (with localStorage persistence) |
| Auth | NextAuth v5 + custom backend JWT |
| Wallet | `@creit.tech/stellar-wallets-kit` (T1) |
| Data fetching | TanStack Query |
| Forms | react-hook-form + Zod |

---

## Project Structure

```
src/
  app/              # Next.js App Router pages (orchestrators only — no business logic)
  components/       # Reusable UI components (single responsibility)
    providers/      # Context providers (WalletKitProvider, etc.)
    ui/             # Atomic UI components
    wallet/         # Wallet-specific components
  hooks/            # Custom React hooks (data + behavior)
  stores/           # Zustand stores (global state)
  services/         # API client functions
  types/            # TypeScript types and interfaces
  lib/              # Utilities and helpers
  config/           # Constants and configuration
```

### Architecture Rules

- **Pages are orchestrators:** `page.tsx` files only import and compose components. No JSX logic, no fetch calls, no business logic inline.
- **Components have single responsibility:** One component = one concern. Split aggressively.
- **Hooks own behavior:** Any stateful logic or side effects belong in a custom hook, not a component.
- **Services own API calls:** All `fetch`/axios calls live in `/services/`, never inline in components or hooks.
- **Types are centralized:** All interfaces, types, and enums live in `/types/`.

---

## Standards & Conventions

> Read all files in `/docs/` before writing any code.

- **Code standards:** [`docs/standards.md`](docs/standards.md)
- **Naming conventions:** [`docs/naming.md`](docs/naming.md)
- **Style guide:** [`docs/style-guide.md`](docs/style-guide.md)
- **UI states:** [`docs/ui-states.md`](docs/ui-states.md)
- **API response standard:** [`docs/api-response-standard.md`](docs/api-response-standard.md)
- **Architecture:** [`docs/architecture.md`](docs/architecture.md)
- **Brand book:** [`docs/BRAND-BOOK.md`](docs/BRAND-BOOK.md)

### Design System

| Token | Value |
|-------|-------|
| Background | `#F1F3F7` |
| Primary | `#149A9B` (teal) |
| Secondary | `#002333` (dark navy) |
| Raised shadow | `shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]` |
| Sunken shadow | `shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]` |
| Border radius (container) | `rounded-2xl` |
| Border radius (interactive) | `rounded-xl` |

### Key Rules

- No `any` — TypeScript strict mode enforced
- All components must handle loading, error, and empty states (see `docs/ui-states.md`)
- No hardcoded strings — use constants from `/config/`
- No direct API calls outside `/services/`
- No business logic in `page.tsx` files
- All forms must use react-hook-form + Zod validation

---

## Auth Architecture (Current — T1 target)

**Current (pre-T1):**
- NextAuth v5 handles OAuth (GitHub/Google) — does NOT store backend JWT
- Zustand `auth-store.ts` stores `{ user, token }` from email/password login in `localStorage`
- Dual system — not fully unified (known issue)

**T1 target:**
- Add third auth path: wallet signature (SWK challenge-response)
- Hybrid login UI: tab "Email/Password" + tab "Connect Wallet"
- Wallet state: `walletAddress`, `walletConnected`, `connectWallet()`, `disconnectWallet()` in `auth-store.ts`
- JWT from wallet auth stored same way as email/password JWT

---

## Public Repo Notice

This is a **public repository** used for open-source contributions. Issues labeled `[Internal]` are internal development tasks managed by the core team — they are not contribution opportunities.

---

## Git Conventions

- Branch: `feat/<description>`, `fix/<description>`, `chore/<description>`
- Commits: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`)
- PRs must reference the issue: `Closes #N`
- No `Co-Authored-By: Claude` lines
- PRs must use `.github/PULL_REQUEST_TEMPLATE.md`
- Every issue belongs to a milestone (T1, T2, or T3)
- All internal issues must have the `[Internal]` label

### NEVER push directly to `main`

**Every change must go through a Pull Request — no exceptions.**

This applies even when resolving rebase conflicts on stacked branches. The correct flow when a PR has conflicts:

1. Rebase the branch locally onto `main`
2. Push the rebased branch to `origin/<branch>` (never to `main`)
3. Merge via `gh pr merge` or GitHub UI

If `gh pr merge` still fails after rebase, open a new PR from the rebased branch. Do not push to `main` directly under any circumstances.

**Active GitHub account for all operations:** `Josue19-08` (`josuemarin2009@hotmail.com`). Run `gh auth switch --user Josue19-08` before any `gh` command.

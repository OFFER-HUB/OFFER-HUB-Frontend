# Sub Rosa sealed proposals

OFFER HUB has two Sub Rosa surfaces:

- `live/` is the real Stellar integration used by offer creation, marketplace
  applications, timed reveal, and provider selection.
- the optional `/labs/sub-rosa` route is an isolated in-memory walkthrough.

## Live flow

1. The client enables **Private / Sealed Proposals** while creating an offer.
2. The app creates a Core v2 `ReceiptOnly` round through `@sub-rosa/sdk` and
   stores the offer-to-round coordinates in Supabase.
3. Each freelancer seals and submits a proposal with their Stellar identity.
   OFFER HUB stores only an application placeholder until reveal.
4. Once the Drand round is available, the client runs **Reveal all proposals**.
5. The decoded proposal, price, and timeline become visible together. The
   client then accepts one provider through OFFER HUB's existing application
   status flow; Sub Rosa does not choose a winner.

Wallet transactions use the existing Stellar Wallets Kit connection. No
secret key is handled by the frontend.

## Local setup

Install dependencies and copy the example environment:

```bash
npm install
cp .env.example .env.local
```

Set these values in `.env.local`:

```bash
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

Run [`docs/sub-rosa-round-registry.sql`](../../../docs/sub-rosa-round-registry.sql)
in the Supabase SQL editor, then start the app with `npm run dev`.

The registry contains only immutable round coordinates and evidence. Public
read is intentional so marketplace visitors can discover a round. Anonymous
insert supports the frontend-only hackathon setup; its primary key makes each
offer write-once and UPDATE/DELETE are not granted. A production deployment
should move round registration behind authenticated server-side authorization.

If the Supabase variables are absent, the app uses `localStorage`. That is
useful for development in one browser but cannot support two users or devices.

## Optional labs walkthrough

Set `NEXT_PUBLIC_SUBROSA_DEMO=true` to enable `/labs/sub-rosa`. The route uses
sample data only and makes no network or on-chain claims. It remains separate
from the live integration so the educational walkthrough cannot be confused
with real evidence.

# Sub Rosa — sealed proposals demo

An **isolated, removable** evaluation page for [Sub Rosa](https://github.com/karagozemin/Sub-Rosa),
a third-party protocol that offers an optional sealed-proposal layer for marketplaces: freelancers
submit privately, everything is revealed together at a shared deadline, and only then does the
client compare and pick.

Route: **`/labs/sub-rosa`** (disabled by default).

## How to enable it

```bash
# .env.local
NEXT_PUBLIC_SUBROSA_DEMO=true
```

With the flag unset or `false`, the route calls `notFound()` and behaves as if it does not exist.

## How to remove it

```bash
rm -rf src/features/sub-rosa src/app/labs
```

Then delete the `NEXT_PUBLIC_SUBROSA_DEMO` block from `.env.example`. That is the whole removal —
there is no lockfile change to revert, no store or service to unwire, and no migration.

## Why it is isolated rather than integrated

This is an evaluation, not an adopted dependency. The reasons are concrete:

| Concern | Evidence |
| --- | --- |
| No funds-handling audit | Sub Rosa's own [`docs/LIMITATIONS.md`](https://github.com/karagozemin/Sub-Rosa/blob/main/docs/LIMITATIONS.md): *"Core v2 … has no independent funds-handling audit yet"* |
| Latest SDK is uninstallable with npm | `npm i @sub-rosa/sdk@0.2.2` fails with `EUNSUPPORTEDPROTOCOL` — it publishes `workspace:^` dependency specifiers. Only `0.2.1` resolves |
| Stellar SDK version clash | `@sub-rosa/sdk` requires `@stellar/stellar-sdk@^15`; OFFER-HUB-API is on `14.4.3` |
| Outside SCF scope | Sub Rosa is not a deliverable of T1, T2 or T3 of Build Award #44 |
| Receipts do not verify chain state | Receipt verification is offline only — it checks internal consistency, not current on-chain state |

So the demo installs **nothing**: no `@sub-rosa/sdk`, no `@stellar/stellar-sdk`, no change to
`package.json` or `package-lock.json`. The sealed-round lifecycle is simulated in memory.

## Structure

```
sub-rosa.constants.ts   flag, copy, links
sub-rosa.types.ts       SealedRound, SealedProposal, RoundPhase, …
adapter/
  sub-rosa-adapter.ts   the seam — interface only
  mock-adapter.ts       the only implementation today (in memory)
mocks/
  sealed-round.mock.ts  sample job + three fictional providers
hooks/
  use-sealed-round.ts   lifecycle state machine
components/             presentational only
```

Everything lives in one folder rather than being spread across `components/`, `hooks/`, `types/`
and `mocks/` as the repo convention would normally have it. That is deliberate: removability is
the point of this feature, and hunting pieces across five directories would defeat it. Naming
rules from [`docs/naming.md`](../../../docs/naming.md) are still followed, and `page.tsx` is still
a pure orchestrator.

## The honesty rules

Sub Rosa's [Offer-Hub pilot doc](https://github.com/karagozemin/Sub-Rosa/blob/main/docs/pilots/OFFER_HUB_PILOT.md)
states that sample proposals must never be presented as on-chain evidence. This page holds to
that:

- no fabricated round ID, contract ID, transaction hash, signature or receipt — those fields read
  `Sample only` / `Not claimed`;
- `Protocol winner: None for ReceiptOnly`, because the client's choice is application state and
  never a protocol result;
- a persistent `DemoBanner` above the fold, so screenshots carry their own disclaimer.

Keep these if you extend the demo.

## If it ever goes real

Write a `live-adapter.ts` against the `SubRosaAdapter` interface and swap the argument passed to
`useSealedRound()`. The method names already mirror the real SDK surface
(`createSealedProposalRound`, `sealProposal` + `submitV2`, `open_reveal_v2`, `reveal_v2`). No UI
component would change.

That step means installing an unaudited dependency and signing real transactions, so it belongs in
its own reviewed PR — not here.

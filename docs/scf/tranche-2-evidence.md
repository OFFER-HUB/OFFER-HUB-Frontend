# SCF #44, Tranche 2: Evidence Pack

Supporting evidence for Tranche #2 (Testnet), prepared in response to the review panel's questions. The backend repository (OFFER-HUB-API) is private; everything the reviewers need to verify Tranche 2 is published here, and reviewer access to the private repository has been granted.

Last updated: 2026-09-29. All transactions are on Stellar **testnet**. BlindPay is used in its sandbox, which settles in the test stablecoin USDB.

## 1. Deliverable 2.1: transactions and signers

Two accounts appear in every escrow:

| Role | Account | Custody |
|---|---|---|
| Buyer (deployer, funder, approver, release signer, dispute opener) | `GBUFHWMF2GCVS3MEBM7Q55XR73UHUVI5VYUDHSEXTHAJXORYULOX274N` | **Non-custodial.** External wallet, signed in the user's own wallet through Stellar Wallets Kit. The server stores no key for it. |
| Platform (dispute resolver only) | `GBTA5SOFPHAHPJKZGGH4KVI6SZNUJZZKTQ6BKGSIGTZ466VO45KQ2NCD` | Held by the platform. Signs `resolve_dispute` only. |

`GBUFHWMF…274N` is the **buyer**, not the platform. It appears as the deployer of all three escrows because the buyer creates the escrow from their own wallet.

Signer below is the transaction source account, decoded from each transaction envelope. Every Soroban authorization entry in these transactions uses that same source account.

Explorer link format: `https://stellar.expert/explorer/testnet/tx/<hash>`

### Order 1: standard release, paid out in Brazil (PIX). Escrow `CD5SOA4ORLMLLJJKPV76OXXE5R5ANQN7IVA3VYB2UWXPR4NXTBIO5DN6`

| Operation | Signer | Transaction hash |
|---|---|---|
| Create (deploy) | Buyer | `f23666eeeabd7eea413df79b7612ff48064a4de6f4356994d8e3755a337cd887` |
| Fund | Buyer | `02bc539c1d6e97ef876f7066646224c033db19899c0eae5809404e26d28aa6f1` |
| Approve milestone | Buyer | `fd579a13e31052547551a9ca0541f261e2d4f0f7e4b99c2556a4048a0debd1a7` |
| Release | Buyer | `f74329d8776209001d0138e1a3118a41b4df43248e8c1748889cb609098e00c9` |

### Order 2: standard release, paid out in Argentina. Escrow `CAVODPJ67RZ2GHZSTQ35DPS6WPWUSG3AXRWBTAITY252KCYBEJP4WEWJ`

| Operation | Signer | Transaction hash |
|---|---|---|
| Create (deploy) | Buyer | `ce68da706ad153a1b1710bec5ce07281f736e1e3d72d496f775ba6db7bafb36f` |
| Fund | Buyer | `cb7ca13c30492e410ffbc91f33a7f415ecc8a05969cce72b535d4dd2a2b09862` |
| Approve milestone | Buyer | `556cb50c867ee9e7b95892961e29ab6038906f6396ffec74024be5bae7054b26` |
| Release | Buyer | `29f03199fd8273836826b77f765171c5fb85f32b5931ef41e14f019abfff197b` |

### Order 3: dispute resolved as a 50/50 SPLIT, seller share paid out in Mexico (SPEI). Escrow `CDJAMUCJQW6C7XLCABJWVZW7HTILHJPU2AUXWQQSS2HGWDKO2AYZSMO3`

| Operation | Signer | Transaction hash |
|---|---|---|
| Create (deploy) | Buyer | `d9cda7c5d14aec7793d5d6641a37b37a3f53baa2b0ab7fb685b49f6d0166a5d5` |
| Fund | Buyer | `67fb483c90639db2ee36bc290b821cf87c6a49412ee5aef18aeee9eac80717e0` |
| Open dispute (`dispute_escrow`) | Buyer | `1bee20e6edcac14865f05b449c0227260f08e6a0989477f5e0e43ee774ecb91e` |
| Resolve dispute, SPLIT (`resolve_dispute`) | **Platform** (dispute resolver) | `e005da67e466f13c53219d6e35ba79d1dfc576f1d836505f89fef75c9ee072f5` |

The `resolve_dispute` distribution is 75.0000000 to the buyer (`GBUFHWMF…274N`) and 75.0000000 to the seller wallet (`GDBZCKNH…5GDU4`), an exact 50/50 split of the $150 escrow. The seller's half was then paid out through BlindPay to their Mexican bank account (receipt in section 3).

### Refund

Two refunds are included: one from earlier development QA (kept for completeness) and one run on the production platform account, as requested by the reviewers.

**Production refund.** Escrow `CB3AE4Y7DJKA5X6SHESTM52EHYCCGMZNWFVXFGC6JZHJQ7GLJ3E3LZKJ`, 2026-09-29.

| Operation | Signer | Transaction hash |
|---|---|---|
| Create (deploy) | Buyer | `b71a089b23901c1c217dfee7c3ea14343e6c4e8999bc97f69cdf421d8bc1eb4f` |
| Fund | Buyer | `aa0bc9cfc1693087a05fc7867b18594a78f4533b342ab1f285ae35eddc228544` |
| Open dispute (`dispute_escrow`) | Buyer (`GBUFHWMF…274N`) | `54abefa4c13d5ed97d22a9cf310a7b958795fd816bc84bb6aa7344dd68808796` |
| Resolve dispute, full refund (`resolve_dispute`, 150.0000000 returned 100% to the buyer) | **Platform** (production, `GBTA5SOF…2NCD`) | `b7af1fcd0bae6bd2651335cffa5fa2dea8c86f72fbbb140671e5680165f7c0b3` |

**Earlier development-environment refund.** Escrow `CDMTNLSLTXWXHROYLTE76QV2MDWS6CKIK5Q4QBM6YR4BZX3R5RFZPKF4`, 2026-09-13.

| Operation | Signer | Transaction hash |
|---|---|---|
| Open dispute (`dispute_escrow`) | Buyer (`GBUFHWMF…274N`) | `7f00febf08d524c68ea803a8207a2e3b84b9917af49d3d96db4ccc9fd91bbac4` |
| Resolve dispute, full refund (`resolve_dispute`, 500.0000000 returned 100% to the buyer) | Platform key of our **development** environment (`GBUXD4L2…26NOA`) | `d3b6fcc4a92eab9b9f99a9eccba74514aed3ff4b0a22025ccd307bad2f046547` |

## 2. Key custody

Which keys the server holds, and for which role:

| Server-held key | Role | What it signs |
|---|---|---|
| Platform account (1 wallet) | Dispute resolver on every escrow | `resolve_dispute` only: the platform leg of a refund and the SPLIT resolution |
| Legacy custodial wallets (109 wallets, encrypted at rest with AES-256-GCM) | Users created under the original custodial model, including email-only users | Their owners' actions, server-side. This is the legacy path |

Non-custodial wallets (12 as of 2026-09-26) are external wallets connected through Stellar Wallets Kit. The server stores only the public key and never has a secret for them.

How this reconciles with the non-custodial commitment:

- For every user who connects their own wallet, all buyer-side and seller-side escrow operations (create, fund, approve, release, open dispute) are signed in the user's wallet. The server never signs a money-moving transaction for them.
- The refund is a two-step flow: the buyer signs `dispute_escrow` in their wallet, then the platform completes it with `resolve_dispute`. "Refunds completed server-side" refers only to that second, dispute-resolver leg.
- The legacy custodial wallets are being retired in Tranche 3: the "Claim Your Wallet" flow moves signer authority to the user's own key without moving funds, followed by removal of the server-side signing routes and a 90-day read-only window for accounts that have not claimed (see the Tranche 3 milestone D3.2).

## 3. Corridors

Delivered and verified: **Brazil (PIX), Mexico (SPEI), Argentina (Transfers 3.0), Colombia (ACH)**.

The original submission listed 7 corridors. **Peru, Chile and Costa Rica are formally descoped**: BlindPay has no live payout rail for them today. The Tranche 3 open-source BlindPay adapter (D3.5) will therefore cover these 4 corridors.

Bank deposit receipts (BlindPay tracking pages, one per corridor):

| Corridor | Receipt |
|---|---|
| Brazil (PIX), Order 1 | https://app.blindpay.com/e/track/po_0rqm1fx9D3Zw |
| Argentina (Transfers 3.0), Order 2 | https://app.blindpay.com/e/track/po_g1LC5obYYMOz |
| Mexico (SPEI), Order 3 (SPLIT share) | https://app.blindpay.com/e/track/po_Odv0H6Sfqxlp |
| Colombia (ACH) | https://app.blindpay.com/e/track/po_dwgZFNgGuHn2 |

The Colombia receipt shows the name "Andrés Marín". It comes from our earlier corridor QA, run with a first test customer before the demo persona used in the video was created. It is the same BlindPay sandbox instance and the same payout pipeline.

## 4. Deliverable 2.4: failure-simulation results

These three scenarios were not only simulated: each one happened during live testnet QA, was diagnosed, fixed and covered by a regression test. Test names refer to the private repository (reviewer access granted).

### 4.1 Disbursement timeout

- **What happened (2026-09-16):** the BlindPay `POST payouts/stellar` request exceeded the 30 s HTTP timeout.
- **Behavior:** the payout was left in `PROCESSING` and was **not** auto-retried, by design: a timed-out POST may have already moved money, so retrying automatically risks a double payment.
- **Resolution:** we queried BlindPay's list-payouts endpoint and confirmed no payout had been created on their side, reset the payout to `FAILED`, and retried. The new attempt completed (`po_Pcn7Hz1dSFK9`, BRL 770.46).
- **Tests:** `payout-flow.service.spec.ts` "leaves the payout PROCESSING on an ambiguous failure instead of auto-retrying"; `blindpay.service.spec.ts` "maps a timeout to PROVIDER_TIMEOUT".
- **Known limit:** resolving an ambiguous `PROCESSING` payout is a manual, documented procedure today. Automated detection, alerting and admin recovery tooling are Tranche 3 work (D3.4).

### 4.2 Corridor rejection

- **Argentina (2026-09-13):** BlindPay rejected the bank account with `transfers_type: Invalid enum value. Expected 'CVU' | 'CBU' | 'ALIAS', received 'cbu'`. Fixed by sending BlindPay's exact enum values; the same audit corrected Brazil/Colombia `account_type` (`saving`) and Mexico `spei_protocol` values. Public fix: https://github.com/OFFER-HUB/OFFER-HUB-Frontend/pull/477
- **Colombia (2026-09-13):** BlindPay answered `internal_error` because ACH Colombia requires 7 extra fields we were not collecting. Fixed by collecting them and validating them per corridor. Public fix: https://github.com/OFFER-HUB/OFFER-HUB-Frontend/pull/474
- **Tests:** `blindpay-corridors.spec.ts` (required fields per rail), `bank-accounts.service.spec.ts` ("rejects a Colombian account missing the beneficiary/document fields BlindPay actually requires"), and the `BankAccountForm` component tests in this repository.

### 4.3 Retry logic

- **Stale Stellar transaction:** a re-prepared signing step invalidated an in-flight one and surfaced a raw `submit_transaction_failed`. Fixed by caching the unsigned transaction on repeated prepare calls, requesting a fresh quote on retry, and showing a specific "Transaction outdated" state with a one-click Retry.
- **Payout stuck on a broken bank account:** a seller could not redirect a failed payout. Fixed with a "Retry Payout" action that re-resolves the seller's current default bank account. Public UI: https://github.com/OFFER-HUB/OFFER-HUB-Frontend/pull/476
- **Silent no-op retry:** BullMQ deduplicates jobs by ID, so re-queueing a failed payout reused the old failed job. Fixed by removing the stale terminal job before re-enqueueing.
- **Backoff and dead-letter queue:** 5 attempts with exponential backoff, then a dead-letter queue.
- **Tests:** `payout-orchestration.service.spec.ts` (retry with a fresh bank account), `queue.service.spec.ts` ("removes a previously FAILED job with the same jobId before re-enqueueing"), `release-refund.service.spec.ts` (cached-transaction reuse).

## 5. Test evidence

- **Result:** 17 test suites, 320 tests, all passing, for the modules that back Deliverables 2.1 to 2.4 (`resolution`, `payout`, `queues`, `bank-accounts`, the BlindPay provider and the shared corridor definitions). Full output: [`tranche-2-test-output.txt`](./tranche-2-test-output.txt).
- **CI:** the private repository runs the full suite in GitHub Actions on every push and pull request (workflow `Continuous Integration`). A recent successful run on `main`: https://github.com/OFFER-HUB/OFFER-HUB-API/actions/runs/35682701313 (visible with the reviewer access granted).
- **Frontend tests** for the signing modal, bank-account form and retry-payout UI live in this public repository under `src/**/__tests__/`.

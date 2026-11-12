# Switching the frontend to mainnet

Step 12 of the API's [cutover checklist](https://github.com/OFFER-HUB/OFFER-HUB-API/blob/main/docs/deployment/mainnet-cutover-checklist.md). The frontend has no mainnet code path to write: it is the same code, configured by environment variables.

## Why a redeploy is needed

`NEXT_PUBLIC_*` variables are baked into the JavaScript at build time. Changing one on Vercel does nothing until the project is **built again**. Do it only on cutover day, after the API is back on mainnet (checklist step 10).

## Production project (becomes mainnet)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_STELLAR_NETWORK` | `public` |
| `NEXT_PUBLIC_PRODUCTION_API_URL` | unchanged: the production API keeps its URL and becomes mainnet |
| `NEXT_PUBLIC_USE_LOCAL_API` | unset or `false` |
| `NEXT_PUBLIC_STELLAR_RPC_URL`, `NEXT_PUBLIC_STELLAR_USDC_ISSUER` | leave unset: the defaults follow the network (`mainnet.sorobanrpc.com`, Circle's mainnet issuer) |

Anything other than the exact value `public` means testnet, on purpose: a typo can never point real funds at the wrong network (covered by `src/config/__tests__/wallet-network.test.ts`).

## What changes with `public`

- Wallets sign against the Public Global Stellar Network; balances and trustlines are read from the mainnet RPC; explorer links go to `stellar.expert/explorer/public`.
- The testnet-only UI is not shown: "Get Testnet USDB" (BlindPay's test currency), Claim Your Wallet, and the sandbox banner. A user without an external wallet is asked to connect one.
- The wallet page has no Withdraw button: funds are in the user's own wallet.

## The testnet sandbox frontend (separate Vercel project)

Same repository, with `NEXT_PUBLIC_STELLAR_NETWORK=testnet` and `NEXT_PUBLIC_PRODUCTION_API_URL` pointing at the sandbox API. Its API needs this frontend's URL in `CORS_ORIGINS`. Claim Your Wallet stays visible there during the 90-day window (OFFER-HUB-Frontend #487).

## Check after the deploy

1. The wallet page header reads **Stellar mainnet**.
2. For each wallet (Freighter, Lobstr, xBull): connect, sign in, and confirm the address and balances match the wallet app. Their prompts must say the Public network.
3. Settings has no Claim Your Wallet; no "Testnet" text anywhere in the app.
4. An explorer link on an order opens `stellar.expert/explorer/public/...`.
5. `offer-hub.org/stats` lists mainnet runs only.

## Rollback

Redeploy the previous production build on Vercel (Deployments → the last testnet build → Promote). The API rolls back separately, see the cutover checklist.

# @offer-hub/swk-signing

Client-side Stellar/Soroban signing helpers and educational examples for OFFER-HUB wallet integrations. The package is designed to work with the Stellar Wallets Kit (SWK) flow, where the browser wallet signs an XDR payload before the app submits it to Horizon or Soroban.

## Installation

```bash
npm install @offer-hub/swk-signing @stellar/stellar-sdk
```

## Quick start

```ts
import {
  createEscrowSigningPayload,
  TESTNET_NETWORK_PASSPHRASE,
} from "@offer-hub/swk-signing";
import { Keypair } from "@stellar/stellar-sdk";

const sourceAccount = Keypair.random().publicKey();
const escrowAccount = Keypair.random().publicKey();

const payload = createEscrowSigningPayload({
  sourceAccount,
  contractId: escrowAccount,
  amount: "1.25",
  networkPassphrase: TESTNET_NETWORK_PASSPHRASE,
});

console.log(payload.xdr);
console.log(payload.networkPassphrase);
```

## API reference

### `createEscrowSigningPayload(input)`

Creates a signed escrow-style XDR payload for a wallet to approve.

```ts
interface EscrowSigningRequest {
  sourceAccount: string;
  contractId: string;
  amount: string;
  assetCode?: string;
  assetIssuer?: string;
  fee?: number;
  timeout?: number;
  networkPassphrase?: string;
}
```

Returns:

```ts
interface EscrowSigningPayload {
  xdr: string;
  networkPassphrase: string;
  contractId: string;
  sourceAccount: string;
}
```

### `createEscrowTestTransaction(input)`

Convenience alias for the same escrow signing payload used in examples and smoke tests.

### `getSupportedWallets()`

Returns the wallet list supported by the OFFER-HUB integration flow:

```ts
["freighter", "lobstr", "xbull"]
```

### `formatWalletAddress(address)`

Shortens a wallet address for UI display while preserving readability.

## Runnable example: React signer

```tsx
import { useState } from "react";
import { Keypair } from "@stellar/stellar-sdk";
import { createEscrowSigningPayload } from "@offer-hub/swk-signing";

export function EscrowSignerExample() {
  const [status, setStatus] = useState<string>("Idle");

  async function handleSign() {
    const payload = createEscrowSigningPayload({
      sourceAccount: Keypair.random().publicKey(),
      contractId: Keypair.random().publicKey(),
      amount: "1.25",
      networkPassphrase: "Test SDF Network ; September 2015",
    });

    setStatus("Wallet prompt opened");

    // In a real app, the browser wallet signs this XDR via SWK and sends it back.
    // For example: await wallet.signTransaction(payload.xdr, { networkPassphrase: payload.networkPassphrase });
    console.log(payload.xdr);
  }

  return (
    <button onClick={handleSign}>
      {status === "Wallet prompt opened" ? "Signed" : "Sign escrow"}
    </button>
  );
}
```

## Blank-project verification

This package is intentionally easy to install into a fresh React or Next.js project. The expected install path is:

```bash
npm install @offer-hub/swk-signing @stellar/stellar-sdk
node -e "import { createEscrowSigningPayload } from '@offer-hub/swk-signing'; import { Keypair } from '@stellar/stellar-sdk'; const p = createEscrowSigningPayload({ sourceAccount: Keypair.random().publicKey(), contractId: Keypair.random().publicKey(), amount: '1.25' }); if (!p.xdr) throw new Error('missing xdr'); console.log('ok');"
```

The repository includes a blank-project smoke check at `scripts/check-blank-project.mjs` for the same end-to-end verification flow.

## Security and usage notes

- The wallet must sign the XDR in the browser; the app should never submit a private key.
- Always validate the destination account and network passphrase before sending a signed transaction.
- Use the Stellar testnet network when experimenting locally and confirm you are using the correct passphrase for production deployments.

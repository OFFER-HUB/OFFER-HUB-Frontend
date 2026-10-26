# @offer-hub/stellar-escrow-signing

A React hook for client-side Stellar/Soroban escrow signing operations using Stellar Wallets Kit. Provides a reusable, MIT-licensed signing layer for escrow operations: create, fund, release, refund, and dispute.

## Features

- **Client-side signing**: All cryptographic operations happen in the user's wallet via Stellar Wallets Kit
- **Multi-operation support**: Handles all 5 escrow operations (create, fund, release, refund, dispute)
- **Step-wise operations**: Properly handles multi-step flows like release (complete_milestone → approve_milestone → release)
- **Error handling**: Typed error codes for user-reject, XDR expiry, wrong signer, stale transactions, and API errors
- **Safety guards**: Double-submit prevention, XDR expiry validation, signer role checking
- **Framework-agnostic API**: Integrates with any API client through simple prepare/submit function injection

## Installation

```bash
npm install @offer-hub/stellar-escrow-signing @creit.tech/stellar-wallets-kit
# or
yarn add @offer-hub/stellar-escrow-signing @creit.tech/stellar-wallets-kit
# or
pnpm add @offer-hub/stellar-escrow-signing @creit.tech/stellar-wallets-kit
```

## Peer Dependencies

- `@creit.tech/stellar-wallets-kit`: ^2.5.0
- `react`: ^18.0.0 || ^19.0.0

## Usage

### Basic Example

```tsx
import { useStellarEscrowSigning } from "@offer-hub/stellar-escrow-signing";

function EscrowSigningButton({ orderId, userToken, wallet }) {
  const { state, sign, reset, transactionHash, error, currentStep } = useStellarEscrowSigning({
    token: userToken,
    wallet: {
      address: wallet.address,
      networkPassphrase: wallet.networkPassphrase,
    },
    prepareCreate: async (token, orderId) => {
      const response = await fetch(`/api/orders/${orderId}/escrow/prepare`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
    prepareFund: async (token, orderId) => {
      const response = await fetch(`/api/orders/${orderId}/escrow/fund/prepare`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
    prepareRelease: async (token, orderId) => {
      const response = await fetch(`/api/orders/${orderId}/resolution/release/prepare`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
    prepareRefund: async (token, orderId) => {
      const response = await fetch(`/api/orders/${orderId}/resolution/refund/prepare`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
    prepareDispute: async (token, orderId) => {
      const response = await fetch(`/api/orders/${orderId}/resolution/dispute/prepare`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
    submit: async (token, orderId, signedXdr, operation, idempotencyKey) => {
      const response = await fetch(`/api/orders/${orderId}/escrow/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ signedXdr, operation }),
      });
      return response.json();
    },
  });

  const handleSign = async () => {
    await sign(orderId, "create", "buyer");
  };

  return (
    <div>
      <button onClick={handleSign} disabled={state !== "idle"}>
        {state === "idle" ? "Sign Transaction" : state}
      </button>
      {error && <div>Error: {error.message}</div>}
      {transactionHash && <div>Transaction: {transactionHash}</div>}
    </div>
  );
}
```

### API Reference

#### `useStellarEscrowSigning(config)`

Main hook that orchestrates the signing flow.

**Config Parameters:**

| Parameter        | Type                                 | Required | Description                                          |
| ---------------- | ------------------------------------ | -------- | ---------------------------------------------------- |
| `token`          | `string \| null`                     | Yes      | Auth token for API calls                             |
| `wallet`         | `WalletContext`                      | Yes      | Wallet context with address and network passphrase   |
| `prepareCreate`  | `PrepareFn<PrepareEscrowResult>`     | Yes      | Function to fetch unsigned XDR for create operation  |
| `prepareFund`    | `PrepareFn<PrepareEscrowResult>`     | Yes      | Function to fetch unsigned XDR for fund operation    |
| `prepareRelease` | `PrepareFn<PrepareEscrowStepResult>` | Yes      | Function to fetch unsigned XDR for release operation |
| `prepareRefund`  | `PrepareFn<PrepareEscrowStepResult>` | Yes      | Function to fetch unsigned XDR for refund operation  |
| `prepareDispute` | `PrepareFn<PrepareEscrowStepResult>` | Yes      | Function to fetch unsigned XDR for dispute operation |
| `submit`         | `SubmitFn`                           | Yes      | Function to submit signed XDR to backend             |

**Return Value:**

| Property          | Type                                                 | Description                                  |
| ----------------- | ---------------------------------------------------- | -------------------------------------------- |
| `state`           | `EscrowSigningState`                                 | Current state of the signing flow            |
| `sign`            | `(orderId, operation, callerRole?) => Promise<void>` | Function to initiate signing                 |
| `reset`           | `() => void`                                         | Function to reset state to idle              |
| `transactionHash` | `string \| null`                                     | Transaction hash after successful submission |
| `currentStep`     | `EscrowStepName \| null`                             | Current step for multi-step operations       |
| `error`           | `EscrowSigningError \| null`                         | Error object if signing failed               |

#### States

The hook progresses through these states:

- `idle`: Ready to sign
- `building`: Fetching unsigned XDR from API
- `awaiting_signature`: Waiting for user to sign in wallet
- `submitting`: Broadcasting signed transaction to network
- `confirmed`: Transaction successfully submitted
- `error`: Signing failed

#### Error Codes

| Code                  | Description                                    |
| --------------------- | ---------------------------------------------- |
| `USER_REJECTED`       | User cancelled the signature request in wallet |
| `XDR_EXPIRED`         | Unsigned XDR expired (4-minute Soroban window) |
| `NO_WALLET_CONNECTED` | No wallet connected                            |
| `WRONG_SIGNER`        | Caller is not the correct signer for this step |
| `STALE_TRANSACTION`   | Transaction was already submitted (stale XDR)  |
| `API_ERROR`           | Generic API or network error                   |

#### Types

```typescript
type EscrowOperation = "create" | "fund" | "release" | "refund" | "dispute";
type EscrowStepName = "complete_milestone" | "approve_milestone" | "release" | "dispute";

interface PrepareEscrowResult {
  unsignedXdr: string;
  operation: "create" | "fund";
  expiresAt: number;
  orderId: string;
}

interface PrepareEscrowStepResult {
  orderId: string;
  operation: "release" | "refund" | "dispute";
  step: EscrowStepName | null;
  signer: "buyer" | "seller" | null;
  unsignedXdr: string | null;
  expiresAt: number | null;
}

interface SubmitEscrowXdrResult {
  transactionHash: string;
  order: unknown;
}
```

## Integration with OfferHub

In the OFFER-HUB frontend, this package is consumed by `src/hooks/useEscrowSigning.ts`, which provides the app-specific prepare/submit functions and wallet context.

## License

MIT © OFFER-HUB

## Contributing

This package is part of the OFFER-HUB project. Contributions are welcome through the main repository.

## Support

For issues and questions, please use the [OFFER-HUB issue tracker](https://github.com/OFFER-HUB/OFFER-HUB-Frontend/issues).

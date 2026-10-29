# Integrating `@offer-hub/stellar-escrow-signing`

`@offer-hub/stellar-escrow-signing` is the canonical React hook package for
client-side Stellar/Soroban escrow signing. It coordinates the app's prepare
and submit API calls with a wallet signature from Stellar Wallets Kit (SWK).
It does not build escrow transactions or hold private keys.

The package is introduced by [PR #509](https://github.com/OFFER-HUB/OFFER-HUB-Frontend/pull/509).
This guide documents that package rather than shipping a second signing
implementation.

## Integration issues found and fixes

- The original `@offer-hub/swk-signing` package duplicated the signing scope
  already extracted by #509, so this change removes that package and documents
  the canonical one instead.
- The original example generated random account keys and produced a payment
  transaction; it did not call SWK or exercise Soroban escrow signing. The
  replacement example uses the canonical hook's prepare → wallet-sign →
  submit flow.
- The original blank-project check targeted the duplicate package and only
  checked for an XDR string. The replacement check installs the canonical
  package tarball in a temporary React project and verifies that the hook
  passes a signed XDR to the consumer's submit function.

## Requirements and installation

- React 18 or 19
- `@creit.tech/stellar-wallets-kit` 2.5 or later
- A backend that exposes prepare endpoints for escrow create, fund, release,
  refund, and dispute, and a submit endpoint for signed XDR

After the package is published:

```bash
npm install @offer-hub/stellar-escrow-signing @creit.tech/stellar-wallets-kit
```

For local development in this repository, first build the canonical package,
then install it from the consumer application's `package.json` using a local
file dependency. See the blank-project check below for a clean install from a
packed package artifact.

## Public API

The package entry point exports:

- `useStellarEscrowSigning`
- `isWalletCancellation`
- `toWalletErrorMessage`
- Types: `EscrowOperation`, `EscrowStepName`, `PrepareEscrowResult`,
  `PrepareEscrowStepResult`, `SubmitEscrowXdrResult`, `EscrowSigningState`,
  `EscrowSigningErrorCode`, `EscrowSigningError`, `PrepareFn`, `SubmitFn`,
  `WalletContext`, `UseStellarEscrowSigningConfig`, and
  `UseStellarEscrowSigningResult`

`useStellarEscrowSigning` accepts the current token and wallet context, one
prepare function per operation, and a submit function. The prepare functions
return unsigned XDR from the app's API; SWK signs it in the connected wallet.

## React example

The following component uses the exact hook configuration and result shape
exported by the package. `prepareCreate` and `submit` represent typed wrappers
around your own API endpoints; the package deliberately does not own those
endpoints.

```tsx
import { useStellarEscrowSigning } from "@offer-hub/stellar-escrow-signing";
import type {
  PrepareEscrowResult,
  PrepareEscrowStepResult,
  SubmitEscrowXdrResult,
} from "@offer-hub/stellar-escrow-signing";

interface EscrowSignerProps {
  token: string;
  orderId: string;
  walletAddress: string | null;
  networkPassphrase: string;
  prepareCreate: (token: string, orderId: string) => Promise<PrepareEscrowResult>;
  prepareFund: (token: string, orderId: string) => Promise<PrepareEscrowResult>;
  prepareRelease: (token: string, orderId: string) => Promise<PrepareEscrowStepResult>;
  prepareRefund: (token: string, orderId: string) => Promise<PrepareEscrowStepResult>;
  prepareDispute: (token: string, orderId: string) => Promise<PrepareEscrowStepResult>;
  submit: (
    token: string,
    orderId: string,
    signedXdr: string,
    operation: "create" | "fund" | "release" | "refund" | "dispute",
    idempotencyKey: string
  ) => Promise<SubmitEscrowXdrResult>;
}

export function EscrowSigner({
  token,
  orderId,
  walletAddress,
  networkPassphrase,
  prepareCreate,
  prepareFund,
  prepareRelease,
  prepareRefund,
  prepareDispute,
  submit,
}: EscrowSignerProps) {
  const { state, sign, transactionHash, error } = useStellarEscrowSigning({
    token,
    wallet: { address: walletAddress, networkPassphrase },
    prepareCreate,
    prepareFund,
    prepareRelease,
    prepareRefund,
    prepareDispute,
    submit,
  });

  return (
    <div>
      <button
        type="button"
        disabled={state === "building" || state === "awaiting_signature" || state === "submitting"}
        onClick={() => void sign(orderId, "create")}
      >
        {state === "awaiting_signature" ? "Approve in your wallet" : "Create escrow"}
      </button>
      {state === "confirmed" && <p>Transaction: {transactionHash ?? "Already confirmed"}</p>}
      {error && <p role="alert">{error.message}</p>}
    </div>
  );
}
```

Connect SWK in the application and provide its selected public address and the
matching Stellar network passphrase to this component. The API returns the
unsigned transaction; SWK signs it; `submit` sends the signed XDR back to the
API. Never pass a secret key to the package or the API.

Create and fund use a single prepare/sign/submit operation. Release, refund,
and dispute may be step-wise; their prepare result can identify the required
signer or return `unsignedXdr: null` when no step remains. The hook checks the
XDR expiry and caller role before opening the wallet prompt.

## Clean-project installation and signing check

After PR #509 is merged, run this from the repository root:

```bash
npm run check:blank-project
```

While #509 is still open, point the check at its canonical package checkout.
In PowerShell:

```powershell
$env:SWK_SIGNING_PACKAGE_DIR = "C:\path\to\OFFER-HUB-Frontend\packages\stellar-escrow-signing"
npm run check:blank-project
```

The script installs the canonical package's locked development dependencies,
builds it, packs the built package, and installs that tarball into a new
temporary consumer project with React, SWK, and a test renderer. The consumer
test imports the public hook, returns an unsigned test XDR from a prepare
function, exercises the SWK signing boundary with a mocked wallet response,
and verifies that the signed XDR is passed to the submit function. It uses no
live wallet, credentials, or on-chain transaction.

To test a package checkout other than the default repository path, set
`SWK_SIGNING_PACKAGE_DIR` to its absolute path before running the command.

## Build and npm lifecycle scripts

The canonical package's `build` script runs TypeScript compilation and writes
the distributable files under `dist/`. The blank-project check explicitly runs
this build before packing and installing the tarball.

The canonical package defines `prepublishOnly` to run the build before
publishing. It does not define `build-cjs.mjs`, `check-blank-project.mjs`,
`prepare`, or `prepack`. Those scripts and lifecycle hooks belonged to the
duplicate package originally proposed for this issue and were removed along
with that duplicate package.

import { useState } from "react";
import { Keypair } from "@stellar/stellar-sdk";
import { createEscrowSigningPayload } from "@offer-hub/swk-signing";

export function EscrowSigningExample() {
  const [status, setStatus] = useState("idle");

  async function handleSignEscrow() {
    const payload = createEscrowSigningPayload({
      sourceAccount: Keypair.random().publicKey(),
      contractId: Keypair.random().publicKey(),
      amount: "1.25",
      networkPassphrase: "Test SDF Network ; September 2015",
    });

    setStatus("wallet-prompt-open");

    // In a real browser flow, the wallet signs the XDR using SWK before the app sends it on-chain.
    console.log("Escrow XDR ready:", payload.xdr);
  }

  return (
    <button type="button" onClick={handleSignEscrow}>
      {status === "wallet-prompt-open" ? "Escrow signed" : "Sign escrow"}
    </button>
  );
}

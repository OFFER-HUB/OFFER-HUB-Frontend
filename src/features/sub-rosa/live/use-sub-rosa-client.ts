"use client";

import { useMemo } from "react";
import type { SubRosaClient } from "@sub-rosa/sdk";
import { useWalletKit } from "@/hooks/use-wallet-kit";
import { makeSubRosaClient } from "./sdk-client";
import { getRoundRegistry, type RoundRegistry } from "./round-registry";
import type { SubRosaNetwork } from "./live.types";

export interface UseSubRosaClientResult {
  /**
   * A wallet-signing client, or null until a wallet is connected. The same
   * client serves reads (its address is the simulation source) and writes
   * (it auto-signs through Stellar Wallets Kit).
   */
  client: SubRosaClient | null;
  /** Connected wallet address, or null. */
  address: string | null;
  /** Sub Rosa network, mapped from the app's wallet network. */
  network: SubRosaNetwork;
  /** The shared offer→round registry (Supabase or localStorage fallback). */
  registry: RoundRegistry;
  /** True once a signing client is available. */
  ready: boolean;
}

/**
 * The app's wallet network names ("testnet" | "public") mapped to Sub Rosa's
 * ("testnet" | "mainnet"). Anything but explicit mainnet stays on testnet.
 */
function toSubRosaNetwork(appNetwork: string): SubRosaNetwork {
  return appNetwork === "public" ? "mainnet" : "testnet";
}

/**
 * Builds the `SubRosaClient` from the app's existing wallet connection. No new
 * wallet flow: it reuses `useWalletKit()` — the same connection the escrow
 * signing flow uses — and never sees a secret key.
 */
export function useSubRosaClient(): UseSubRosaClientResult {
  const { address, network, networkPassphrase, isReady } = useWalletKit();
  const subRosaNetwork = toSubRosaNetwork(network);
  const registry = useMemo(() => getRoundRegistry(), []);

  const client = useMemo<SubRosaClient | null>(() => {
    if (!isReady || !address) return null;
    return makeSubRosaClient({ address, networkPassphrase, network: subRosaNetwork });
  }, [isReady, address, networkPassphrase, subRosaNetwork]);

  return {
    client,
    address,
    network: subRosaNetwork,
    registry,
    ready: client !== null,
  };
}

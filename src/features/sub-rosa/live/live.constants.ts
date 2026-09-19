/**
 * Copy and links for the live (real, on-chain) Sub Rosa integration. Kept
 * separate from `../sub-rosa.constants.ts`, which is the isolated /labs demo.
 */

import type { SubRosaNetwork } from "./live.types";

export { SUBROSA_LINKS } from "../sub-rosa.constants";

/** The toggle label the client sees on the create-offer form. */
export const SEALED_TOGGLE_LABEL = "Private / Sealed Proposals";

/** Short attribution shown next to sealed-proposal surfaces. */
export const POWERED_BY = "Powered by Sub Rosa";

/** Badge text on offers/states that carry a sealed round. */
export const SEALED_BADGE = "Sealed with Sub Rosa";

/** One-line explanation under the toggle. Intentionally brief. */
export const SEALED_TOGGLE_HINT =
  "Freelancers' proposals stay encrypted until the deadline, then reveal together.";

const EXPLORER_TX_BASE: Record<SubRosaNetwork, string> = {
  testnet: "https://stellar.expert/explorer/testnet/tx",
  mainnet: "https://stellar.expert/explorer/public/tx",
};

const EXPLORER_CONTRACT_BASE: Record<SubRosaNetwork, string> = {
  testnet: "https://stellar.expert/explorer/testnet/contract",
  mainnet: "https://stellar.expert/explorer/public/contract",
};

export function explorerTxUrl(network: SubRosaNetwork, hash: string): string {
  return `${EXPLORER_TX_BASE[network]}/${hash}`;
}

export function explorerContractUrl(network: SubRosaNetwork, contractId: string): string {
  return `${EXPLORER_CONTRACT_BASE[network]}/${contractId}`;
}

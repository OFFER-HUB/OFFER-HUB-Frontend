/**
 * Build-time stub for the OPTIONAL `@openzeppelin/relayer-plugin-channels`
 * submitter used by `@sub-rosa/sdk`. This integration signs sealed-round
 * transactions through the connected Stellar wallet, never the OZ relayer, so
 * the real plugin is intentionally not installed.
 *
 * The SDK only touches this module inside the OZ-relayer submitter code path,
 * which we never select. Turbopack still statically resolves the SDK's
 * `await import("@openzeppelin/relayer-plugin-channels")`, so this stub stands
 * in for it. If that path is ever taken, construction throws loudly rather than
 * failing with a confusing `undefined` — we don't fake a submitter that isn't
 * wired up.
 */
export class ChannelsClient {
  constructor() {
    throw new Error(
      "The OpenZeppelin relayer submitter is not available in this app. " +
        "Sealed proposals are signed with the connected Stellar wallet. " +
        "Install '@openzeppelin/relayer-plugin-channels' and remove the Turbopack " +
        "alias in next.config.js to enable it.",
    );
  }
}

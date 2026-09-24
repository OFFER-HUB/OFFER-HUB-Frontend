import type { Page, Route } from "@playwright/test";
import { E2E_TEST_WALLET_ADDRESS } from "../src/lib/e2e/test-wallet-module";
import type { E2EWalletConfig } from "../src/lib/e2e/test-wallet-module";
import type { Order } from "../src/types/order.types";

export const BUYER_ID = "usr_e2e_buyer00000000000000000";
export const SELLER_ID = "usr_e2e_seller0000000000000000";
export const ORDER_ID = "ord_e2e_release_flow0000000000";

export const BUYER_TOKEN = "e2e-fake-jwt-buyer";

export const BUYER_USER = {
  id: BUYER_ID,
  email: "buyer@e2e.test",
  username: "e2e_buyer",
  firstName: "Ellen",
  lastName: "Buyer",
  type: "BUYER" as const,
  balance: { available: "500.00", reserved: "0.00" },
  wallet: { id: "wal_e2e_buyer", publicKey: E2E_TEST_WALLET_ADDRESS, type: "EXTERNAL" },
};

export function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: ORDER_ID,
    buyerId: BUYER_ID,
    sellerId: SELLER_ID,
    source: "DIRECT",
    title: "Landing page redesign",
    description: "Redesign the marketing landing page and hand off Figma files.",
    amount: "250.00",
    status: "IN_PROGRESS",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z",
    buyer: { id: BUYER_ID, email: BUYER_USER.email, username: BUYER_USER.username },
    seller: { id: SELLER_ID, email: "seller@e2e.test", username: "e2e_seller" },
    metadata: { completedBySeller: true },
    ...overrides,
  };
}

/**
 * Seeds localStorage with a signed-in session before any app script runs:
 * - `auth-state`: the zustand-persisted auth store (real shape, real rehydration
 *   path via AuthProvider — see src/stores/auth-store.ts's `partialize`). The
 *   user always carries an EXTERNAL wallet on file — that's what makes
 *   `useEscrowSigningAction` take the D2.1 client-signing path at all.
 * - SWK's own keys, gated by `swkConnected` (default true) — this is a
 *   *separate* axis from "has an external wallet on the account": SWK's own
 *   browser session (its localStorage keys) can be empty even though the
 *   account has a wallet linked, e.g. a new browser or cleared site data.
 *   That's exactly the "wallet not connected" scenario (issue #383's 5th
 *   case) — `swkConnected: false` reproduces it precisely instead of
 *   pretending the account has no wallet, which would take a different code
 *   path entirely (`isExternalWallet` false → the legacy server-signed flow).
 *
 * Must run via `addInitScript` (before navigation), not after — the auth
 * store's `skipHydration` and SWK's signal initialization both read
 * localStorage exactly once, during the very first script evaluation.
 */
export async function seedSignedInSession(
  page: Page,
  options: { swkConnected?: boolean } = {}
): Promise<void> {
  const swkConnected = options.swkConnected ?? true;

  const authState = {
    state: {
      user: BUYER_USER,
      token: BUYER_TOKEN,
      isAuthenticated: true,
      walletAddress: BUYER_USER.wallet.publicKey,
      walletConnected: true,
    },
    version: 0,
  };

  // Also mark the onboarding tour as already completed — react-joyride's
  // full-page overlay otherwise renders on top of the order page for a
  // "new" account and swallows every click meant for the app underneath it.
  // A real returning user with existing orders would never see it either.
  const onboardingState = {
    state: { hasCompletedTour: true, dismissedTooltips: [], currentTourStep: 0 },
    version: 0,
  };

  await page.addInitScript(
    ({ authStateJson, onboardingStateJson, walletAddress, connected }) => {
      window.localStorage.setItem("auth-state", authStateJson);
      window.localStorage.setItem("offerhub-onboarding", onboardingStateJson);
      if (connected) {
        window.localStorage.setItem("@StellarWalletsKit/activeAddress", walletAddress);
        window.localStorage.setItem("@StellarWalletsKit/selectedModuleId", "e2e-test-wallet");
      }
    },
    {
      authStateJson: JSON.stringify(authState),
      onboardingStateJson: JSON.stringify(onboardingState),
      walletAddress: BUYER_USER.wallet.publicKey,
      connected: swkConnected,
    }
  );
}

/** Sets `window.__E2E_WALLET__` before the app boots, controlling the fake wallet's behavior for one test. */
export async function seedWalletConfig(page: Page, config: E2EWalletConfig): Promise<void> {
  await page.addInitScript((cfg) => {
    window.__E2E_WALLET__ = cfg;
  }, config);
}

function json(route: Route, body: unknown, status = 200): Promise<void> {
  return route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ data: body }) });
}

export interface MockOrderApiOptions {
  order: Order;
  /** Order returned by a refetch after the release step completes — defaults to `order` with status RELEASED. */
  orderAfterRelease?: Order;
  releasePrepare: {
    step: "release" | "approve_milestone" | "complete_milestone" | null;
    signer: "buyer" | "seller" | null;
    unsignedXdr: string | null;
    expiresAt: number | null;
  };
  /** Overrides the submit response; defaults to a fixed transaction hash + orderAfterRelease. */
  submitResponse?: { transactionHash: string; order: Order };
}

/**
 * Mocks the full set of network calls the order detail page and the release
 * flow make, via Playwright route intercepts (no API server involved) —
 * exactly the "API calls mocked via Playwright route intercepts" the issue
 * asks for.
 */
export async function mockOrderApi(page: Page, options: MockOrderApiOptions): Promise<void> {
  const orderAfterRelease = options.orderAfterRelease ?? { ...options.order, status: "RELEASED" as const };
  let released = false;

  // Playwright runs the most-recently-registered matching route first, so the
  // catch-all is registered FIRST — every route added after it below takes
  // priority for its own more specific pattern, falling back to this one only
  // for calls this flow doesn't otherwise care about (analytics, etc.).
  await page.route("**/api/v1/**", (route) => json(route, {}));

  await page.route("**/api/v1/reviews/order/**", (route) =>
    route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ error: { message: "Not found" } }) })
  );

  await page.route(`**/api/v1/orders/${options.order.id}`, (route) =>
    json(route, released ? orderAfterRelease : options.order)
  );

  await page.route("**/api/v1/orders/**/escrow/submit", async (route) => {
    released = true;
    await json(route, options.submitResponse ?? { transactionHash: "e2e-fake-tx-hash", order: orderAfterRelease });
  });

  await page.route("**/api/v1/orders/**/resolution/release/prepare", (route) =>
    json(route, options.releasePrepare)
  );
}

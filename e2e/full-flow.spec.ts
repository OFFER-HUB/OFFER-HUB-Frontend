import { test, expect, type Page, type Route } from "@playwright/test";
import { E2E_TEST_WALLET_ADDRESS } from "../src/lib/e2e/test-wallet-module";
import type { Order, OrderStatus } from "../src/types/order.types";
import {
  ADMIN_USER,
  BUYER_ID,
  BUYER_USER,
  ORDER_ID,
  SELLER_ID,
  buildOrder,
  fakeAdminJwt,
  seedSignedInSession,
  seedWalletConfig,
} from "./fixtures";

/**
 * The wallet → escrow → dispute → resolution journey through the real UI
 * (#484), with the fake wallet module signing and every API call answered by
 * route intercepts. Each test follows one QA scenario from docs/qa/scenarios.md.
 */

const FAKE_XDR = "AAAAAgAAAABE2ETestXdr";
const FUTURE_EXPIRY = Date.now() + 4 * 60 * 1000;
const DISPUTE_ID = "dsp_e2e_split_flow000000000000";

function json(route: Route, body: unknown, status = 200): Promise<void> {
  return route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ data: body }) });
}

/** Catch-all first: Playwright runs the most recently registered matching route first. */
async function mockQuietApi(page: Page): Promise<void> {
  await page.route("**/api/v1/**", (route) => json(route, {}));
  await page.route("**/api/v1/reviews/order/**", (route) =>
    route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ error: { message: "Not found" } }) })
  );
  // The app shell lists offers on every page; an object instead of a list crashes it.
  await page.route(/\/api\/v1\/offers(\?.*)?$/, (route) => json(route, []));
  // Dashboards format this with Intl currency style, which throws without a currency code.
  await page.route("**/api/v1/wallet", (route) =>
    json(route, { availableBalance: "25.00", reservedBalance: "0.00", currency: "USD" })
  );
}

test.describe("Wallet sign-in (scenario 1)", () => {
  test("connecting a wallet and signing the challenge opens the app", async ({ page }) => {
    await mockQuietApi(page);
    let verifyBody: Record<string, unknown> | null = null;

    await page.route("**/api/v1/auth/wallet/challenge", (route) =>
      json(route, { challenge: "offerhub-e2e-nonce-1", expiresIn: 300 })
    );
    await page.route("**/api/v1/auth/wallet/verify", async (route) => {
      verifyBody = route.request().postDataJSON();
      await json(route, { token: "e2e-fake-jwt-wallet", user: { ...BUYER_USER, onboardingCompleted: true } });
    });

    await page.goto("/login");
    await page.getByRole("tab", { name: "Connect Wallet" }).click();
    await page.getByRole("button", { name: "Sign in with wallet" }).click();
    await page.getByRole("button", { name: "Connect E2E Test Wallet" }).click();

    await expect(page).not.toHaveURL(/\/login/);
    expect(verifyBody).toMatchObject({
      publicKey: E2E_TEST_WALLET_ADDRESS,
      challenge: "offerhub-e2e-nonce-1",
    });
  });
});

test.describe("Create and fund the escrow (scenario 2)", () => {
  test("the buyer signs the deploy and the funding in their own wallet", async ({ page }) => {
    await seedSignedInSession(page);
    await seedWalletConfig(page, {});
    await mockQuietApi(page);

    let status: OrderStatus = "ORDER_CREATED";
    const submitted: string[] = [];
    const current = (): Order => buildOrder({ status, metadata: {} });

    await page.route(`**/api/v1/orders/${ORDER_ID}`, (route) => json(route, current()));
    await page.route("**/api/v1/orders/**/escrow/prepare", (route) =>
      json(route, { unsignedXdr: FAKE_XDR, operation: "create", expiresAt: FUTURE_EXPIRY, orderId: ORDER_ID })
    );
    await page.route("**/api/v1/orders/**/escrow/fund/prepare", (route) =>
      json(route, { unsignedXdr: FAKE_XDR, operation: "fund", expiresAt: FUTURE_EXPIRY, orderId: ORDER_ID })
    );
    await page.route("**/api/v1/orders/**/escrow/submit", async (route) => {
      const body = route.request().postDataJSON() as { operation: string; signedXdr: string };
      submitted.push(body.operation);
      status = body.operation === "create" ? "ESCROW_FUNDING" : "IN_PROGRESS";
      await json(route, { transactionHash: `e2e-tx-${body.operation}`, order: current() });
    });

    await page.goto(`/app/orders/${ORDER_ID}`);

    await page.getByRole("button", { name: "Lock Funds in Escrow" }).click();
    const created = page.getByRole("dialog", { name: "Transaction confirmed" });
    await expect(created).toBeVisible();
    await created.getByRole("button", { name: "Done" }).click();

    await page.getByRole("button", { name: "Sign Fund Transaction" }).click();
    const funded = page.getByRole("dialog", { name: "Transaction confirmed" });
    await expect(funded).toBeVisible();
    await funded.getByRole("button", { name: "Done" }).click();

    expect(submitted).toEqual(["create", "fund"]);
    await expect(page.getByText("Work in Progress").first()).toBeVisible();
  });
});

test.describe("Delivery (scenario 3)", () => {
  test("the seller marks the work delivered by signing their step, and the buyer is told", async ({ page }) => {
    const seller = { ...BUYER_USER, id: SELLER_ID, email: "seller@e2e.test", username: "e2e_seller", type: "SELLER" as const };
    await seedSignedInSession(page, { user: seller, token: "e2e-fake-jwt-seller" });
    await seedWalletConfig(page, {});
    await mockQuietApi(page);

    let sellerSigned = false;
    let completed = false;
    const order = (): Order => buildOrder({ status: "IN_PROGRESS", metadata: completed ? { completedBySeller: true } : {} });

    await page.route(`**/api/v1/orders/${ORDER_ID}`, (route) => json(route, order()));
    await page.route("**/api/v1/orders/**/resolution/release/prepare", (route) =>
      json(
        route,
        sellerSigned
          ? { step: "approve_milestone", signer: "buyer", unsignedXdr: FAKE_XDR, expiresAt: FUTURE_EXPIRY }
          : { step: "complete_milestone", signer: "seller", unsignedXdr: FAKE_XDR, expiresAt: FUTURE_EXPIRY }
      )
    );
    await page.route("**/api/v1/orders/**/escrow/submit", async (route) => {
      sellerSigned = true;
      await json(route, { transactionHash: "e2e-tx-complete", order: order() });
    });
    await page.route(`**/api/v1/orders/${ORDER_ID}/complete`, async (route) => {
      completed = true;
      await json(route, order());
    });

    await page.goto(`/app/orders/${ORDER_ID}`);
    await page.getByRole("button", { name: "Mark as Completed" }).click();

    await expect.poll(() => sellerSigned).toBe(true);
    await expect.poll(() => completed).toBe(true);
  });
});

test.describe("Dispute and split resolution (scenarios 4 and 5)", () => {
  test("the buyer opens a dispute, signing the on-chain step from their wallet", async ({ page }) => {
    await seedSignedInSession(page);
    await seedWalletConfig(page, {});
    await mockQuietApi(page);

    let status: OrderStatus = "IN_PROGRESS";
    let disputeSigned = false;
    let disputeBody: Record<string, unknown> | null = null;

    await page.route(`**/api/v1/orders/${ORDER_ID}`, (route) => json(route, buildOrder({ status, metadata: {} })));
    await page.route("**/api/v1/orders/**/resolution/dispute/prepare", (route) =>
      json(
        route,
        disputeSigned
          ? { step: null, signer: null, unsignedXdr: null, expiresAt: null }
          : { step: "dispute", signer: "buyer", unsignedXdr: FAKE_XDR, expiresAt: FUTURE_EXPIRY }
      )
    );
    await page.route("**/api/v1/orders/**/escrow/submit", async (route) => {
      disputeSigned = true;
      await json(route, { transactionHash: "e2e-tx-dispute", order: buildOrder({ status, metadata: {} }) });
    });
    await page.route("**/api/v1/orders/**/resolution/dispute", async (route) => {
      disputeBody = route.request().postDataJSON();
      status = "DISPUTED";
      await json(route, { id: DISPUTE_ID, orderId: ORDER_ID, status: "OPEN" });
    });

    await page.goto(`/app/orders/${ORDER_ID}`);
    await page.getByRole("button", { name: "Open Dispute" }).first().click();
    await page.getByRole("combobox").selectOption("NOT_DELIVERED");
    await page.getByPlaceholder(/describe the issue in detail/i).fill("The landing page files were never delivered.");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: /confirm & open dispute/i }).click();

    await expect.poll(() => disputeSigned).toBe(true);
    await expect.poll(() => disputeBody).toMatchObject({ openedBy: "BUYER", reason: "NOT_DELIVERED" });
  });

  test("an admin resolves the dispute with a split that adds up to the order amount", async ({ page }) => {
    await seedSignedInSession(page, { user: ADMIN_USER, token: fakeAdminJwt() });
    await mockQuietApi(page);

    let resolveBody: Record<string, unknown> | null = null;
    const party = (id: string, email: string) => ({ id, email });
    const dispute = (over: Record<string, unknown> = {}) => ({
      id: DISPUTE_ID,
      orderId: ORDER_ID,
      openedBy: "BUYER",
      reason: "NOT_DELIVERED",
      evidence: null,
      status: "UNDER_REVIEW",
      resolutionDecision: null,
      decisionNote: null,
      createdAt: "2026-01-06T00:00:00.000Z",
      updatedAt: "2026-01-06T00:00:00.000Z",
      order: {
        id: ORDER_ID,
        title: "Landing page redesign",
        description: null,
        amount: "300.00",
        currency: "USD",
        status: "DISPUTED",
        buyerId: BUYER_ID,
        sellerId: SELLER_ID,
        buyer: party(BUYER_ID, "buyer@e2e.test"),
        seller: party(SELLER_ID, "seller@e2e.test"),
        service: null,
        escrow: { id: "esc_e2e", status: "DISPUTED" },
        milestones: [],
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      ...over,
    });

    await page.route(`**/api/v1/disputes/${DISPUTE_ID}`, (route) => json(route, dispute()));
    await page.route(`**/api/v1/disputes/${DISPUTE_ID}/resolve`, async (route) => {
      resolveBody = route.request().postDataJSON();
      await json(route, dispute({ status: "RESOLVED", resolutionDecision: "SPLIT", decisionNote: "Half delivered." }));
    });

    await page.goto(`/admin/disputes/${DISPUTE_ID}`);
    await page.getByRole("button", { name: /resolve dispute & settle/i }).click();

    await page.getByLabel(/release to seller \(usd\)/i).fill("100.00");
    await page.getByLabel(/refund to buyer \(usd\)/i).fill("200.00");
    await page.getByLabel(/decision note/i).fill("Half delivered.");
    await page.getByRole("button", { name: /^resolve dispute$/i }).click();

    await expect.poll(() => resolveBody).toMatchObject({
      decision: "SPLIT",
      releaseAmount: "100.00",
      refundAmount: "200.00",
    });
  });
});

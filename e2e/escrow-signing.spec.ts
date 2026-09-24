import { test, expect } from "@playwright/test";
import {
  ORDER_ID,
  buildOrder,
  mockOrderApi,
  seedSignedInSession,
  seedWalletConfig,
} from "./fixtures";

const FUTURE_EXPIRY = Date.now() + 4 * 60 * 1000;
const PAST_EXPIRY = Date.now() - 1000;
const FAKE_XDR = "AAAAAgAAAABTest...";

async function openReleaseFundsModal(page: import("@playwright/test").Page) {
  await page.goto(`/app/orders/${ORDER_ID}`);
  await page.getByRole("button", { name: "Release Funds" }).click();
  await page.getByRole("button", { name: "Confirm" }).click();
}

test.describe("D2.1 client-side signing — Release Funds", () => {
  test("clicking Release Funds opens EscrowSigningModal in awaiting_signature state", async ({ page }) => {
    await seedSignedInSession(page);
    // Slow enough for the transient "awaiting_signature" state to be reliably observable.
    await seedWalletConfig(page, { signTransactionDelayMs: 1500 });
    await mockOrderApi(page, {
      order: buildOrder(),
      releasePrepare: { step: "release", signer: "buyer", unsignedXdr: FAKE_XDR, expiresAt: FUTURE_EXPIRY },
    });

    await openReleaseFundsModal(page);

    const dialog = page.getByRole("dialog", { name: "Check your wallet" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Check your wallet extension to sign")).toBeVisible();
  });

  test("simulated wallet approval completes the flow and the order status updates", async ({ page }) => {
    await seedSignedInSession(page);
    await seedWalletConfig(page, {}); // default: approve, no delay
    await mockOrderApi(page, {
      order: buildOrder(),
      releasePrepare: { step: "release", signer: "buyer", unsignedXdr: FAKE_XDR, expiresAt: FUTURE_EXPIRY },
    });

    await openReleaseFundsModal(page);

    const dialog = page.getByRole("dialog", { name: "Transaction confirmed" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Done" }).click();

    // resolveOrderStep's RELEASED label — the order was refetched after release.
    await expect(page.getByText("Payment Released")).toBeVisible();
  });

  test("simulated wallet rejection shows an error state with a retry option", async ({ page }) => {
    await seedSignedInSession(page);
    await seedWalletConfig(page, { signTransactionBehavior: "reject" });
    await mockOrderApi(page, {
      order: buildOrder(),
      releasePrepare: { step: "release", signer: "buyer", unsignedXdr: FAKE_XDR, expiresAt: FUTURE_EXPIRY },
    });

    await openReleaseFundsModal(page);

    const dialog = page.getByRole("dialog", { name: "Signing cancelled" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("You cancelled the signing. Try again?")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Retry" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  test("an already-expired XDR shows the expiry message with a retry option (and no cancel)", async ({ page }) => {
    await seedSignedInSession(page);
    await seedWalletConfig(page, {});
    await mockOrderApi(page, {
      order: buildOrder(),
      releasePrepare: { step: "release", signer: "buyer", unsignedXdr: FAKE_XDR, expiresAt: PAST_EXPIRY },
    });

    await openReleaseFundsModal(page);

    const dialog = page.getByRole("dialog", { name: "Transaction expired" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Transaction expired. Please try again.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Retry" })).toBeVisible();
    // XDR_EXPIRED is self-healing on retry (a fresh XDR is fetched), so the
    // modal deliberately doesn't offer a Cancel next to it — see EscrowSigningModal.tsx.
    await expect(dialog.getByRole("button", { name: "Cancel" })).toHaveCount(0);
  });

  test("no wallet connected in this browser session shows WalletConnectModal before any signing starts", async ({ page }) => {
    await seedSignedInSession(page, { swkConnected: false });
    await mockOrderApi(page, {
      order: buildOrder(),
      releasePrepare: { step: "release", signer: "buyer", unsignedXdr: FAKE_XDR, expiresAt: FUTURE_EXPIRY },
    });

    let prepareCalled = false;
    await page.route("**/api/v1/orders/**/resolution/release/prepare", (route) => {
      prepareCalled = true;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { step: "release", signer: "buyer", unsignedXdr: FAKE_XDR, expiresAt: FUTURE_EXPIRY } }),
      });
    });

    await openReleaseFundsModal(page);

    // WalletConnectModal's title reflects the *account's* linked wallet
    // (always present here — "Wallet connected"), not SWK's live browser
    // session, which is what's actually missing — so this asserts on the
    // component itself (its "Connected address" detail, unique to it) rather
    // than a title string that doesn't vary with the thing under test.
    const walletModal = page.getByRole("dialog").filter({ hasText: "Connected address" });
    await expect(walletModal).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Check your wallet" })).toHaveCount(0);
    expect(prepareCalled).toBe(false);
  });
});

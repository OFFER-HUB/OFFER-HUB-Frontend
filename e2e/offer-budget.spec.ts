import { expect, test } from "@playwright/test";
import { seedSignedInSession } from "./fixtures";

/**
 * The offer form's budget rule: at least $5, no upper limit. Submitting an
 * otherwise empty form is enough — the budget check runs with the rest of the
 * validation, before anything is sent to the API.
 */
test.describe("offer budget", () => {
  test.beforeEach(async ({ page }) => {
    await seedSignedInSession(page);
    await page.route("**/api/v1/**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: {} }) })
    );
    await page.goto("/app/client/offers/new");
    await expect(page.locator("#offer-budget")).toBeVisible();
  });

  async function submitWithBudget(page: import("@playwright/test").Page, budget: string): Promise<void> {
    await page.locator("#offer-budget").fill(budget);
    await page.getByRole("button", { name: "Publish Job Offer" }).click();
  }

  test("labels the minimum as $5", async ({ page }) => {
    await expect(page.getByText("Budget (min $5)")).toBeVisible();
  });

  test("rejects $4", async ({ page }) => {
    await submitWithBudget(page, "4");
    await expect(page.getByText("Budget must be at least $5")).toBeVisible();
  });

  test("accepts $5", async ({ page }) => {
    await submitWithBudget(page, "5");
    await expect(page.getByText("Budget must be at least $5")).toHaveCount(0);
    await expect(page.getByText("Budget is required")).toHaveCount(0);
  });

  test("accepts a very large budget", async ({ page }) => {
    await submitWithBudget(page, "25000000");
    await expect(page.getByText("Budget must be at least $5")).toHaveCount(0);
  });
});

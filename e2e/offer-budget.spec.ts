import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { seedSignedInSession } from "./fixtures";

/**
 * The offer form's budget rule: at least $5, no upper limit. The publish
 * checklist shows the budget item as met (primary text) or not (secondary text).
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

  function budgetItem(page: Page): Locator {
    return page.getByText("Budget (min $5)");
  }

  async function enterBudget(page: Page, budget: string): Promise<void> {
    await page.locator("#offer-budget").fill(budget);
  }

  test("starts unmet and labels the minimum as $5", async ({ page }) => {
    await expect(budgetItem(page)).toBeVisible();
    await expect(budgetItem(page)).toHaveClass(/text-text-secondary/);
  });

  test("$4 does not meet the minimum", async ({ page }) => {
    await enterBudget(page, "4");
    await expect(budgetItem(page)).toHaveClass(/text-text-secondary/);
  });

  test("$5 meets the minimum", async ({ page }) => {
    await enterBudget(page, "5");
    await expect(budgetItem(page)).toHaveClass(/text-text-primary/);
  });

  test("a very large budget meets it too, there is no maximum", async ({ page }) => {
    await enterBudget(page, "25000000");
    await expect(budgetItem(page)).toHaveClass(/text-text-primary/);
  });
});

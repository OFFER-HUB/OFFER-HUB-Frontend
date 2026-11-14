import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * E2E config for the D2.1 client-side signing flow (issue #383).
 *
 * Runs its own dev server on a dedicated port, built with NEXT_PUBLIC_E2E=true
 * so WalletKitProvider registers the fake wallet module from
 * src/lib/e2e/test-wallet-module.ts — see that file for why a real wallet
 * extension's protocol can't safely be faked instead. All backend calls are
 * intercepted per-test via page.route(); no API server needs to be running.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // In CI: an HTML report and a JSON summary, uploaded and posted to the run summary.
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never", outputFolder: "playwright-report" }], ["json", { outputFile: "playwright-report/results.json" }]]
    : "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      NEXT_PUBLIC_E2E: "true",
      PORT: String(PORT),
      // Auth.js refuses to start without a secret; this one only signs the
      // throwaway sessions of the local test server.
      AUTH_SECRET: process.env.AUTH_SECRET ?? "e2e-only-not-a-real-secret",
      AUTH_TRUST_HOST: "true",
    },
  },
});

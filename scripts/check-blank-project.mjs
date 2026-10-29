import { execSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageDirectory =
  process.env.SWK_SIGNING_PACKAGE_DIR ??
  path.join(repositoryRoot, "packages", "stellar-escrow-signing");
const packageManifestPath = path.join(packageDirectory, "package.json");
if (!existsSync(packageManifestPath)) {
  throw new Error(
    `Canonical signing package not found at ${packageDirectory}. ` +
      "Merge PR #509 first, or set SWK_SIGNING_PACKAGE_DIR to its package checkout."
  );
}

const packageManifest = JSON.parse(readFileSync(packageManifestPath, "utf8"));
const tempDirectory = mkdtempSync(path.join(tmpdir(), "oh-stellar-signing-"));

function run(command, cwd) {
  execSync(command, { cwd, stdio: "inherit", windowsHide: true });
}

function quote(value) {
  return `"${value.replaceAll('"', '\\"')}"`;
}

try {
  run("npm ci --ignore-scripts --no-audit --no-fund", packageDirectory);
  run("npm run build", packageDirectory);
  run(`npm pack --pack-destination ${quote(tempDirectory)}`, packageDirectory);

  const packageTarball = readdirSync(tempDirectory).find((file) => file.endsWith(".tgz"));
  if (!packageTarball) {
    throw new Error("npm pack did not create a package tarball.");
  }

  const consumerManifest = {
    name: "offer-hub-blank-project-check",
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      test: "vitest run --config vitest.config.mjs",
    },
    dependencies: {
      "@creit.tech/stellar-wallets-kit": "^2.5.0",
      [packageManifest.name]: `file:${path.join(tempDirectory, packageTarball)}`,
      react: "^19.2.0",
      "react-dom": "^19.2.0",
    },
    devDependencies: {
      "@testing-library/dom": "^10.4.1",
      "@testing-library/react": "^16.3.2",
      "happy-dom": "^20.11.2",
      vitest: "^4.1.10",
    },
  };

  writeFileSync(
    path.join(tempDirectory, "package.json"),
    JSON.stringify(consumerManifest, null, 2)
  );
  writeFileSync(
    path.join(tempDirectory, "vitest.config.mjs"),
    'import { defineConfig } from "vitest/config";\n' +
      'export default defineConfig({ test: { environment: "happy-dom" } });\n'
  );
  writeFileSync(
    path.join(tempDirectory, "signing.test.jsx"),
    `import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: { signTransaction: vi.fn() },
}));

import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { useStellarEscrowSigning } from "@offer-hub/stellar-escrow-signing";

describe("installed package signing flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(StellarWalletsKit.signTransaction).mockResolvedValue({
      signedTxXdr: "signed-test-xdr",
    });
  });

  it("prepares, signs, and submits an escrow transaction", async () => {
    const prepareCreate = vi.fn().mockResolvedValue({
      unsignedXdr: "unsigned-test-xdr",
      operation: "create",
      expiresAt: Date.now() + 60_000,
      orderId: "order-test",
    });
    const submit = vi.fn().mockResolvedValue({
      transactionHash: "test-transaction-hash",
      order: {},
    });
    const config = {
      token: "test-token",
      wallet: {
        address: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
        networkPassphrase: "Test SDF Network ; September 2015",
      },
      prepareCreate,
      prepareFund: vi.fn(),
      prepareRelease: vi.fn(),
      prepareRefund: vi.fn(),
      prepareDispute: vi.fn(),
      submit,
    };
    const { result } = renderHook(() => useStellarEscrowSigning(config));

    await act(async () => {
      await result.current.sign("order-test", "create");
    });

    expect(prepareCreate).toHaveBeenCalledWith("test-token", "order-test");
    expect(StellarWalletsKit.signTransaction).toHaveBeenCalledWith(
      "unsigned-test-xdr",
      {
        networkPassphrase: "Test SDF Network ; September 2015",
        address: config.wallet.address,
      }
    );
    expect(submit).toHaveBeenCalledWith(
      "test-token",
      "order-test",
      "signed-test-xdr",
      "create",
      expect.any(String)
    );
    expect(result.current.state).toBe("confirmed");
    expect(result.current.transactionHash).toBe("test-transaction-hash");
  });
});
`
  );

  run("npm install --no-audit --no-fund", tempDirectory);
  run("npm test", tempDirectory);
  console.log("blank-project-install-and-signing-check-passed");
} finally {
  rmSync(tempDirectory, { recursive: true, force: true });
}

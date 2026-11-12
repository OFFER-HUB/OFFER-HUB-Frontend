import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUsdcTrustline } from "../useUsdcTrustline";

const mockSignTransaction = vi.fn();
vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: { signTransaction: (...args: unknown[]) => mockSignTransaction(...args) },
}));

let mockAddress: string | null = "GCAA763N2ETT5GATWNAC5JMHXAHMJYOZGDZXE3FZYL54NFEHXTSSMACI";
vi.mock("@/hooks/use-wallet-kit", () => ({
  useWalletKit: () => ({
    isReady: true,
    address: mockAddress,
    network: "public",
    networkPassphrase: "Public Global Stellar Network ; September 2015",
  }),
}));

const mockBuild = vi.fn();
const mockSubmit = vi.fn();
vi.mock("@/services/stellar.service", () => ({
  buildUsdcTrustlineXdr: (...args: unknown[]) => mockBuild(...args),
  submitSignedTransaction: (...args: unknown[]) => mockSubmit(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockAddress = "GCAA763N2ETT5GATWNAC5JMHXAHMJYOZGDZXE3FZYL54NFEHXTSSMACI";
  mockBuild.mockResolvedValue("UNSIGNED");
  mockSignTransaction.mockResolvedValue({ signedTxXdr: "SIGNED", signerAddress: mockAddress });
  mockSubmit.mockResolvedValue("txhash");
});

describe("useUsdcTrustline", () => {
  it("builds the changeTrust for the connected wallet, signs it with SWK and submits it", async () => {
    const onConfirmed = vi.fn();
    const { result } = renderHook(() => useUsdcTrustline(onConfirmed));

    await act(async () => {
      await result.current.enable();
    });

    expect(mockBuild).toHaveBeenCalledWith(mockAddress);
    expect(mockSignTransaction).toHaveBeenCalledWith("UNSIGNED", {
      networkPassphrase: "Public Global Stellar Network ; September 2015",
      address: mockAddress,
    });
    expect(mockSubmit).toHaveBeenCalledWith("SIGNED");
    expect(result.current.state).toBe("confirmed");
    expect(result.current.transactionHash).toBe("txhash");
    expect(onConfirmed).toHaveBeenCalledTimes(1);
  });

  it("reports a declined signature as USER_REJECTED without submitting", async () => {
    mockSignTransaction.mockRejectedValue(new Error("User declined access"));
    const { result } = renderHook(() => useUsdcTrustline());

    await act(async () => {
      await result.current.enable();
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error?.code).toBe("USER_REJECTED");
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("shows the submission failure message", async () => {
    mockSubmit.mockRejectedValue(new Error("The network rejected the transaction. Please try again."));
    const onConfirmed = vi.fn();
    const { result } = renderHook(() => useUsdcTrustline(onConfirmed));

    await act(async () => {
      await result.current.enable();
    });

    expect(result.current.error).toEqual({
      code: "API_ERROR",
      message: "The network rejected the transaction. Please try again.",
    });
    expect(onConfirmed).not.toHaveBeenCalled();
  });

  it("asks for a wallet when none is connected", async () => {
    mockAddress = null;
    const { result } = renderHook(() => useUsdcTrustline());

    await act(async () => {
      await result.current.enable();
    });

    expect(result.current.error?.code).toBe("NO_WALLET_CONNECTED");
    expect(mockBuild).not.toHaveBeenCalled();
  });
});

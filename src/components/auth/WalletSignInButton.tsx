"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { LoadingSpinner } from "@/components/ui/Icon";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { useWalletKit } from "@/hooks/use-wallet-kit";
import { useWalletAuth, type WalletAuthStep } from "@/hooks/useWalletAuth";

export interface WalletSignInButtonProps {
  onSignedIn?: () => void;
  disabled?: boolean;
  className?: string;
}

const STEP_LABEL: Record<Exclude<WalletAuthStep, "idle">, string> = {
  "requesting-challenge": "Preparing sign-in…",
  signing: "Check your wallet to sign",
  verifying: "Verifying signature…",
};

// Wallet brand data — logos inlined so there are no external asset deps
const WALLETS = [
  {
    id: "freighter",
    name: "Freighter",
    description: "Stellar.org",
    logo: (
      <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#5E4EE6" />
        <path
          d="M10 20.5h20M10 14.5l12 6-12 6"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "lobstr",
    name: "Lobstr",
    description: "Ultra Stellar",
    logo: (
      <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#1A1A2E" />
        <ellipse cx="20" cy="22" rx="8" ry="10" stroke="#00CFAA" strokeWidth="2" />
        <path d="M14 16c2-4 10-4 12 0" stroke="#00CFAA" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="13" r="2" fill="#00CFAA" />
      </svg>
    ),
  },
  {
    id: "xbull",
    name: "xBull",
    description: "xBull Wallet",
    logo: (
      <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#0D0D0D" />
        <path
          d="M12 12l8 8-8 8M20 20h8"
          stroke="#F5A623"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

export function WalletSignInButton({
  onSignedIn,
  disabled = false,
  className,
}: WalletSignInButtonProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address } = useWalletKit();
  const { signIn, step, isAuthenticating, error, reset } = useWalletAuth();

  async function runSignIn(publicKey: string): Promise<void> {
    const session = await signIn(publicKey);
    if (session !== null) onSignedIn?.();
  }

  async function handleConnect(): Promise<void> {
    reset();
    if (address !== null) {
      await runSignIn(address);
    } else {
      setIsModalOpen(true);
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>

      {/* Supported wallets */}
      <div className="flex items-center justify-center gap-3">
        {WALLETS.map((wallet) => (
          <div
            key={wallet.id}
            className="flex items-center gap-1.5"
            title={wallet.name}
          >
            <span className="shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] rounded-lg opacity-80">
              {wallet.logo}
            </span>
            <span className="text-[11px] text-text-secondary font-medium">{wallet.name}</span>
          </div>
        ))}
      </div>

      {/* Primary CTA */}
      <button
        type="button"
        onClick={handleConnect}
        disabled={disabled || isAuthenticating}
        aria-busy={isAuthenticating}
        className={cn(
          "w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl",
          "bg-primary text-white font-medium text-sm cursor-pointer",
          "shadow-[4px_4px_8px_#b8d0d0,-4px_-4px_8px_#ffffff]",
          "hover:brightness-105 hover:shadow-[6px_6px_12px_#b8d0d0,-6px_-6px_12px_#ffffff] hover:scale-[1.01]",
          "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.15)] active:scale-[0.99]",
          "focus-visible:ring-2 focus-visible:ring-primary/40 outline-none",
          "transition-all duration-150",
          "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
        )}
      >
        {isAuthenticating ? (
          <LoadingSpinner size="sm" />
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-90" aria-hidden="true">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
        )}
        <span>
          {step === "idle" ? "Sign in with wallet" : STEP_LABEL[step]}
        </span>
      </button>

      {/* Security note */}
      <p className="text-center text-[11px] text-text-secondary leading-snug">
        Your keys never leave your wallet.{" "}
        <span className="text-text-tertiary">No password required.</span>
      </p>

      {error !== null && (
        <p role="alert" className="text-xs text-error text-center px-1">
          {error}
        </p>
      )}

      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnected={(connected) => {
          setIsModalOpen(false);
          void runSignIn(connected);
        }}
      />
    </div>
  );
}

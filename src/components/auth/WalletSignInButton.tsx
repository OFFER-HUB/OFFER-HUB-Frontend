"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { LoadingSpinner } from "@/components/ui/Icon";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
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

const WALLETS = [
  { id: "freighter", name: "Freighter", src: "/wallets/freighter_logo.png" },
  { id: "lobstr", name: "Lobstr", src: "/wallets/lobstr_logo.png" },
  { id: "xbull", name: "xBull", src: "/wallets/xbull_logo.png" },
] as const;

export function WalletSignInButton({
  onSignedIn,
  disabled = false,
  className,
}: WalletSignInButtonProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { signIn, step, isAuthenticating, error, reset } = useWalletAuth();

  async function runSignIn(publicKey: string): Promise<void> {
    const session = await signIn(publicKey);
    if (session !== null) onSignedIn?.();
  }

  // Always open the picker. Stellar Wallets Kit remembers the last wallet
  // you picked (e.g. xBull) across visits, so silently reusing that instead
  // of asking meant every future sign-in skipped straight to it with no way
  // to pick a different one.
  function handleConnect(): void {
    reset();
    setIsModalOpen(true);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>

      {/* Supported wallet logos */}
      <div className="flex items-center justify-center gap-6">
        {WALLETS.map((wallet) => (
          <div key={wallet.id} className="flex flex-col items-center gap-1" title={wallet.name}>
            <span className="shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] rounded-xl p-0.5 bg-white">
              <Image src={wallet.src} alt={wallet.name} width={36} height={36} className="rounded-lg" />
            </span>
            <span className="text-[10px] text-text-secondary font-medium">{wallet.name}</span>
          </div>
        ))}
      </div>

      {/* Primary CTA, matches the email sign-in button style */}
      <button
        type="button"
        onClick={handleConnect}
        disabled={disabled || isAuthenticating}
        aria-busy={isAuthenticating}
        className={cn(
          "w-full px-6 py-3 rounded-xl font-medium cursor-pointer",
          "bg-primary text-white",
          "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
          "hover:bg-primary-hover hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:scale-[1.02]",
          "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] active:scale-[0.98]",
          "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
          "transition-all duration-200 flex items-center justify-center gap-2",
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
      <p className="text-center text-xs text-text-secondary leading-relaxed">
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

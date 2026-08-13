"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { StellarIcon } from "@/components/ui/StellarIcon";
import { LoadingSpinner } from "@/components/ui/Icon";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { useWalletKit } from "@/hooks/use-wallet-kit";
import { useWalletAuth, type WalletAuthStep } from "@/hooks/useWalletAuth";

export interface WalletSignInButtonProps {
  /** Called once the wallet session is stored, so the page can redirect. */
  onSignedIn?: () => void;
  /** Mirrors the other auth buttons while an email login is in flight. */
  disabled?: boolean;
  className?: string;
}

/**
 * What the user is actually waiting on.
 *
 * The signing step blocks on the wallet's own confirmation popup, which is
 * easily missed behind the browser window — naming it is the difference between
 * waiting and knowing to go look.
 */
const STEP_LABEL: Record<Exclude<WalletAuthStep, "idle">, string> = {
  "requesting-challenge": "Preparing sign-in...",
  signing: "Check your wallet to sign",
  verifying: "Verifying signature...",
};

/**
 * Sign in with a Stellar wallet — the D1.2 challenge-response flow.
 *
 * With no wallet connected the click opens `WalletConnectModal` and the flow
 * continues from its `onConnected`, so connecting and signing in read as one
 * action rather than two.
 */
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
    if (session !== null) {
      onSignedIn?.();
    }
  }

  async function handleClick(): Promise<void> {
    reset();

    if (address === null) {
      setIsModalOpen(true);
      return;
    }

    await runSignIn(address);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isAuthenticating}
        aria-busy={isAuthenticating}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
          "bg-white border border-border-light cursor-pointer",
          "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
          "hover:shadow-[5px_5px_10px_#d1d5db,-5px_-5px_10px_#ffffff] hover:scale-[1.02]",
          "active:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff] active:scale-[0.98]",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        )}
      >
        {isAuthenticating ? (
          <LoadingSpinner size="sm" />
        ) : (
          <span className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <StellarIcon className="text-primary" />
          </span>
        )}
        <span className="text-sm font-medium text-text-primary">
          {step === "idle" ? "Continue with wallet" : STEP_LABEL[step]}
        </span>
      </button>

      {/* Announced rather than only shown: the failure often happens while the
          user is looking at the wallet popup, not at this page. */}
      {error !== null && (
        <p role="alert" className="text-xs text-error px-1">
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

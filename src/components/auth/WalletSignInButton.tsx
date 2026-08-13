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
        // The primary action of its panel, so it mirrors the email tab's submit
        // button rather than the secondary styling of the OAuth row.
        className={cn(
          "w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl",
          "bg-primary text-white font-medium cursor-pointer",
          "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
          "hover:bg-primary-hover hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:scale-[1.02]",
          "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] active:scale-[0.98]",
          "focus-visible:ring-2 focus-visible:ring-primary/40 outline-none",
          "transition-all duration-200",
          "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
        )}
      >
        {isAuthenticating ? (
          <LoadingSpinner size="sm" />
        ) : (
          <span className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <StellarIcon className="text-white" />
          </span>
        )}
        <span className="text-sm">
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

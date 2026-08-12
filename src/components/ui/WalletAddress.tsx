"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/cn";
import { StellarIcon } from "@/components/ui/StellarIcon";

interface WalletAddressProps {
  address: string;
  className?: string;
  /**
   * Render the complete public key instead of the truncated form, for places
   * that have to show the address in full — such as the navbar wallet menu.
   */
  showFull?: boolean;
}

function truncateAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export function WalletAddress({
  address,
  className,
  showFull = false,
}: WalletAddressProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  }, [address]);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-xl",
        "bg-white",
        "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
        "transition-all duration-200",
        "group",
        className
      )}
    >
      {/* Stellar logo */}
      <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <StellarIcon className="text-primary" />
      </div>

      {/* Address */}
      <span
        className={cn(
          "font-mono text-sm text-text-primary",
          showFull && "min-w-0 break-all"
        )}
      >
        {showFull ? address : truncateAddress(address)}
      </span>

      {/* Copy button */}
      <button
        onClick={copyToClipboard}
        className={cn(
          "p-1.5 rounded-lg flex-shrink-0",
          "bg-white",
          "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
          "hover:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
          "active:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]",
          "transition-all duration-150",
          "cursor-pointer",
          copied && "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
        )}
        title={copied ? "Copied!" : "Copy address"}
        aria-label={copied ? "Address copied" : "Copy wallet address"}
      >
        {copied ? (
          <svg
            className="w-4 h-4 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

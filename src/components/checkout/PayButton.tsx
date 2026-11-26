"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";

interface PayButtonProps {
  amount: string;
  disabled?: boolean;
  isChecking?: boolean;
  onPay: () => void;
}

function formatMoney(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toFixed(2);
}

export function PayButton({ amount, disabled, isChecking, onPay }: PayButtonProps): React.JSX.Element {
  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={onPay}
        disabled={disabled || isChecking}
        aria-describedby="pay-subtext"
        className={cn(
          "w-full py-3 px-5 rounded-xl font-bold text-sm text-white h-12",
          "bg-primary hover:bg-primary-hover active:bg-primary-hover",
          "shadow-[3px_3px_8px_#cbd5e1]",
          "hover:shadow-[4px_4px_12px_#cbd5e1]",
          "active:scale-[0.99] transition-all duration-200 cursor-pointer",
          "flex items-center justify-center gap-2",
          "disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        {isChecking ? (
          <>
            <LoadingSpinner size="sm" className="text-white" />
            <span>Checking…</span>
          </>
        ) : (
          <>
            <Icon path={ICON_PATHS.lock} size="sm" />
            <span>Pay ${formatMoney(amount)} USDC</span>
          </>
        )}
      </button>
      <p id="pay-subtext" className="text-[13px] text-text-secondary text-center">
        You'll confirm 2 steps in your wallet.
      </p>
    </div>
  );
}

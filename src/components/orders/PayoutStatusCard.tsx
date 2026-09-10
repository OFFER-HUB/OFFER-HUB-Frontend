"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import type { OrderPayout, PayoutStatus } from "@/types/order.types";

// ── Status config ─────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  /** True while the payout can still change — polling should continue. */
  isTerminal: boolean;
}

const STATUS_CONFIG: Record<PayoutStatus, StatusConfig> = {
  PENDING: {
    label: "Pending",
    description: "Payout is queued and will be processed shortly.",
    icon: ICON_PATHS.clock,
    color: "text-text-secondary",
    bg: "bg-text-secondary/10",
    isTerminal: false,
  },
  PROCESSING: {
    label: "Processing",
    description: "Funds are on their way to your bank account.",
    icon: ICON_PATHS.arrowRight,
    color: "text-primary",
    bg: "bg-primary/10",
    isTerminal: false,
  },
  COMPLETED: {
    label: "Completed",
    description: "Funds have been deposited to your bank account.",
    icon: ICON_PATHS.check,
    color: "text-success",
    bg: "bg-success/10",
    isTerminal: true,
  },
  FAILED: {
    label: "Failed",
    description: "The payout could not be completed. Contact support if the issue persists.",
    icon: ICON_PATHS.x,
    color: "text-error",
    bg: "bg-error/10",
    isTerminal: true,
  },
  REFUNDED: {
    label: "Refunded",
    description: "BlindPay returned the funds to OfferHub. Our team will reach out to arrange a new transfer.",
    icon: ICON_PATHS.arrowLeft,
    color: "text-warning",
    bg: "bg-warning/10",
    isTerminal: true,
  },
  ON_HOLD: {
    label: "Under Review",
    description: "Your payout is under compliance review. This usually resolves within 1–2 business days.",
    icon: ICON_PATHS.shield,
    color: "text-warning",
    bg: "bg-warning/10",
    isTerminal: false,
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function CorridorBadge({ corridor, fiatCurrency }: { corridor: string; fiatCurrency: string }) {
  return (
    <div className={cn(NEUMORPHIC_INSET, "rounded-xl px-3 py-1.5 flex items-center gap-2 w-fit")}>
      <span className="text-xs font-mono text-text-secondary">{corridor}</span>
      <span className="text-xs font-semibold text-primary">{fiatCurrency}</span>
    </div>
  );
}

function AmountRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className={cn("text-sm font-semibold text-text-primary", mono && "font-mono")}>{value}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface PayoutStatusCardProps {
  payout: OrderPayout;
}

export function PayoutStatusCard({ payout }: PayoutStatusCardProps): React.JSX.Element {
  const config = STATUS_CONFIG[payout.status] ?? STATUS_CONFIG.PENDING;

  return (
    <div className={NEUMORPHIC_CARD}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Icon path={ICON_PATHS.creditCard} size="md" className="text-primary" />
          Payout Status
        </h2>
        <CorridorBadge corridor={payout.corridor} fiatCurrency={payout.fiatCurrency} />
      </div>

      {/* Status indicator */}
      <div className={cn(NEUMORPHIC_INSET, "rounded-2xl p-4 mb-4")}>
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex-shrink-0 rounded-full p-2 mt-0.5",
              config.bg,
            )}
          >
            {!config.isTerminal && payout.status !== "PENDING" ? (
              <LoadingSpinner size="sm" className={config.color} />
            ) : (
              <Icon path={config.icon} size="sm" className={config.color} />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-sm font-semibold", config.color)}>{config.label}</span>
              {!config.isTerminal && (
                <span className="text-xs text-text-secondary">(in progress)</span>
              )}
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">{config.description}</p>
          </div>
        </div>

        {/* Failure / hold reason */}
        {payout.failureReason && (
          <p className="mt-3 text-xs text-error border-t border-error/10 pt-3">
            Reason: {payout.failureReason}
          </p>
        )}
      </div>

      {/* Amount details */}
      <div className="space-y-2">
        <AmountRow label="USDC sent" value={payout.usdcAmount ? `${payout.usdcAmount} USDC` : null} />
        {payout.fiatAmount && payout.exchangeRate && (
          <>
            <AmountRow label="Fiat received" value={`${payout.fiatAmount} ${payout.fiatCurrency}`} />
            <AmountRow label="Exchange rate" value={payout.exchangeRate} mono />
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { MilestoneStatusBadge } from "@/components/ui/MilestoneStatusBadge";
import {
  resolveMilestonePaymentStatus,
  type Milestone,
  type MilestonePaymentStatus,
  type OrderStatus,
} from "@/types/order.types";

export interface OrderMilestonesCardProps {
  orderId: string;
  orderStatus: OrderStatus;
  milestones?: Milestone[];
  isBuyer?: boolean;
  isSeller?: boolean;
}

function getMilestoneStatusIcon(status: MilestonePaymentStatus): {
  icon: string;
  className: string;
} {
  switch (status) {
    case "RELEASED":
      return { icon: ICON_PATHS.check, className: "bg-success/15 text-success" };
    case "AWAITING_APPROVAL":
      return { icon: ICON_PATHS.clock, className: "bg-warning/15 text-warning" };
    case "REFUNDED":
      return { icon: ICON_PATHS.alertCircle, className: "bg-error/15 text-error" };
    case "PENDING":
    default:
      return { icon: ICON_PATHS.calendar, className: "bg-gray-100 text-text-secondary" };
  }
}

function getMilestoneStatusNote(
  status: MilestonePaymentStatus,
  isSeller?: boolean
): string {
  switch (status) {
    case "RELEASED":
      return isSeller
        ? "Payment released to your wallet."
        : "Funds released to freelancer.";
    case "AWAITING_APPROVAL":
      return isSeller
        ? "Work submitted. Waiting for client review to release funds."
        : "Deliverable submitted. Review work to release milestone funds.";
    case "REFUNDED":
      return "Milestone funds refunded.";
    case "PENDING":
    default:
      return isSeller
        ? "In progress. Mark milestone completed when ready."
        : "Work in progress. Pending submission.";
  }
}

export function OrderMilestonesCard({
  orderStatus,
  milestones,
  isBuyer,
  isSeller,
}: OrderMilestonesCardProps): React.JSX.Element {
  const isFreelancer = Boolean(isSeller && !isBuyer);

  if (!milestones || milestones.length === 0) {
    return (
      <div className={cn(NEUMORPHIC_CARD, "p-6 space-y-3")}>
        <div className="flex items-center gap-2">
          <Icon path={ICON_PATHS.briefcase} size="md" className="text-text-secondary" />
          <h2 className="text-base font-semibold text-text-primary">Milestone Schedule</h2>
        </div>
        <p className="text-sm text-text-secondary">
          This order has a single lump-sum payout released upon full project completion.
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalAmount = milestones.reduce(
    (sum, m) => sum + (parseFloat(m.amount) || 0),
    0
  );

  const releasedAmount = milestones
    .filter((m) => resolveMilestonePaymentStatus(m, orderStatus) === "RELEASED")
    .reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  const releasedCount = milestones.filter(
    (m) => resolveMilestonePaymentStatus(m, orderStatus) === "RELEASED"
  ).length;

  const awaitingCount = milestones.filter(
    (m) => resolveMilestonePaymentStatus(m, orderStatus) === "AWAITING_APPROVAL"
  ).length;

  const percentReleased =
    totalAmount > 0 ? Math.min(100, Math.round((releasedAmount / totalAmount) * 100)) : 0;

  return (
    <div className={cn(NEUMORPHIC_CARD, "p-6 space-y-6")}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Icon path={ICON_PATHS.list} size="md" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Milestone Breakdown & Payment Status
            </h2>
            <p className="text-xs text-text-secondary">
              Incremental escrow release per milestone
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-background text-text-secondary shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]">
          {milestones.length} {milestones.length === 1 ? "Milestone" : "Milestones"}
        </span>
      </div>

      {/* Progress & Financial Overview */}
      <div className={cn(NEUMORPHIC_INSET, "p-4 rounded-xl space-y-3")}>
        <div className="flex flex-wrap items-center justify-between text-xs gap-2">
          <span className="text-text-secondary font-medium">
            Escrow Released:{" "}
            <strong className="text-text-primary font-semibold">
              ${releasedAmount.toFixed(2)} USD
            </strong>{" "}
            of ${totalAmount.toFixed(2)} USD ({percentReleased}%)
          </span>
          <span className="text-text-secondary">
            {releasedCount} of {milestones.length} paid
            {awaitingCount > 0 && ` · ${awaitingCount} awaiting review`}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden shadow-inner">
          <div
            className="bg-success h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentReleased}%` }}
            role="progressbar"
            aria-valuenow={percentReleased}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Milestone List */}
      <div className="space-y-3">
        {milestones.map((milestone, idx) => {
          const paymentStatus = resolveMilestonePaymentStatus(
            milestone,
            orderStatus
          );
          const iconConfig = getMilestoneStatusIcon(paymentStatus);
          const note = getMilestoneStatusNote(paymentStatus, isFreelancer);
          const amountNum = parseFloat(milestone.amount) || 0;

          return (
            <div
              key={milestone.id || `milestone-${idx}`}
              className={cn(
                NEUMORPHIC_INSET,
                "p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              )}
            >
              {/* Left: Indicator & Description */}
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                    iconConfig.className
                  )}
                  aria-label={paymentStatus}
                >
                  <Icon path={iconConfig.icon} size="sm" />
                </span>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Milestone {idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-text-primary truncate">
                      {milestone.title}
                    </h3>
                  </div>

                  {milestone.description && (
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                      {milestone.description}
                    </p>
                  )}

                  <p className="text-[11px] text-text-secondary flex items-center gap-1.5 pt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-text-secondary/40" />
                    <span>{note}</span>
                  </p>
                </div>
              </div>

              {/* Right: Amount & Status Badge */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-black/5">
                <span className="text-sm font-bold font-mono text-text-primary">
                  ${amountNum.toFixed(2)} USD
                </span>
                <MilestoneStatusBadge status={paymentStatus} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Incremental Payment Policy Guidance Callout */}
      <div
        className={cn(
          "p-4 rounded-xl border-l-4 text-xs leading-relaxed",
          isFreelancer
            ? "bg-primary/5 border-primary text-text-primary"
            : "bg-emerald-500/5 border-emerald-600 text-text-primary"
        )}
      >
        <div className="flex items-start gap-2.5">
          <Icon
            path={isFreelancer ? ICON_PATHS.briefcase : ICON_PATHS.shield}
            size="sm"
            className={cn(
              "shrink-0 mt-0.5",
              isFreelancer ? "text-primary" : "text-emerald-600"
            )}
          />
          <div>
            <strong className="font-semibold block mb-0.5">
              {isFreelancer
                ? "Incremental Earnings Release (Backend #281)"
                : "Protected Milestone Release"}
            </strong>
            <p className="text-text-secondary">
              {isFreelancer
                ? "Funds for each milestone are released individually into your balance upon client approval. You do not have to wait for the entire order to complete before getting paid for finished milestones."
                : "Escrow funds for each milestone remain securely held until you review and approve that milestone's completed work."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

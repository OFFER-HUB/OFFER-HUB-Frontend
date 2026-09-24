"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { Milestone } from "@/types/order.types";

interface MilestonePaymentStatusCardProps {
  milestones: Milestone[];
}

const STATUS_COPY: Record<Milestone["status"], string> = {
  OPEN: "Open",
  COMPLETED: "Completed — awaiting release",
  RELEASED: "Paid",
};

/**
 * Milestone-by-milestone payment status for a multi-milestone order.
 *
 * A milestone can sit at COMPLETED for a while before it's RELEASED — the
 * seller marking work done and the funds actually leaving escrow are two
 * separate steps now that release happens per milestone instead of all at
 * once (OFFER-HUB-API#281). Single/no-milestone orders have nothing
 * incremental to show, so this card only renders for real multi-milestone
 * orders — same threshold the backend itself uses.
 */
export function MilestonePaymentStatusCard({
  milestones,
}: MilestonePaymentStatusCardProps): React.JSX.Element | null {
  if (milestones.length <= 1) {
    return null;
  }

  const releasedCount = milestones.filter((m) => m.status === "RELEASED").length;

  return (
    <div className={NEUMORPHIC_CARD}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon path={ICON_PATHS.currency} size="sm" className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Milestone Payments</h2>
          <p className="text-sm text-text-secondary">
            {releasedCount} of {milestones.length} released
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {milestones.map((m) => {
          const released = m.status === "RELEASED";
          const completed = m.status === "COMPLETED";
          return (
            <li key={m.id} className={cn(NEUMORPHIC_INSET, "p-3 rounded-xl flex items-center gap-3")}>
              <span
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  released
                    ? "bg-success/10 text-success"
                    : completed
                      ? "bg-warning/10 text-warning"
                      : "bg-gray-100 text-text-secondary"
                )}
              >
                <Icon
                  path={released ? ICON_PATHS.currency : completed ? ICON_PATHS.check : ICON_PATHS.clock}
                  size="sm"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary truncate">{m.title}</p>
                <p className="text-xs text-text-secondary">{STATUS_COPY[m.status]}</p>
              </div>
              <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
                ${Number(m.amount).toFixed(2)} USD
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

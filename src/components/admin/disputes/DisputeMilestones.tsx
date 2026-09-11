"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import type { AdminDisputeMilestone } from "@/types/admin.types";

export interface DisputeMilestonesProps {
  milestones: AdminDisputeMilestone[];
  currency: string;
}

/** The order's milestone breakdown — what a SPLIT resolution is decided on. */
export function DisputeMilestones({ milestones, currency }: DisputeMilestonesProps): React.JSX.Element {
  if (milestones.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        Single-payment order — no milestones. The whole amount is either released or refunded.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {milestones.map((m) => {
        const done = m.status === "COMPLETED";
        return (
          <li key={m.id} className={cn(NEUMORPHIC_INSET, "p-3 rounded-xl flex items-center gap-3")}>
            <span
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                done ? "bg-success/10 text-success" : "bg-gray-100 text-text-secondary"
              )}
            >
              <Icon path={done ? ICON_PATHS.check : ICON_PATHS.clock} size="sm" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary truncate">{m.title}</p>
              <p className="text-xs text-text-secondary">{done ? "Completed" : "Open"}</p>
            </div>
            <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
              ${Number(m.amount).toFixed(2)} {currency}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

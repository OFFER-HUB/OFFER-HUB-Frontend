"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { ADMIN_DISPUTE_STATUS_CONFIG, type AdminDispute, type AdminDisputeStatus } from "@/types/admin.types";

export interface DisputesSummaryProps {
  disputes: AdminDispute[];
}

/** Counts for the loaded page — `GET /disputes` has no aggregate endpoint. */
export function DisputesSummary({ disputes }: DisputesSummaryProps) {
  const statuses = Object.keys(ADMIN_DISPUTE_STATUS_CONFIG) as AdminDisputeStatus[];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statuses.map((status) => {
        const cfg = ADMIN_DISPUTE_STATUS_CONFIG[status];
        const count = disputes.filter((d) => d.status === status).length;
        return (
          <div key={status} className={cn(NEUMORPHIC_CARD, "p-4 flex items-center justify-between")}>
            <span className="text-sm text-text-secondary">{cfg.label}</span>
            <span className={cn("text-lg font-bold px-3 py-1 rounded-full", cfg.color, cfg.bg)}>{count}</span>
          </div>
        );
      })}
      <div className={cn(NEUMORPHIC_CARD, "p-4 flex items-center justify-between")}>
        <span className="text-sm text-text-secondary">On this page</span>
        <span className="text-lg font-bold text-text-primary px-3 py-1 rounded-full bg-gray-100">{disputes.length}</span>
      </div>
    </div>
  );
}

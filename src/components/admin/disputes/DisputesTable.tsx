"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { NEUMORPHIC_CARD, ICON_BUTTON } from "@/lib/styles";
import { formatDate } from "@/lib/date-formatters";
import {
  ADMIN_DISPUTE_STATUS_CONFIG,
  ADMIN_DISPUTE_REASON_LABELS,
  DISPUTE_OPENED_BY_LABELS,
  disputePartyName,
  type AdminDispute,
} from "@/types/admin.types";

const COLUMN_COUNT = 7;

export interface DisputesTableProps {
  disputes: AdminDispute[];
  isLoading: boolean;
  onViewDetail: (dispute: AdminDispute) => void;
}

const HEADER =
  "px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap";

function TableRowSkeleton() {
  return (
    <tr className="border-t border-gray-100 animate-pulse">
      {Array.from({ length: COLUMN_COUNT }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className={cn("h-4 rounded bg-gray-200", i === 0 ? "w-40" : i === COLUMN_COUNT - 1 ? "w-8" : "w-20")} />
        </td>
      ))}
    </tr>
  );
}

export function StatusBadge({ status }: { status: AdminDispute["status"] }) {
  const cfg = ADMIN_DISPUTE_STATUS_CONFIG[status];
  return (
    <span className={cn("text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap", cfg.color, cfg.bg)}>
      {cfg.label}
    </span>
  );
}

function formatAmount(amount: string, currency: string): string {
  const value = Number(amount);
  return Number.isFinite(value) ? `$${value.toFixed(2)} ${currency}` : `${amount} ${currency}`;
}

export function DisputesTable({ disputes, isLoading, onViewDetail }: DisputesTableProps) {
  return (
    <div className={cn(NEUMORPHIC_CARD, "overflow-x-auto p-0")}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-gray-50/80">
            <th className={HEADER}>Order</th>
            <th className={HEADER}>Parties</th>
            <th className={HEADER}>Reason</th>
            <th className={HEADER}>Opened by</th>
            <th className={HEADER}>Amount</th>
            <th className={HEADER}>Status</th>
            <th className={HEADER}>Opened</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
          ) : disputes.length === 0 ? (
            <tr>
              <td colSpan={COLUMN_COUNT} className="py-8">
                <EmptyState
                  icon={ICON_PATHS.flag}
                  title="No disputes found"
                  message="No disputes match your current filters."
                />
              </td>
            </tr>
          ) : (
            disputes.map((dispute) => (
              <tr
                key={dispute.id}
                className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                onClick={() => onViewDetail(dispute)}
              >
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-text-primary truncate max-w-[260px]">{dispute.order.title}</p>
                  <p className="text-xs text-text-secondary font-mono truncate max-w-[260px]">{dispute.order.id}</p>
                </td>
                <td className="px-4 py-3 text-xs">
                  <p className="text-text-primary truncate max-w-[220px]">
                    <span className="text-text-secondary">Buyer </span>
                    {disputePartyName(dispute.order.buyer)}
                  </p>
                  <p className="text-text-primary truncate max-w-[220px]">
                    <span className="text-text-secondary">Seller </span>
                    {disputePartyName(dispute.order.seller)}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs text-text-primary whitespace-nowrap">
                  {ADMIN_DISPUTE_REASON_LABELS[dispute.reason]}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-text-secondary bg-gray-100 px-2 py-1 rounded-full">
                    {DISPUTE_OPENED_BY_LABELS[dispute.openedBy]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-text-primary whitespace-nowrap">
                  {formatAmount(dispute.order.amount, dispute.order.currency)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={dispute.status} />
                </td>
                <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                  <div className="flex items-center justify-between gap-3">
                    {formatDate(dispute.createdAt)}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(dispute);
                      }}
                      className={cn(ICON_BUTTON, "w-8 h-8")}
                      title="View dispute"
                      aria-label={`View dispute for ${dispute.order.title}`}
                    >
                      <Icon path={ICON_PATHS.eye} size="sm" className="text-text-secondary" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

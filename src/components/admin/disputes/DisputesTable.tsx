"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { NEUMORPHIC_CARD, ICON_BUTTON } from "@/lib/styles";
import {
  ADMIN_DISPUTE_STATUS_CONFIG,
  ADMIN_DISPUTE_PRIORITY_CONFIG,
  type AdminDispute,
  type AdminDisputesSort,
  type AdminDisputeSortField,
} from "@/types/admin.types";
import { DISPUTE_REASON_LABELS } from "@/types/dispute.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DisputesTableProps {
  disputes: AdminDispute[];
  isLoading: boolean;
  sort: AdminDisputesSort;
  onSortChange: (field: AdminDisputeSortField) => void;
  onViewDetail: (dispute: AdminDispute) => void;
  onResolve: (dispute: AdminDispute) => void;
  onChangeStatus: (dispute: AdminDispute) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortableHeader({
  field,
  label,
  currentSort,
  onSort,
}: {
  field: AdminDisputeSortField;
  label: string;
  currentSort: AdminDisputesSort;
  onSort: (f: AdminDisputeSortField) => void;
}) {
  const isActive = currentSort.field === field;
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-primary transition-colors whitespace-nowrap"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <Icon
          path={
            isActive && currentSort.direction === "asc"
              ? ICON_PATHS.arrowUp
              : ICON_PATHS.arrowDown
          }
          size="sm"
          className={isActive ? "text-primary" : "text-text-secondary/30"}
        />
      </span>
    </th>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-t border-gray-100 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div
            className={cn(
              "h-4 rounded bg-gray-200",
              i === 0 ? "w-32" : i === 7 ? "w-20" : "w-16"
            )}
          />
        </td>
      ))}
    </tr>
  );
}

function PriorityDot({ priority }: { priority: AdminDispute["priority"] }) {
  const cfg = ADMIN_DISPUTE_PRIORITY_CONFIG[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full",
        cfg.color,
        cfg.bg
      )}
    >
      {priority === "critical" && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {cfg.label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DisputesTable({
  disputes,
  isLoading,
  sort,
  onSortChange,
  onViewDetail,
  onResolve,
  onChangeStatus,
}: DisputesTableProps) {
  return (
    <div className={cn(NEUMORPHIC_CARD, "overflow-x-auto p-0")}>
      <table className="w-full min-w-[900px]">
        {/* Header */}
        <thead>
          <tr className="bg-gray-50/80">
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
              Dispute
            </th>
            <SortableHeader
              field="priority"
              label="Priority"
              currentSort={sort}
              onSort={onSortChange}
            />
            <SortableHeader
              field="status"
              label="Status"
              currentSort={sort}
              onSort={onSortChange}
            />
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
              Parties
            </th>
            <SortableHeader
              field="amount"
              label="Amount"
              currentSort={sort}
              onSort={onSortChange}
            />
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
              Reason
            </th>
            <SortableHeader
              field="createdAt"
              label="Opened"
              currentSort={sort}
              onSort={onSortChange}
            />
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
          ) : disputes.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8">
                <EmptyState
                  icon={ICON_PATHS.flag}
                  title="No disputes found"
                  message="No disputes match your current filters."
                />
              </td>
            </tr>
          ) : (
            disputes.map((dispute) => {
              const statusCfg = ADMIN_DISPUTE_STATUS_CONFIG[dispute.status];
              const isHighValue = dispute.amount >= 1000;
              const ageMs = Date.now() - new Date(dispute.createdAt).getTime();
              const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
              const isOld = ageDays >= 7 && dispute.status !== "resolved" && dispute.status !== "closed";

              return (
                <tr
                  key={dispute.id}
                  className={cn(
                    "border-t border-gray-100 transition-colors hover:bg-gray-50/50",
                    (isHighValue || isOld) && "bg-warning/5"
                  )}
                >
                  {/* Dispute title + indicators */}
                  <td className="px-4 py-3 max-w-[220px]">
                    <div className="flex flex-col gap-0.5">
                      <Link
                        href={`/admin/disputes/${dispute.id}`}
                        className="text-sm font-semibold text-text-primary hover:text-primary transition-colors truncate"
                        title={dispute.offerTitle}
                      >
                        {dispute.offerTitle}
                      </Link>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-text-secondary">#{dispute.id.slice(-6)}</span>
                        {isHighValue && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-warning/10 text-warning font-medium">
                            High Value
                          </span>
                        )}
                        {isOld && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-error/10 text-error font-medium">
                            {ageDays}d old
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PriorityDot priority={dispute.priority} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-full",
                        statusCfg.color,
                        statusCfg.bg
                      )}
                    >
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Parties */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="text-text-primary">
                        <span className="text-text-secondary">B: </span>
                        {dispute.buyer.username}
                      </span>
                      <span className="text-text-primary">
                        <span className="text-text-secondary">S: </span>
                        {dispute.seller.username}
                      </span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={cn("text-sm font-semibold", isHighValue ? "text-warning" : "text-text-primary")}>
                      ${dispute.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* Reason */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-text-secondary">
                      {DISPUTE_REASON_LABELS[dispute.reason]}
                    </span>
                  </td>

                  {/* Opened */}
                  <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                    {formatDate(dispute.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* View detail */}
                      <button
                        type="button"
                        onClick={() => onViewDetail(dispute)}
                        className={cn(ICON_BUTTON, "w-8 h-8")}
                        title="View detail"
                        aria-label={`View dispute ${dispute.id}`}
                      >
                        <Icon path={ICON_PATHS.eye} size="sm" className="text-text-secondary" />
                      </button>

                      {/* Change status */}
                      {dispute.status !== "resolved" && dispute.status !== "closed" && (
                        <button
                          type="button"
                          onClick={() => onChangeStatus(dispute)}
                          className={cn(ICON_BUTTON, "w-8 h-8")}
                          title="Change status"
                          aria-label={`Change status for dispute ${dispute.id}`}
                        >
                          <Icon path={ICON_PATHS.refresh} size="sm" className="text-primary/70 hover:text-primary" />
                        </button>
                      )}

                      {/* Resolve */}
                      {(dispute.status === "open" || dispute.status === "under_review") && (
                        <button
                          type="button"
                          onClick={() => onResolve(dispute)}
                          className={cn(ICON_BUTTON, "w-8 h-8")}
                          title="Resolve dispute"
                          aria-label={`Resolve dispute ${dispute.id}`}
                        >
                          <Icon path={ICON_PATHS.check} size="sm" className="text-success/70 hover:text-success" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

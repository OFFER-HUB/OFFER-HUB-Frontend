"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import type { AdminUserDetail } from "@/types/admin.types";

interface UserStatsGridProps {
  detail: AdminUserDetail | null;
  isLoading: boolean;
  error: string | null;
}

/** Read-only aggregate data shown alongside the editable user fields. */
export function UserStatsGrid({ detail, isLoading, error }: UserStatsGridProps) {
  const statItems = detail
    ? [
        {
          icon: ICON_PATHS.shoppingCart,
          label: "Orders (bought / sold)",
          value: `${detail._count.buyerOrders} / ${detail._count.sellerOrders}`,
        },
        {
          icon: ICON_PATHS.check,
          label: "Completed as seller",
          value: String(detail.stats.completedOrders),
        },
        { icon: ICON_PATHS.currency, label: "Earnings", value: `$${detail.stats.totalEarnings}` },
        {
          icon: ICON_PATHS.star,
          label: "Rating",
          value: detail.stats.averageRating ?? "No ratings",
        },
        { icon: ICON_PATHS.briefcase, label: "Services", value: String(detail._count.services) },
        {
          icon: ICON_PATHS.creditCard,
          label: "Balance",
          value: detail.balance ? `${detail.balance.available} ${detail.balance.currency}` : "—",
        },
      ]
    : [];

  return (
    <div className={cn(NEUMORPHIC_INSET, "rounded-xl p-4")}>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
        Statistics
      </p>
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <LoadingSpinner size="sm" />
          Loading…
        </div>
      ) : error ? (
        <p className="text-xs text-error">{error}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {statItems.map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon path={icon} size="sm" className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-text-secondary uppercase tracking-wide leading-none mb-0.5">
                  {label}
                </p>
                <p className="text-xs font-semibold text-text-primary truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ORDER_STATUS_CONFIG, type Order, type OrderStatus } from "@/types/order.types";

const FALLBACK_STATUS_STYLE = {
  color: "text-text-secondary",
  bg: "bg-text-secondary/10",
};

function resolveStatusStyle(status: OrderStatus): { color: string; bg: string } {
  return ORDER_STATUS_CONFIG[status] ?? FALLBACK_STATUS_STYLE;
}

interface OrderSummaryHeaderProps {
  order: Order;
  statusLabel: string;
}

export function OrderSummaryHeader({
  order,
  statusLabel,
}: OrderSummaryHeaderProps): React.JSX.Element {
  const [copiedId, setCopiedId] = useState(false);
  const statusStyle = resolveStatusStyle(order.status);
  const amount = parseFloat(order.amount);

  const createdDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className={cn(NEUMORPHIC_CARD, "p-6 sm:p-8")}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
              {order.source === "SERVICE" ? "Service Order" : "Project Order"}
            </span>

            <button
              type="button"
              onClick={handleCopyId}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-text-secondary",
                "bg-background shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                "hover:text-text-primary transition-colors"
              )}
              title="Copy Order ID"
            >
              <Icon path={copiedId ? ICON_PATHS.check : ICON_PATHS.copy} size="sm" className="w-3.5 h-3.5" />
              <span>{copiedId ? "Copied" : `#${order.id.slice(-8)}`}</span>
            </button>

            <span className="text-xs text-text-secondary flex items-center gap-1">
              <Icon path={ICON_PATHS.calendar} size="sm" className="w-3.5 h-3.5" />
              <span>Created {createdDate}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-snug">
            {order.title}
          </h1>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-black/5">
          <div className="text-left md:text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Order Amount</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-primary font-mono tracking-tight">
              ${amount.toFixed(2)} <span className="text-xs text-text-secondary uppercase">USD</span>
            </p>
          </div>

          <div className="flex items-center">
            <span
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold shadow-[2px_2px_5px_#cbd5e1]",
                statusStyle.bg,
                statusStyle.color
              )}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>{statusLabel}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

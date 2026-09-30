"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/data/service.data";
import { getChatIdByOrderId } from "@/data/chat.data";
import { hasClientRating } from "@/data/rating.data";
import type { ServiceOrder } from "@/types/service.types";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export interface OrderCardProps {
  order: ServiceOrder;
  onRateClient: (order: ServiceOrder) => void;
}

export function OrderCard({ order, onRateClient }: OrderCardProps): React.JSX.Element {
  const isCompleted = order.status === "completed" || order.status === "delivered";
  const alreadyRated = hasClientRating(order.id);

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-background">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "bg-primary text-white font-semibold text-sm"
          )}
        >
          {order.clientAvatar}
        </div>
        <div>
          <p className="font-medium text-text-primary">{order.clientName}</p>
          <p className="text-sm text-text-secondary">Ordered {formatDate(order.orderedAt)}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="font-semibold text-text-primary">${order.price}</p>
          <p className="text-xs text-text-secondary">Due {formatDate(order.deliveryDate)}</p>
        </div>

        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            ORDER_STATUS_COLORS[order.status]
          )}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>

        <div className="flex items-center gap-1">
          {isCompleted &&
            (alreadyRated ? (
              <span className={cn("p-2 rounded-lg", "text-success")} title="Client rated">
                <Icon path={ICON_PATHS.star} size="sm" />
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onRateClient(order)}
                className={cn(
                  "p-2 rounded-lg",
                  "text-text-secondary hover:text-warning hover:bg-warning/10",
                  "transition-colors cursor-pointer"
                )}
                title="Rate client"
              >
                <Icon path={ICON_PATHS.star} size="sm" />
              </button>
            ))}

          <Link
            href={`/app/chat/${getChatIdByOrderId(order.id)}`}
            className={cn(
              "p-2 rounded-lg",
              "text-text-secondary hover:text-primary hover:bg-primary/10",
              "transition-colors cursor-pointer"
            )}
            title="Chat with client"
          >
            <Icon path={ICON_PATHS.chat} size="sm" />
          </Link>

          {order.hasDispute ? (
            <Link
              href={`/app/freelancer/disputes?order=${order.id}`}
              className={cn(
                "p-2 rounded-lg",
                "text-error hover:bg-error/10",
                "transition-colors cursor-pointer"
              )}
              title="View dispute"
            >
              <Icon path={ICON_PATHS.flag} size="sm" />
            </Link>
          ) : (
            <Link
              href={`/app/freelancer/disputes/new?order=${order.id}`}
              className={cn(
                "p-2 rounded-lg",
                "text-text-secondary hover:text-warning hover:bg-warning/10",
                "transition-colors cursor-pointer"
              )}
              title="Open dispute"
            >
              <Icon path={ICON_PATHS.flag} size="sm" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

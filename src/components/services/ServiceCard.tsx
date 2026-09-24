"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { getServiceCategoryLabel } from "@/data/service.data";
import type { Service, ServiceStatus } from "@/types/service.types";

const STATUS_STYLES: Record<ServiceStatus, string> = {
  ACTIVE: "bg-success/15 text-success border border-success/30",
  PAUSED: "bg-warning/15 text-warning border border-warning/30",
  ARCHIVED: "bg-text-secondary/15 text-text-secondary border border-text-secondary/30",
};

const STATUS_LABELS: Record<ServiceStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  ARCHIVED: "Archived",
};

const STATUS_DOT_STYLES: Record<ServiceStatus, string> = {
  ACTIVE: "bg-success",
  PAUSED: "bg-warning",
  ARCHIVED: "bg-text-secondary",
};

const ACTION_ICON_BUTTON = cn(
  "w-9 h-9 rounded-xl flex items-center justify-center bg-white text-text-secondary",
  "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#0a0f1a,-3px_-3px_6px_#1e2a4a]",
  "hover:shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff] dark:hover:shadow-[1px_1px_3px_#0a0f1a,-1px_-1px_3px_#1e2a4a]",
  "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
  "transition-all duration-200"
);

export interface ServiceCardProps {
  service: Service;
  onDelete: (id: string, name: string) => void;
}

export function ServiceCard({ service, onDelete }: ServiceCardProps): React.JSX.Element {
  const priceFormatted = parseFloat(service.price || "0").toFixed(2);
  const rating = service.averageRating ? parseFloat(service.averageRating).toFixed(1) : null;

  return (
    <div
      className={cn(
        NEUMORPHIC_CARD,
        "p-6 flex flex-col justify-between group hover:translate-y-[-2px] transition-all duration-300 min-w-0"
      )}
    >
      <div className="space-y-3">
        {/* Top bar: Category and Status badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary truncate max-w-[170px]">
            {getServiceCategoryLabel(service.category)}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0",
              STATUS_STYLES[service.status]
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT_STYLES[service.status])} />
            {STATUS_LABELS[service.status]}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <Link
            href={`/app/freelancer/services/${service.id}`}
            className="font-bold text-base text-text-primary hover:text-primary transition-colors line-clamp-1 block"
            title={service.title}
          >
            {service.title}
          </Link>
          <p className="mt-1 text-xs text-text-secondary line-clamp-2 min-h-[2rem]">
            {service.description}
          </p>
        </div>

        {/* Metrics Box */}
        <div
          className={cn(
            "p-3 rounded-xl bg-background",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
            "grid grid-cols-3 gap-2 text-center"
          )}
        >
          <div>
            <span className="text-[10px] uppercase font-semibold text-text-secondary block">
              Price
            </span>
            <span className="text-sm font-bold text-primary">${priceFormatted}</span>
          </div>
          <div className="border-x border-border-light/60 dark:border-border-light/10">
            <span className="text-[10px] uppercase font-semibold text-text-secondary block">
              Delivery
            </span>
            <span className="text-sm font-semibold text-text-primary flex items-center justify-center gap-1">
              <Icon path={ICON_PATHS.clock} size="sm" className="text-text-secondary" />
              {service.deliveryDays}d
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-text-secondary block">
              Orders
            </span>
            <span className="text-sm font-semibold text-text-primary flex items-center justify-center gap-1">
              {rating ? (
                <>
                  <Icon path={ICON_PATHS.star} size="sm" className="text-warning fill-warning" />
                  {rating}
                </>
              ) : (
                `${service.totalOrders ?? 0}`
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border-light/70 dark:border-border-light/10">
        <span className="text-xs text-text-secondary">
          {service.totalOrders} {service.totalOrders === 1 ? "order completed" : "orders completed"}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/app/freelancer/services/${service.id}`}
            className={cn(ACTION_ICON_BUTTON, "hover:text-primary")}
            title="View Details"
          >
            <Icon path={ICON_PATHS.eye} size="sm" />
          </Link>
          <Link
            href={`/app/freelancer/services/${service.id}/edit`}
            className={cn(ACTION_ICON_BUTTON, "hover:text-primary")}
            title="Edit Service"
          >
            <Icon path={ICON_PATHS.edit} size="sm" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(service.id, service.title)}
            className={cn(ACTION_ICON_BUTTON, "hover:text-error cursor-pointer")}
            title="Delete Service"
          >
            <Icon path={ICON_PATHS.trash} size="sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

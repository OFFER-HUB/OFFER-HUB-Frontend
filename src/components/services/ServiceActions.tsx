"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import type { Service, ServiceStatus } from "@/types/service.types";

export interface ServiceActionsProps {
  service: Service;
  onStatusChange: (status: ServiceStatus) => void;
  onDelete: () => void;
}

export function ServiceActions({
  service,
  onStatusChange,
  onDelete,
}: ServiceActionsProps): React.JSX.Element {
  return (
    <div className={NEUMORPHIC_CARD}>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Actions</h2>
      <div className="space-y-3">
        <Link
          href={`/app/freelancer/services/${service.id}/edit`}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-xl",
            "bg-background text-text-primary",
            "hover:bg-gray-100 transition-colors cursor-pointer"
          )}
        >
          <Icon path={ICON_PATHS.edit} size="md" />
          <span className="font-medium">Edit Service</span>
        </Link>

        {service.status === "ACTIVE" ? (
          <button
            type="button"
            onClick={() => onStatusChange("PAUSED")}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-xl",
              "bg-warning/10 text-warning",
              "hover:bg-warning/20 transition-colors cursor-pointer"
            )}
          >
            <Icon path={ICON_PATHS.clock} size="md" />
            <span className="font-medium">Pause Service</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onStatusChange("ACTIVE")}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-xl",
              "bg-success/10 text-success",
              "hover:bg-success/20 transition-colors cursor-pointer"
            )}
          >
            <Icon path={ICON_PATHS.check} size="md" />
            <span className="font-medium">Activate Service</span>
          </button>
        )}

        <button
          type="button"
          onClick={onDelete}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-xl",
            "bg-error/10 text-error",
            "hover:bg-error/20 transition-colors cursor-pointer"
          )}
        >
          <Icon path={ICON_PATHS.trash} size="md" />
          <span className="font-medium">Delete Service</span>
        </button>
      </div>
    </div>
  );
}

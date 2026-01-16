"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, PRIMARY_BUTTON } from "@/lib/styles";
import { MOCK_SERVICES, SERVICE_CATEGORIES } from "@/data/service.data";
import type { Service, ServiceStatus } from "@/types/service.types";

const STATUS_STYLES: Record<ServiceStatus, string> = {
  active: "bg-success/20 text-success",
  paused: "bg-warning/20 text-warning",
  archived: "bg-text-secondary/20 text-text-secondary",
};

const STATUS_LABELS: Record<ServiceStatus, string> = {
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

function getCategoryLabel(value: string): string {
  return SERVICE_CATEGORIES.find((c) => c.value === value)?.label || value;
}

interface ServiceCardProps {
  service: Service;
}

function ServiceCard({ service }: ServiceCardProps): React.JSX.Element {
  return (
    <div className={cn(NEUMORPHIC_CARD, "p-4")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-text-primary truncate">{service.title}</h3>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0",
                STATUS_STYLES[service.status]
              )}
            >
              {STATUS_LABELS[service.status]}
            </span>
          </div>
          <p className="text-sm text-text-secondary mb-2">{getCategoryLabel(service.category)}</p>
          <p className="text-sm text-text-secondary line-clamp-2">{service.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-primary font-semibold">${service.price}</span>
          <span className="text-text-secondary flex items-center gap-1">
            <Icon path={ICON_PATHS.clock} size="sm" />
            {service.deliveryDays} {service.deliveryDays === 1 ? "day" : "days"}
          </span>
          <span className="text-text-secondary flex items-center gap-1">
            <Icon path={ICON_PATHS.star} size="sm" className="text-warning" />
            {service.rating}
          </span>
          <span className="text-text-secondary">{service.orders} orders</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cn(
              "p-2 rounded-lg",
              "text-text-secondary hover:text-text-primary hover:bg-background",
              "transition-colors cursor-pointer"
            )}
            title="Edit"
          >
            <Icon path={ICON_PATHS.edit} size="sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage(): React.JSX.Element {
  const [services] = useState<Service[]>(MOCK_SERVICES);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Services</h1>
          <p className="text-text-secondary text-sm">
            Manage your service offerings
          </p>
        </div>
        <Link href="/app/freelancer/services/new" className={cn(PRIMARY_BUTTON, "flex items-center gap-2")}>
          <Icon path={ICON_PATHS.plus} size="sm" />
          Create Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className={cn(NEUMORPHIC_CARD, "text-center py-12")}>
          <Icon
            path={ICON_PATHS.briefcase}
            size="xl"
            className="text-gray-300 mx-auto mb-4"
          />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No services yet
          </h3>
          <p className="text-text-secondary mb-4">
            Create your first service to start attracting clients.
          </p>
          <Link
            href="/app/freelancer/services/new"
            className={cn(PRIMARY_BUTTON, "inline-flex items-center gap-2")}
          >
            <Icon path={ICON_PATHS.plus} size="sm" />
            Create Your First Service
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}

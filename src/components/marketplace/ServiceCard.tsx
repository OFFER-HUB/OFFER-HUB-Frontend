"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { MarketplaceService } from "@/lib/api/marketplace";

interface ServiceCardProps {
  service: MarketplaceService;
  className?: string;
}

const CATEGORY_MAP: Record<string, string> = {
  WEB_DEVELOPMENT: "Web Development",
  MOBILE_DEVELOPMENT: "Mobile Development",
  DESIGN: "Design & Creative",
  WRITING: "Writing & Translation",
  MARKETING: "Marketing & Sales",
  VIDEO: "Video & Animation",
  MUSIC: "Music & Audio",
  DATA: "Data & Analytics",
  OTHER: "Other",
};

export function ServiceCard({ service, className }: ServiceCardProps): React.JSX.Element {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:4000";
  const price = parseFloat(service.price);
  const category = CATEGORY_MAP[service.category] || service.category;
  // Extract display name from email
  const userName = service.user?.email?.split("@")[0] || "Anonymous";
  const userEmail = service.user?.email || "";

  return (
    <Link
      href={`/marketplace/services/${service.id}`}
      className={cn(
        "block p-6 rounded-xl transition-all duration-200",
        "bg-background shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
        "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
        "hover:scale-[1.01]",
        className
      )}
    >
      {/* Freelancer Info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary truncate">{userName}</p>
          <p className="text-xs text-text-secondary truncate">{userEmail}</p>
        </div>
      </div>

      {/* Category Badge */}
      <div className="mb-3">
        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
          {category}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-text-secondary mb-4 line-clamp-3">{service.description}</p>

      {/* Details */}
      <div className="flex items-center justify-between pt-4 border-t border-border-light">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-primary">
            <Icon path={ICON_PATHS.currency} size="sm" />
            <span className="font-semibold">${price.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-text-secondary">
            <Icon path={ICON_PATHS.clock} size="sm" />
            <span className="text-sm">{service.deliveryDays} day{service.deliveryDays !== 1 ? "s" : ""}</span>
          </div>
        </div>
        {service.totalOrders > 0 && (
          <div className="flex items-center gap-1 text-text-secondary">
            <Icon path={ICON_PATHS.check} size="sm" />
            <span className="text-xs">{service.totalOrders} order{service.totalOrders !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Total Orders */}
      {service.totalOrders > 0 && (
        <div className="mt-3 flex items-center gap-1 text-xs text-text-secondary">
          <Icon path={ICON_PATHS.check} size="sm" />
          <span>{service.totalOrders} completed order{service.totalOrders !== 1 ? "s" : ""}</span>
        </div>
      )}
    </Link>
  );
}

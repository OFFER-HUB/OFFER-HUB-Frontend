"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { MarketplaceService } from "@/lib/api/marketplace";
import { HighlightedText } from "@/components/search/HighlightedText";

interface ServiceCardProps {
  service: MarketplaceService;
  className?: string;
  highlightQuery?: string;
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

export function ServiceCard({ service, className, highlightQuery }: ServiceCardProps): React.JSX.Element {
  const price = parseFloat(service.price);
  const category = CATEGORY_MAP[service.category] || service.category;
  const rating = service.averageRating ? parseFloat(service.averageRating) : null;

  const displayName = service.user?.firstName && service.user?.lastName
    ? `${service.user.firstName} ${service.user.lastName}`
    : service.user?.username || "Anonymous";

  const initials = service.user?.firstName && service.user?.lastName
    ? `${service.user.firstName.charAt(0)}${service.user.lastName.charAt(0)}`
    : displayName.charAt(0);

  const location = service.user?.country || "Remote";

  return (
    <Link
      href={`/marketplace/services/${service.id}`}
      className={cn(
        "group block p-6 rounded-3xl transition-all duration-300",
        "bg-background",
        "shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]",
        "hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
        "active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]",
        className
      )}
    >
      {/* Freelancer Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative shrink-0">
          <div className={cn(
            "w-16 h-16 rounded-2xl overflow-hidden transition-all duration-300",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
            "group-hover:shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
          )}>
            {service.user?.avatarUrl ? (
              <Image
                src={service.user.avatarUrl}
                alt={displayName}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] text-primary flex items-center justify-center font-bold text-xl">
                {initials.toUpperCase()}
              </div>
            )}
          </div>
          {service.status === "ACTIVE" && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-background shadow-sm" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-bold text-text-primary text-lg truncate group-hover:text-primary transition-colors">
              {displayName}
            </h3>
            <div className={cn(
              "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
              "bg-success"
            )}>
              <Icon path={ICON_PATHS.check} size="sm" className="text-white" strokeWidth={3} />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Icon path={ICON_PATHS.mapPin} size="sm" className="text-text-secondary flex-shrink-0" />
            <span className="text-sm text-text-secondary truncate">{location}</span>
          </div>
          {rating && (
            <div className="flex items-center gap-1">
              <Icon path={ICON_PATHS.star} size="sm" className="text-warning" />
              <span className="text-sm font-semibold text-text-primary">{rating.toFixed(1)}</span>
              <span className="text-xs text-text-secondary">({service.totalOrders} orders)</span>
            </div>
          )}
        </div>
      </div>

      {/* Service Title */}
      <div className="mb-4">
        <h4 className="font-bold text-text-primary text-base line-clamp-2 leading-tight mb-2">
          {highlightQuery ? (
            <HighlightedText text={service.title} query={highlightQuery} />
          ) : (
            service.title
          )}
        </h4>
        <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
          {highlightQuery ? (
            <HighlightedText text={service.description} query={highlightQuery} />
          ) : (
            service.description
          )}
        </p>
      </div>

      {/* Category Badge */}
      <div className="flex items-center gap-2 mb-6">
        <span className={cn(
          "px-3 py-1.5 rounded-xl text-xs font-semibold",
          "bg-background text-text-secondary",
          "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
        )}>
          {category}
        </span>
        {service.totalOrders > 10 && (
          <span className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold",
            "bg-success/10 text-success border border-success/20"
          )}>
            <Icon path={ICON_PATHS.check} size="sm" className="text-success" />
            Top Rated
          </span>
        )}
      </div>

      {/* Stats Section */}
      <div className="flex items-center justify-between mb-5 pt-4 border-t border-border-light">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "bg-background shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
          )}>
            <Icon path={ICON_PATHS.briefcase} size="sm" className="text-text-secondary" />
          </div>
          <span className="text-sm font-semibold text-text-primary">{service.totalOrders} orders</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "bg-background shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
          )}>
            <Icon path={ICON_PATHS.clock} size="sm" className="text-text-secondary" />
          </div>
          <span className="text-sm font-semibold text-text-primary">{service.deliveryDays} days</span>
        </div>
      </div>

      {/* Price & CTA */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-text-secondary">Starting at</span>
          <span className="text-2xl font-bold text-primary">${price.toLocaleString()}</span>
        </div>
        <button
          className={cn(
            "flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
            "bg-primary text-white",
            "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
            "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
            "active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]",
            "group-hover:bg-primary-hover"
          )}
        >
          View Service
        </button>
      </div>
    </Link>
  );
}

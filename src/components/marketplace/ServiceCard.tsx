"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { MarketplaceService } from "@/lib/api/marketplace";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { useFavoritesStore } from "@/stores/favorites-store";

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

export function ServiceCard({ service, className }: ServiceCardProps): React.JSX.Element {
  const price = parseFloat(service.price);
  const categoryLabel = CATEGORY_MAP[service.category] || service.category;
  const rating = service.averageRating ? parseFloat(service.averageRating) : 5.0;

  const displayName =
    service.user?.firstName && service.user?.lastName
      ? `${service.user.firstName} ${service.user.lastName}`
      : service.user?.username || service.user?.email?.split("@")[0] || "Freelancer";

  const handle = service.user?.username ? `@${service.user.username}` : null;

  const initials =
    service.user?.firstName && service.user?.lastName
      ? `${service.user.firstName.charAt(0)}${service.user.lastName.charAt(0)}`
      : displayName.slice(0, 2).toUpperCase();

  const location = service.user?.country || service.user?.location || "Panamá";

  const isFavorited = useFavoritesStore((s) => s.serviceIds.includes(service.id));
  const toggleService = useFavoritesStore((s) => s.toggleService);

  return (
    <div className="relative h-full">
      <FavoriteButton
        type="service"
        id={service.id}
        isFavorited={isFavorited}
        onToggle={() => toggleService(service)}
        className="absolute top-5 right-5 z-10"
      />
      <Link
        href={`/marketplace/services/${service.id}`}
        className={cn(
          "group flex flex-col h-full p-6 rounded-[28px] transition-all duration-300",
          "bg-white",
          "shadow-[6px_6px_14px_#d1d5db,-6px_-6px_14px_#ffffff]",
          "hover:shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]",
          "hover:-translate-y-1.5",
          className
        )}
      >
        {/* Header: Avatar with Status + Name, Handle & Verified Badge */}
        <div className="flex items-start gap-3.5 mb-4 pr-10">
          <div className="relative flex-shrink-0">
            <div className="p-1 rounded-2xl shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] bg-white">
              {service.user?.avatarUrl ? (
                <img
                  src={service.user.avatarUrl}
                  alt={displayName}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center">
                  <span className="text-primary font-bold text-base tracking-wider">
                    {initials}
                  </span>
                </div>
              )}
            </div>
            {service.status === "ACTIVE" && (
              <span
                className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"
                title="Online & Available"
              />
            )}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-text-primary text-base leading-snug group-hover:text-primary transition-colors truncate">
                {displayName}
              </h3>
              <div
                className="w-4 h-4 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0"
                title="Verified Freelancer"
              >
                <Icon path={ICON_PATHS.check} size="sm" className="w-2.5 h-2.5 text-primary" strokeWidth={3} />
              </div>
            </div>
            {handle && (
              <p className="text-xs text-text-secondary/70 truncate font-mono">
                {handle}
              </p>
            )}
            <p className="text-sm font-semibold text-text-secondary mt-0.5 truncate">
              {service.title}
            </p>
          </div>
        </div>

        {/* Professional Metrics Line: Rating + Location */}
        <div className="flex items-center gap-2.5 mb-3.5 text-xs">
          <div className="flex items-center gap-1 font-bold text-text-primary bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-lg shrink-0">
            <Icon path={ICON_PATHS.star} size="sm" className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <span className="text-text-secondary/30">•</span>
          <div className="flex items-center gap-1 text-text-secondary font-medium truncate">
            <Icon path={ICON_PATHS.mapPin} size="sm" className="w-3.5 h-3.5 text-text-secondary/60 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <span className="text-text-secondary/30 shrink-0">•</span>
          <span className="text-emerald-700 font-semibold text-xs shrink-0">
            Verified Pro
          </span>
        </div>

        {/* Category & Delivery Highlights */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          <span
            className={cn(
              "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xl",
              "bg-background text-text-secondary",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
            )}
          >
            {categoryLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-text-secondary bg-background/60 rounded-xl">
            <Icon path={ICON_PATHS.clock} size="sm" className="w-3.5 h-3.5 text-text-secondary/60" />
            {service.deliveryDays} days delivery
          </span>
        </div>

        {/* Service Scope Description */}
        <p className="text-sm text-text-secondary/85 leading-relaxed line-clamp-2 mb-5">
          {service.description}
        </p>

        {/* Footer: Rate / Price & View Service Button */}
        <div className="mt-auto pt-4 border-t border-border-light flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider leading-none mb-1">
              Starting at
            </span>
            <span className="text-2xl font-black text-text-primary tracking-tight leading-none">
              ${price.toLocaleString()}
            </span>
          </div>

          <div
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shrink-0",
              "bg-primary text-white",
              "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "group-hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
              "group-hover:bg-primary-hover",
              "active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]"
            )}
          >
            <span>View Service</span>
            <Icon path={ICON_PATHS.arrowRight} size="sm" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </div>
  );
}

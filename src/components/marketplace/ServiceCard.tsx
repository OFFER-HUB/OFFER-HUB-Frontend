"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { MarketplaceService } from "@/lib/api/marketplace";
import { HighlightedText } from "@/components/search/HighlightedText";
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

const CATEGORY_GRADIENTS: Record<string, string> = {
  WEB_DEVELOPMENT: "from-blue-400 to-indigo-600",
  MOBILE_DEVELOPMENT: "from-violet-400 to-purple-600",
  DESIGN: "from-pink-400 to-rose-600",
  WRITING: "from-amber-400 to-orange-500",
  MARKETING: "from-green-400 to-emerald-600",
  VIDEO: "from-red-400 to-rose-600",
  MUSIC: "from-cyan-400 to-teal-600",
  DATA: "from-sky-400 to-blue-600",
  OTHER: "from-gray-400 to-slate-600",
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

  const isFavorited = useFavoritesStore((s) => s.serviceIds.includes(service.id));
  const toggleService = useFavoritesStore((s) => s.toggleService);

  return (
    <div className="relative">
      <FavoriteButton
        type="service"
        id={service.id}
        isFavorited={isFavorited}
        onToggle={() => toggleService(service)}
        className="absolute top-3 right-3 z-10"
      />
      <Link
      href={`/marketplace/services/${service.id}`}
      className={cn(
        "group flex flex-col h-full rounded-3xl transition-all duration-300 overflow-hidden",
        "bg-background",
        "shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]",
        "hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
        "active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]",
        className
      )}
    >
      {/* Gradient Image Area */}
      <div className="relative w-full h-44 overflow-hidden flex-shrink-0">
        <div
          className={cn(
            "w-full h-full bg-gradient-to-br animate-shimmer flex items-center justify-center",
            CATEGORY_GRADIENTS[service.category] || CATEGORY_GRADIENTS.OTHER
          )}
        >
          <Icon
            path={ICON_PATHS.image}
            size="lg"
            className="text-white opacity-40"
          />
        </div>

        {/* Badges Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-black/45 text-white backdrop-blur-md shadow-sm">
            {category}
          </span>
          {service.totalOrders > 10 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-success/85 text-white backdrop-blur-md shadow-sm">
              <Icon path={ICON_PATHS.check} size="sm" className="text-white" strokeWidth={3} />
              Top Rated
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Freelancer Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative shrink-0">
            <div className={cn(
              "w-10 h-10 rounded-xl overflow-hidden transition-all duration-300",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              "group-hover:shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
            )}>
              {service.user?.avatarUrl ? (
                <img
                  src={service.user.avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] text-primary flex items-center justify-center font-bold text-base">
                  {initials.toUpperCase()}
                </div>
              )}
            </div>
            {service.status === "ACTIVE" && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border border-background shadow-sm" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-text-primary text-sm truncate group-hover:text-primary transition-colors">
                {displayName}
              </h3>
              <div className={cn(
                "flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center",
                "bg-success"
              )}>
                <Icon path={ICON_PATHS.check} size="sm" className="text-white" strokeWidth={3} />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Icon path={ICON_PATHS.mapPin} size="sm" className="text-text-secondary flex-shrink-0" />
              <span className="text-xs text-text-secondary truncate">{location}</span>
              {rating && (
                <span className="flex items-center gap-0.5 ml-auto text-xs font-semibold text-text-primary">
                  <Icon path={ICON_PATHS.star} size="sm" className="text-warning" />
                  {rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Service Title & Description */}
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

        {/* Footer (always at bottom) */}
        <div className="mt-auto">
          {/* Stats Section */}
          <div className="flex items-center justify-between mb-4 pt-3 border-t border-border-light">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center",
                "bg-background shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
              )}>
                <Icon path={ICON_PATHS.briefcase} size="sm" className="text-text-secondary" />
              </div>
              <span className="text-xs font-semibold text-text-primary">{service.totalOrders} orders</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center",
                "bg-background shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
              )}>
                <Icon path={ICON_PATHS.clock} size="sm" className="text-text-secondary" />
              </div>
              <span className="text-xs font-semibold text-text-primary">{service.deliveryDays} days</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-secondary">Starting at</span>
              <span className="text-xl font-bold text-primary">${price.toLocaleString()}</span>
            </div>
            <button
              className={cn(
                "flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200",
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
        </div>
      </div>
    </Link>
    </div>
  );
}

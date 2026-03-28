"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, ICON_CONTAINER } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { getPublicServices, type MarketplaceService } from "@/lib/api/marketplace";

function FreelancerSkeleton(): React.JSX.Element {
  return (
    <div className={cn(NEUMORPHIC_INSET, "p-4 rounded-xl animate-pulse")}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-6 bg-gray-200 rounded-lg w-20" />
    </div>
  );
}

function FreelancerCard({ service }: { service: MarketplaceService }): React.JSX.Element {
  const displayName =
    service.user.firstName && service.user.lastName
      ? `${service.user.firstName} ${service.user.lastName}`
      : service.user.username ?? service.user.email.split("@")[0];

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const rating = service.averageRating ? parseFloat(service.averageRating) : null;

  return (
    <Link
      href={`/marketplace/services/${service.id}`}
      className={cn(
        NEUMORPHIC_INSET,
        "p-4 rounded-xl block",
        "hover:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]",
        "transition-all duration-200"
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        {service.user.avatarUrl ? (
          <img
            src={service.user.avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm"
          />
        ) : (
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
              "bg-gradient-to-br from-primary/20 to-accent/20",
              "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
            )}
          >
            <span className="text-xs font-bold text-primary">{initials}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-sm text-text-primary truncate">{displayName}</p>
          <p className="text-xs text-text-secondary truncate">{service.title}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {rating !== null ? (
            <>
              <Icon path={ICON_PATHS.star} size="sm" className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-medium text-text-primary">{rating.toFixed(1)}</span>
              <span className="text-xs text-text-secondary">({service.totalOrders})</span>
            </>
          ) : (
            <span className="text-xs text-text-secondary">New</span>
          )}
        </div>
        <span className="text-xs font-semibold text-primary">
          From ${parseFloat(service.price).toFixed(0)}
        </span>
      </div>
    </Link>
  );
}

export function RecommendedFreelancers(): React.JSX.Element {
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPublicServices({ limit: 4 })
      .then((res) => setServices(res.data.slice(0, 4)))
      .catch(() => setServices([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && services.length === 0) return <></>;

  return (
    <div className={cn(NEUMORPHIC_CARD, "animate-fade-in-up")}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Recommended Freelancers</h2>
          <p className="text-sm text-text-secondary mt-1">Top-rated talent available for hire</p>
        </div>
        <Link
          href="/marketplace"
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-background text-sm font-semibold text-primary shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          Browse all
          <Icon
            path={ICON_PATHS.chevronRight}
            size="sm"
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <FreelancerSkeleton key={i} />)
          : services.map((service) => (
              <FreelancerCard key={service.id} service={service} />
            ))}
      </div>
    </div>
  );
}

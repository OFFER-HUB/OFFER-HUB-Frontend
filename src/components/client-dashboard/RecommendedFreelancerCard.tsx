import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  getInitials,
  getMarketplaceUserDisplayName,
  parseAverageRating,
} from "@/lib/marketplace-display";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import type { MarketplaceService } from "@/lib/api/marketplace";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

interface RecommendedFreelancerCardProps {
  service: MarketplaceService;
}

export function RecommendedFreelancerCard({
  service,
}: RecommendedFreelancerCardProps): React.JSX.Element {
  const displayName = getMarketplaceUserDisplayName(service.user);
  const initials = getInitials(displayName);
  const rating = parseAverageRating(service.averageRating);

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

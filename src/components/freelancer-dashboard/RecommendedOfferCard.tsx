import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatOfferDeadline } from "@/lib/marketplace-display";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import type { MarketplaceOffer } from "@/lib/api/marketplace";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

interface RecommendedOfferCardProps {
  offer: MarketplaceOffer;
}

export function RecommendedOfferCard({ offer }: RecommendedOfferCardProps): React.JSX.Element {
  const deadline = formatOfferDeadline(offer.deadline);

  return (
    <div
      className={cn(
        NEUMORPHIC_INSET,
        "p-4 rounded-xl",
        "hover:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]",
        "transition-all duration-200"
      )}
    >
      <p className="font-semibold text-sm text-text-primary truncate mb-1">{offer.title}</p>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-primary">
          Budget: ${parseFloat(offer.budget).toFixed(0)}
        </span>
        {offer.applicantsCount > 0 && (
          <span className="ml-auto min-w-[24px] h-5 px-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
            {offer.applicantsCount}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs text-text-secondary min-w-0">
          <Icon path={ICON_PATHS.briefcase} size="sm" className="flex-shrink-0" />
          <span className="truncate">{offer.category}</span>
          {deadline && (
            <>
              <span className="flex-shrink-0">·</span>
              <span className="flex-shrink-0">{deadline}</span>
            </>
          )}
        </div>

        <Link
          href={`/marketplace/offers/${offer.id}`}
          className="flex-shrink-0 text-xs font-semibold text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-lg transition-colors"
        >
          Apply
        </Link>
      </div>
    </div>
  );
}

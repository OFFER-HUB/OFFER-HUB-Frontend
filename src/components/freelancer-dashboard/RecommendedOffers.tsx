"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { getPublicOffers, type MarketplaceOffer } from "@/lib/api/marketplace";

function OfferSkeleton(): React.JSX.Element {
  return (
    <div className={cn(NEUMORPHIC_INSET, "p-4 rounded-xl animate-pulse")}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-2/5" />
        <div className="h-6 bg-gray-200 rounded-lg w-20" />
      </div>
    </div>
  );
}

function OfferCard({ offer }: { offer: MarketplaceOffer }): React.JSX.Element {
  const deadline = offer.deadline
    ? new Date(offer.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

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

export function RecommendedOffers(): React.JSX.Element {
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPublicOffers({ limit: 4 })
      .then((res) => setOffers(res.data.slice(0, 4)))
      .catch(() => setOffers([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && offers.length === 0) return <></>;

  return (
    <div className={cn(NEUMORPHIC_CARD, "animate-fade-in-up")}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Open Offers for You</h2>
          <p className="text-sm text-text-secondary mt-1">Find your next project</p>
        </div>
        <Link
          href="/marketplace/offers"
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
          ? Array.from({ length: 4 }).map((_, i) => <OfferSkeleton key={i} />)
          : offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
      </div>
    </div>
  );
}

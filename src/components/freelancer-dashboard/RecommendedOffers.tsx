"use client";

import Link from "next/link";
import { useRecommendedOffers } from "@/hooks/useRecommendedOffers";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { RecommendedOfferCard } from "./RecommendedOfferCard";
import { RecommendedOfferSkeleton } from "./RecommendedOfferSkeleton";

export function RecommendedOffers(): React.JSX.Element {
  const { offers, isLoading } = useRecommendedOffers();

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
          ? Array.from({ length: 4 }).map((_, i) => <RecommendedOfferSkeleton key={i} />)
          : offers.map((offer) => <RecommendedOfferCard key={offer.id} offer={offer} />)}
      </div>
    </div>
  );
}

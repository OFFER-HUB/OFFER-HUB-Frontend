"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { MarketplaceOffer } from "@/lib/api/marketplace";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { useFavoritesStore } from "@/stores/favorites-store";

interface OfferCardProps {
  offer: MarketplaceOffer;
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

export function OfferCard({ offer, className }: OfferCardProps): React.JSX.Element {
  const budget = parseFloat(offer.budget);
  const deadline = new Date(offer.deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const categoryLabel = CATEGORY_MAP[offer.category] || offer.category;
  const userName = offer.user?.email ? offer.user.email.split("@")[0] : "Client";
  const initials = userName.slice(0, 2).toUpperCase();

  const isFavorited = useFavoritesStore((s) => s.offerIds.includes(offer.id));
  const toggleOffer = useFavoritesStore((s) => s.toggleOffer);

  return (
    <div className="relative h-full">
      <FavoriteButton
        type="offer"
        id={offer.id}
        isFavorited={isFavorited}
        onToggle={() => toggleOffer(offer)}
        className="absolute top-6 right-6 z-10"
      />
      <Link
        href={`/marketplace/offers/${offer.id}`}
        className={cn(
          "group flex flex-col h-full p-7 rounded-[28px] transition-all duration-300",
          "bg-white",
          "shadow-[6px_6px_14px_#d1d5db,-6px_-6px_14px_#ffffff]",
          "hover:shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]",
          "hover:-translate-y-1.5",
          className
        )}
      >
        {/* Header: Client Avatar with Status + Name & Verified Badge */}
        <div className="flex items-start gap-4 mb-5 pr-12">
          <div className="relative flex-shrink-0">
            <div className="p-1 rounded-2xl shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] bg-white">
              <div className="w-14 h-14 rounded-xl bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center">
                <span className="text-primary font-bold text-lg tracking-wider">
                  {initials}
                </span>
              </div>
            </div>
            {offer.status === "ACTIVE" && (
              <span
                className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"
                title="Active Project"
              />
            )}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-text-primary text-lg leading-snug group-hover:text-primary transition-colors truncate">
                {userName}
              </h3>
              <div
                className="w-4 h-4 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0"
                title="Verified Client"
              >
                <Icon path={ICON_PATHS.check} size="sm" className="w-2.5 h-2.5 text-primary" strokeWidth={3} />
              </div>
            </div>
            <p className="text-xs text-text-secondary/70 truncate font-mono">
              Client • Verified Project
            </p>
            <p className="text-sm font-semibold text-text-secondary mt-0.5 truncate">
              {offer.title}
            </p>
          </div>
        </div>

        {/* Professional Metrics Line */}
        <div className="flex items-center gap-3 mb-4 text-xs">
          <div className="flex items-center gap-1 font-bold text-text-primary bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-lg">
            <Icon path={ICON_PATHS.star} size="sm" className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>5.0</span>
          </div>
          <span className="text-text-secondary/30">•</span>
          <div className="flex items-center gap-1 text-text-secondary font-medium truncate">
            <Icon path={ICON_PATHS.clock} size="sm" className="w-3.5 h-3.5 text-text-secondary/60 flex-shrink-0" />
            <span>Deadline: {deadline}</span>
          </div>
          <span className="text-text-secondary/30">•</span>
          <span className="text-emerald-700 font-semibold text-xs">
            Open Offer
          </span>
        </div>

        {/* Category & Applicants Highlights */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={cn(
              "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xl",
              "bg-background text-text-secondary",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
            )}
          >
            {categoryLabel}
          </span>
          {offer.applicantsCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-xl border border-primary/20">
              <Icon path={ICON_PATHS.users} size="sm" className="w-3.5 h-3.5" />
              {offer.applicantsCount} {offer.applicantsCount === 1 ? "applicant" : "applicants"}
            </span>
          )}
        </div>

        {/* Project Scope Description */}
        <p className="text-sm text-text-secondary/85 leading-relaxed line-clamp-2 mb-6">
          {offer.description}
        </p>

        {/* Footer: Budget & View Offer Button */}
        <div className="mt-auto pt-5 border-t border-border-light flex items-center justify-between gap-3">
          <div>
            <span className="text-2xl font-black text-text-primary tracking-tight">
              ${budget.toLocaleString()}
            </span>
            <span className="text-xs text-text-secondary font-medium ml-1">budget</span>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200",
              "bg-primary text-white",
              "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "group-hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
              "group-hover:bg-primary-hover",
              "active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]"
            )}
          >
            <span>View Offer</span>
            <Icon path={ICON_PATHS.arrowRight} size="sm" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </div>
  );
}

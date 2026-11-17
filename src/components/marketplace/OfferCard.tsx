"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { MarketplaceOffer } from "@/lib/api/marketplace";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { useFavoritesStore } from "@/stores/favorites-store";
import { getInitials, getMarketplaceUserDisplayName } from "@/lib/marketplace-display";

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

/** "Nov 22", or "Nov 22, 2027" when the deadline is not in the current year. */
function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export function OfferCard({ offer, className }: OfferCardProps): React.JSX.Element {
  const budget = parseFloat(offer.budget);
  const categoryLabel = CATEGORY_MAP[offer.category] || offer.category;
  const clientName = offer.user ? getMarketplaceUserDisplayName(offer.user) : "Client";
  const initials = getInitials(clientName);
  const avatarUrl = offer.user?.avatarUrl;

  const isFavorited = useFavoritesStore((s) => s.offerIds.includes(offer.id));
  const toggleOffer = useFavoritesStore((s) => s.toggleOffer);

  return (
    <div className="relative h-full">
      <FavoriteButton
        type="offer"
        id={offer.id}
        isFavorited={isFavorited}
        onToggle={() => toggleOffer(offer)}
        className="absolute top-5 right-5 z-10"
      />
      <Link
        href={`/marketplace/offers/${offer.id}`}
        className={cn(
          "group flex flex-col h-full p-6 rounded-[28px] transition-all duration-300",
          "bg-white",
          "shadow-[6px_6px_14px_#d1d5db,-6px_-6px_14px_#ffffff]",
          "hover:shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]",
          "hover:-translate-y-1.5",
          className
        )}
      >
        {/* Category and applicants: what kind of work, and how much interest */}
        <div className="flex flex-wrap items-center gap-2 mb-3 pr-12">
          <span
            className={cn(
              "px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-xl",
              "bg-background text-text-secondary",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
            )}
          >
            {categoryLabel}
          </span>
          {offer.applicantsCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-primary bg-primary/10 rounded-xl border border-primary/20">
              <Icon path={ICON_PATHS.users} size="sm" className="w-3.5 h-3.5" />
              {offer.applicantsCount} {offer.applicantsCount === 1 ? "applicant" : "applicants"}
            </span>
          )}
        </div>

        {/* What they ask for: the title leads, then a longer description */}
        <h3 className="text-xl font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {offer.title}
        </h3>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed line-clamp-3">
          {offer.description}
        </p>

        {/* Who is asking: photo and name, not the email */}
        <div className="mt-5 flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={clientName}
                className="w-11 h-11 rounded-full object-cover shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center">
                <span className="text-primary font-bold text-sm tracking-wider">{initials}</span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{clientName}</p>
            <p className="text-xs text-text-secondary">
              {offer.user?.professionalTitle || "Client"}
            </p>
          </div>
        </div>

        {/* Deadline and status */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1 text-text-secondary font-medium whitespace-nowrap">
            <Icon path={ICON_PATHS.clock} size="sm" className="w-3.5 h-3.5 text-text-secondary/60 flex-shrink-0" />
            Due {formatDeadline(offer.deadline)}
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Open
          </span>
        </div>

        {/* Footer: budget and action */}
        <div className="mt-auto pt-5">
          <div className="pt-4 border-t border-border-light flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold">Budget</p>
              <p className="text-2xl font-black text-text-primary tracking-tight whitespace-nowrap">
                ${budget.toLocaleString()}
              </p>
            </div>

            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200",
                "bg-primary text-white",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "group-hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                "group-hover:bg-primary-hover",
                "active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]"
              )}
            >
              <span>View offer</span>
              <Icon path={ICON_PATHS.arrowRight} size="sm" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

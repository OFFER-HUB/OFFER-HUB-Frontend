"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { MarketplaceOffer } from "@/lib/api/marketplace";
import { HighlightedText } from "@/components/search/HighlightedText";
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

export function OfferCard({ offer, className, highlightQuery }: OfferCardProps): React.JSX.Element {
  const budget = parseFloat(offer.budget);
  const deadline = new Date(offer.deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const category = CATEGORY_MAP[offer.category] || offer.category;
  const userName = offer.user?.email?.split("@")[0] || "Anonymous";

  // Only use absolute Cloudinary URLs — /uploads/... paths are broken (ephemeral Railway disk)
  const imageAttachment = offer.attachments?.find((att) =>
    att.mimeType.startsWith("image/")
  );
  const rawUrl = imageAttachment?.url ?? null;
  const imageUrl = rawUrl?.startsWith("https://") ? rawUrl : null;

  const isFavorited = useFavoritesStore((s) => s.offerIds.includes(offer.id));
  const toggleOffer = useFavoritesStore((s) => s.toggleOffer);

  return (
    <div className="relative">
      <FavoriteButton
        type="offer"
        id={offer.id}
        isFavorited={isFavorited}
        onToggle={() => toggleOffer(offer)}
        className="absolute top-3 right-3 z-10"
      />
      <Link
      href={`/marketplace/offers/${offer.id}`}
      className={cn(
        "flex flex-col h-full rounded-xl transition-all duration-200 overflow-hidden",
        "bg-background shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
        "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
        "hover:scale-[1.01]",
        className
      )}
    >
      {/* Image / Gradient Placeholder — always h-44 */}
      <div className="relative w-full h-44 overflow-hidden bg-gray-100 flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={offer.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "w-full h-full bg-gradient-to-br animate-shimmer flex items-center justify-center",
              CATEGORY_GRADIENTS[offer.category] || CATEGORY_GRADIENTS.OTHER
            )}
          >
            <Icon
              path={ICON_PATHS.image}
              size="lg"
              className="text-white opacity-40"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Client Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary truncate">{userName}</p>
            <p className="text-xs text-text-secondary truncate">{category}</p>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
          {highlightQuery ? (
            <HighlightedText text={offer.title} query={highlightQuery} />
          ) : (
            offer.title
          )}
        </h3>

        {/* Description */}
        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
          {highlightQuery ? (
            <HighlightedText text={offer.description} query={highlightQuery} />
          ) : (
            offer.description
          )}
        </p>

        {/* Footer — pinned to bottom */}
        <div className="mt-auto">
          <div className="flex items-center justify-between pt-4 border-t border-border-light">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-primary">
                <Icon path={ICON_PATHS.currency} size="sm" />
                <span className="font-semibold">${budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <Icon path={ICON_PATHS.clock} size="sm" />
                <span className="text-sm">{deadline}</span>
              </div>
            </div>
            {offer.attachments && offer.attachments.length > 0 && (
              <div className="flex items-center gap-1 text-text-secondary">
                <Icon path={ICON_PATHS.image} size="sm" />
                <span className="text-xs">{offer.attachments.length}</span>
              </div>
            )}
          </div>
          {offer.applicantsCount > 0 && (
            <div className="mt-3 flex items-center gap-1 text-xs text-text-secondary">
              <Icon path={ICON_PATHS.users} size="sm" />
              <span>{offer.applicantsCount} applicant{offer.applicantsCount !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
    </div>
  );
}

"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { MarketplaceOffer } from "@/lib/api/marketplace";

interface OfferCardProps {
  offer: MarketplaceOffer;
  className?: string;
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
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:4000";
  const budget = parseFloat(offer.budget);
  const deadline = new Date(offer.deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const category = CATEGORY_MAP[offer.category] || offer.category;
  // Extract display name from email
  const userName = offer.user?.email?.split("@")[0] || "Anonymous";

  // Find first image attachment
  const imageAttachment = offer.attachments?.find((att) =>
    att.mimeType.startsWith("image/")
  );
  const imageUrl = imageAttachment ? `${backendUrl}${imageAttachment.url}` : null;

  return (
    <Link
      href={`/marketplace/offers/${offer.id}`}
      className={cn(
        "block rounded-xl transition-all duration-200 overflow-hidden",
        "bg-background shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
        "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
        "hover:scale-[1.01]",
        className
      )}
    >
      {/* Image Preview */}
      {imageUrl && (
        <div className="w-full h-48 overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={offer.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Client Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary truncate">{userName}</p>
            <p className="text-xs text-text-secondary truncate">{category}</p>
          </div>
        </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
        {offer.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-text-secondary mb-4 line-clamp-3">{offer.description}</p>

      {/* Details */}
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

      {/* Applicants count */}
      {offer.applicantsCount > 0 && (
        <div className="mt-3 flex items-center gap-1 text-xs text-text-secondary">
          <Icon path={ICON_PATHS.users} size="sm" />
          <span>{offer.applicantsCount} applicant{offer.applicantsCount !== 1 ? "s" : ""}</span>
        </div>
      )}
      </div>
    </Link>
  );
}

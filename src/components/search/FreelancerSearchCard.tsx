"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { FreelancerSearchHit } from "@/lib/api/search";
import { HighlightedText } from "@/components/search/HighlightedText";

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

interface FreelancerSearchCardProps {
  hit: FreelancerSearchHit;
  query: string;
  listLayout?: boolean;
  className?: string;
}

export function FreelancerSearchCard({
  hit,
  query,
  listLayout,
  className,
}: FreelancerSearchCardProps): React.JSX.Element {
  const u = hit.user;
  const displayName =
    u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.username || u.email?.split("@")[0] || "Freelancer";
  const initials =
    u.firstName && u.lastName
      ? `${u.firstName.charAt(0)}${u.lastName.charAt(0)}`
      : displayName.charAt(0);
  const ratingLabel = hit.avgRating !== null ? hit.avgRating.toFixed(1) : "New";
  const cats = hit.categories.map((c) => CATEGORY_MAP[c] || c).join(" · ");

  return (
    <Link
      href={`/marketplace/freelancers/${hit.userId}`}
      className={cn(
        "group block rounded-3xl transition-all duration-300 bg-background",
        "shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]",
        "hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
        listLayout && "flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5",
        !listLayout && "p-6",
        className
      )}
    >
      <div className={cn("flex gap-4", listLayout && "sm:flex-1 sm:min-w-0 items-center")}>
        <div className="relative shrink-0">
          <div
            className={cn(
              "rounded-2xl overflow-hidden",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              listLayout ? "w-14 h-14" : "w-16 h-16"
            )}
          >
            {u.avatarUrl ? (
              <Image src={u.avatarUrl} alt="" width={64} height={64} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-background text-primary font-bold text-lg">
                {initials.toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-text-primary truncate group-hover:text-primary transition-colors">
              <HighlightedText text={displayName} query={query} />
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                "bg-background shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff] text-text-secondary"
              )}
            >
              <Icon path={ICON_PATHS.star} size="sm" className="text-amber-500" />
              {ratingLabel}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            <HighlightedText text={cats || "Freelancer"} query={query} />
          </p>
          <p className="text-xs text-text-secondary mt-2">
            {hit.serviceCount} active service{hit.serviceCount === 1 ? "" : "s"} · from ${hit.minPrice.toFixed(0)}
          </p>
        </div>
      </div>
    </Link>
  );
}

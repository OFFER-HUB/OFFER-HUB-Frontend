"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { Offer } from "@/lib/api/offers";

interface ApplicationsToReviewProps {
  offers: Offer[];
  isLoading: boolean;
}

function OfferRow({ offer }: { offer: Offer }): React.JSX.Element {
  const deadline = new Date(offer.deadline);
  const isUrgent = deadline < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return (
    <Link
      href={`/app/client/offers/${offer.id}`}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl",
        "transition-all duration-200",
        NEUMORPHIC_INSET,
        "hover:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          isUrgent ? "bg-warning/10" : "bg-primary/10"
        )}
      >
        <Icon
          path={ICON_PATHS.users}
          size="md"
          className={isUrgent ? "text-warning" : "text-primary"}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm text-text-primary truncate">{offer.title}</p>
          {isUrgent && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-warning/15 text-warning flex-shrink-0">
              URGENT
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary mt-0.5">
          Deadline: {deadline.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>

      {/* Badge + arrow */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={cn(
            "min-w-[28px] h-7 px-2 rounded-full flex items-center justify-center",
            "text-xs font-bold",
            isUrgent
              ? "bg-warning text-white"
              : "bg-primary text-white"
          )}
        >
          {offer.applicantsCount}
        </span>
        <Icon path={ICON_PATHS.chevronRight} size="sm" className="text-text-secondary" />
      </div>
    </Link>
  );
}

export function ApplicationsToReview({
  offers,
  isLoading,
}: ApplicationsToReviewProps): React.JSX.Element | null {
  const offersWithApplicants = offers.filter((o) => o.applicantsCount > 0);

  if (!isLoading && offersWithApplicants.length === 0) return null;

  const totalPending = offersWithApplicants.reduce((s, o) => s + o.applicantsCount, 0);

  return (
    <div
      className={cn(
        "p-6 rounded-2xl bg-white animate-fade-in-up",
        "border-l-4 border-primary",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon path={ICON_PATHS.alertCircle} size="md" className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary leading-tight">
              Applications to Review
            </h2>
            {!isLoading && (
              <p className="text-sm text-text-secondary">
                {totalPending} pending application{totalPending !== 1 ? "s" : ""} across{" "}
                {offersWithApplicants.length} offer{offersWithApplicants.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <Link
          href="/app/client/offers"
          className="text-sm font-semibold text-primary hover:underline transition-all"
        >
          View all
        </Link>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn("flex items-center gap-4 p-4 rounded-xl animate-pulse", NEUMORPHIC_INSET)}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="w-7 h-7 rounded-full bg-gray-200" />
              </div>
            ))
          : offersWithApplicants.slice(0, 5).map((offer) => (
              <OfferRow key={offer.id} offer={offer} />
            ))}
      </div>
    </div>
  );
}

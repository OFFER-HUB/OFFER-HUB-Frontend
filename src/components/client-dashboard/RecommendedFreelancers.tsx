"use client";

import Link from "next/link";
import { useRecommendedFreelancers } from "@/hooks/useRecommendedFreelancers";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { RecommendedFreelancerCard } from "./RecommendedFreelancerCard";
import { RecommendedFreelancerSkeleton } from "./RecommendedFreelancerSkeleton";

export function RecommendedFreelancers(): React.JSX.Element {
  const { services, isLoading } = useRecommendedFreelancers();

  if (!isLoading && services.length === 0) return <></>;

  return (
    <div className={cn(NEUMORPHIC_CARD, "animate-fade-in-up")}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Recommended Freelancers</h2>
          <p className="text-sm text-text-secondary mt-1">Top-rated talent available for hire</p>
        </div>
        <Link
          href="/marketplace/services"
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
          ? Array.from({ length: 4 }).map((_, i) => <RecommendedFreelancerSkeleton key={i} />)
          : services.map((service) => (
              <RecommendedFreelancerCard key={service.id} service={service} />
            ))}
      </div>
    </div>
  );
}

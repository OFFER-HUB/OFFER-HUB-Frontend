"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { NEUMORPHIC_INPUT } from "@/lib/styles";
import { cn } from "@/lib/cn";
import type { PublicReviewSort } from "@/types/public-freelancer.types";
import { buildFreelancerReviewsQuery } from "./reviews-url";

interface FreelancerReviewsControlsProps {
  freelancerId: string;
  currentSort: PublicReviewSort;
  currentStars?: number;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  /** Top row: sort only. Bottom row: pagination only. */
  placement?: "top" | "bottom";
}

export function FreelancerReviewsControls({
  freelancerId,
  currentSort,
  currentStars,
  page,
  pageSize,
  totalItems,
  totalPages,
  placement = "top",
}: FreelancerReviewsControlsProps): React.JSX.Element | null {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const base = `/marketplace/freelancers/${freelancerId}/reviews`;

  const pushQuery = (next: {
    sort?: PublicReviewSort;
    stars?: number;
    page?: number;
    pageSize?: number;
  }) => {
    const q = buildFreelancerReviewsQuery({
      sort: next.sort ?? currentSort,
      stars: next.stars !== undefined ? next.stars : currentStars,
      page: next.page ?? page,
      pageSize: next.pageSize ?? pageSize,
    });
    startTransition(() => {
      router.push(`${base}${q}`);
    });
  };

  const showSort = placement === "top";
  const showPagination = placement === "bottom" && totalPages > 0;

  if (placement === "bottom" && !showPagination) {
    return null;
  }

  return (
    <div className={cn("space-y-4", isPending && "opacity-70 pointer-events-none transition-opacity")}>
      {showSort ? (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="shrink-0">Sort by</span>
            <select
              value={currentSort}
              onChange={(e) => {
                const sort = e.target.value as PublicReviewSort;
                pushQuery({ sort, page: 1 });
              }}
              className={cn(NEUMORPHIC_INPUT, "py-2 text-sm font-medium min-w-[160px]")}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rating</option>
              <option value="lowest">Lowest rating</option>
            </select>
          </label>
        </div>
      ) : null}

      {showPagination ? (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={pageSize}
          onPageChange={(p) => pushQuery({ page: p })}
          onItemsPerPageChange={(n) => pushQuery({ page: 1, pageSize: n })}
        />
      ) : null}
    </div>
  );
}

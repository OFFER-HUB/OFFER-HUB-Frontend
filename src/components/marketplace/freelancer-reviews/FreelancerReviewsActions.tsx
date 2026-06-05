"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ReviewResponseForm } from "@/components/rating";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { submitReviewResponse } from "@/lib/api/reviews";
import { cn } from "@/lib/cn";
import { PRIMARY_BUTTON } from "@/lib/styles";
import { useAuthStore } from "@/stores/auth-store";
import type { PublicFreelancerReview } from "@/types/public-freelancer.types";

interface FreelancerReviewsActionsProps {
  review: PublicFreelancerReview;
  freelancerId: string;
}

export function FreelancerReviewsActions({
  review,
  freelancerId,
}: FreelancerReviewsActionsProps): React.JSX.Element | null {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  const canReply = Boolean(token && user?.id === freelancerId && !review.response);

  async function handleSubmitResponse(content: string): Promise<void> {
    if (!token) {
      throw new Error("You must be signed in to respond.");
    }

    await submitReviewResponse(token, review.id, review.id, content);
    router.refresh();
  }

  if (!canReply) {
    return null;
  }

  return (
    <div className="mt-4">
      {isReplyOpen ? (
        <ReviewResponseForm onSubmit={handleSubmitResponse} />
      ) : (
        <button
          type="button"
          onClick={() => setIsReplyOpen(true)}
          className={cn(PRIMARY_BUTTON, "justify-center")}
        >
          <Icon path={ICON_PATHS.chat} size="sm" />
          <span>Reply</span>
        </button>
      )}
    </div>
  );
}
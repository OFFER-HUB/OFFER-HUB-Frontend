import type { PublicFreelancerReview } from "@/types/public-freelancer.types";

import { ReviewCard } from "./ReviewCard";

interface ReviewListProps {
  reviews: PublicFreelancerReview[];
  freelancerDisplayName: string;
  freelancerId: string;
}

export function ReviewList({
  reviews,
  freelancerDisplayName,
  freelancerId,
}: ReviewListProps): React.JSX.Element {
  return (
    <ul className="m-0 list-none space-y-4 p-0" aria-label="Reviews">
      {reviews.map((review) => (
        <li key={review.id}>
          <ReviewCard
            review={review}
            freelancerDisplayName={freelancerDisplayName}
            freelancerId={freelancerId}
          />
        </li>
      ))}
    </ul>
  );
}
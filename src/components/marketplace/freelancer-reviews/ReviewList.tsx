import { ReviewCard } from "./ReviewCard";
import type { PublicFreelancerReview } from "@/types/public-freelancer.types";

interface ReviewListProps {
  reviews: PublicFreelancerReview[];
  freelancerDisplayName: string;
}

export function ReviewList({ reviews, freelancerDisplayName }: ReviewListProps): React.JSX.Element {
  return (
    <ul className="space-y-4 list-none p-0 m-0" aria-label="Reviews">
      {reviews.map((review) => (
        <li key={review.id}>
          <ReviewCard review={review} freelancerDisplayName={freelancerDisplayName} />
        </li>
      ))}
    </ul>
  );
}

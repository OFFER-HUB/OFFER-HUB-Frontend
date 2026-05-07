import { ReviewCard } from "./ReviewCard";
import type { PublicFreelancerReview } from "@/types/public-freelancer.types";

interface ReviewListProps {
  reviews: PublicFreelancerReview[];
  freelancerDisplayName: string;
  isOwnProfile?: boolean;
  onResponseSubmit?: (reviewId: string, content: string) => Promise<void>;
}

export function ReviewList({ 
  reviews, 
  freelancerDisplayName, 
  isOwnProfile = false, 
  onResponseSubmit 
}: ReviewListProps): React.JSX.Element {
  return (
    <ul className="space-y-4 list-none p-0 m-0" aria-label="Reviews">
      {reviews.map((review) => (
        <li key={review.id}>
          <ReviewCard 
            review={review} 
            freelancerDisplayName={freelancerDisplayName}
            isOwnProfile={isOwnProfile}
            onResponseSubmit={onResponseSubmit}
          />
        </li>
      ))}
    </ul>
  );
}

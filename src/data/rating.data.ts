import type { FreelancerRating } from "@/types/rating.types";

const ratingsById = new Map<string, FreelancerRating>([
  [
    "5",
    {
      id: "rating-1",
      offerId: "5",
      freelancerId: "a5",
      freelancerName: "Alex Writer",
      clientId: "client-1",
      rating: 5,
      comment:
        "Excellent work! Alex delivered high-quality content on time and was very responsive to feedback. Highly recommend!",
      createdAt: "2026-01-05T14:30:00Z",
    },
  ],
]);

export function getRatingByOfferId(offerId: string): FreelancerRating | undefined {
  return ratingsById.get(offerId);
}

export function addRating(rating: FreelancerRating): void {
  ratingsById.set(rating.offerId, rating);
}

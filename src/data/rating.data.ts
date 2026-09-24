import type { FreelancerRating, ClientRating } from "@/types/rating.types";

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

// Client ratings (freelancers rating their clients)
const clientRatingsById = new Map<string, ClientRating>([
  [
    "ord-3",
    {
      id: "client-rating-1",
      orderId: "ord-3",
      clientId: "client-emily",
      clientName: "Emily Rodriguez",
      serviceId: "1",
      serviceTitle: "Professional React & Next.js Web Development",
      rating: 5,
      comment:
        "Emily was a fantastic client! Clear requirements, quick responses, and prompt payment. Would love to work with her again.",
      createdAt: "2024-11-25T10:00:00Z",
    },
  ],
]);

export function getClientRatingByOrderId(orderId: string): ClientRating | undefined {
  return clientRatingsById.get(orderId);
}

export function hasClientRating(orderId: string): boolean {
  return clientRatingsById.has(orderId);
}

export function addClientRating(rating: ClientRating): void {
  clientRatingsById.set(rating.orderId, rating);
}

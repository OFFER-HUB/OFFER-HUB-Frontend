export interface FreelancerRating {
  id: string;
  offerId: string;
  freelancerId: string;
  freelancerName: string;
  clientId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RatingFormData {
  rating: number;
  comment: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

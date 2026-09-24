export interface ReviewResponse {
  content: string;
  createdAt: string;
}

export interface OrderReview {
  id: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  orderTitle: string;
  serviceTitle?: string;
  response?: ReviewResponse | null;
}

export interface SubmitReviewPayload {
  orderId: string;
  rating: number;
  comment: string;
  revieweeId: string;
  revieweeName: string;
  orderTitle: string;
  serviceTitle?: string;
}

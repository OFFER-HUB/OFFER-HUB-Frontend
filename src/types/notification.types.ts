export type NotificationType =
  | "order_created"
  | "order_completed"
  | "order_cancelled"
  | "offer_received"
  | "offer_accepted"
  | "offer_rejected"
  | "message_received"
  | "payment_received"
  | "dispute_opened"
  | "dispute_resolved"
  | "review_received"
  | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  href?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface MarkReadPayload {
  notificationIds: string[];
}
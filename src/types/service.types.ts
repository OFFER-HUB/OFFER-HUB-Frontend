export type ServiceStatus = "active" | "paused" | "archived";

export type ServiceCategory =
  | "web-development"
  | "mobile-development"
  | "design"
  | "writing"
  | "marketing"
  | "video"
  | "music"
  | "data"
  | "other";

export interface ServiceFormData {
  title: string;
  description: string;
  category: ServiceCategory | "";
  price: number;
  deliveryDays: number;
}

export interface ServiceFormErrors {
  title?: string;
  description?: string;
  category?: string;
  price?: string;
  deliveryDays?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  price: number;
  deliveryDays: number;
  status: ServiceStatus;
  createdAt: string;
  orders: number;
  rating: number;
}

export type OrderStatus = "pending" | "in_progress" | "delivered" | "completed" | "cancelled";

export interface ServiceOrder {
  id: string;
  serviceId: string;
  clientName: string;
  clientAvatar: string;
  status: OrderStatus;
  price: number;
  orderedAt: string;
  deliveryDate: string;
  hasDispute: boolean;
}

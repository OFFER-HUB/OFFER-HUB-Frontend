// Backend uses UPPERCASE enums
export type ServiceStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export type ServiceCategory =
  | "WEB_DEVELOPMENT"
  | "MOBILE_DEVELOPMENT"
  | "DESIGN"
  | "WRITING"
  | "MARKETING"
  | "VIDEO"
  | "MUSIC"
  | "DATA"
  | "OTHER";

export interface ServiceFormData {
  title: string;
  description: string;
  category: ServiceCategory | "";
  price: number; // Form uses number, convert to string when sending to API
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
  userId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  price: string; // Decimal string from backend
  deliveryDays: number;
  status: ServiceStatus;
  totalOrders: number;
  averageRating: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = "pending" | "in_progress" | "delivered" | "completed" | "cancelled";

export interface ServiceOrder {
  id: string;
  serviceId: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  status: OrderStatus;
  price: number;
  orderedAt: string;
  deliveryDate: string;
  hasDispute: boolean;
}

import type { Service, ServiceCategory, ServiceOrder, OrderStatus } from "@/types/service.types";

export const MIN_TITLE_LENGTH = 10;
export const MIN_DESCRIPTION_LENGTH = 50;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MIN_PRICE = 5;
export const MIN_DELIVERY_DAYS = 1;
export const MAX_DELIVERY_DAYS = 90;

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: "WEB_DEVELOPMENT", label: "Web Development" },
  { value: "MOBILE_DEVELOPMENT", label: "Mobile Development" },
  { value: "DESIGN", label: "Design & Creative" },
  { value: "WRITING", label: "Writing & Translation" },
  { value: "MARKETING", label: "Marketing & Sales" },
  { value: "VIDEO", label: "Video & Animation" },
  { value: "MUSIC", label: "Music & Audio" },
  { value: "DATA", label: "Data & Analytics" },
  { value: "OTHER", label: "Other" },
];

export const MOCK_SERVICES: Service[] = [
  {
    id: "1",
    userId: "user-1",
    title: "Professional React & Next.js Web Development",
    description:
      "I will build modern, responsive web applications using React and Next.js with TypeScript. Includes SEO optimization, performance tuning, and clean code architecture.",
    category: "WEB_DEVELOPMENT",
    price: "150.00",
    deliveryDays: 7,
    status: "ACTIVE",
    totalOrders: 24,
    averageRating: "4.9",
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    userId: "user-1",
    title: "Custom Logo Design with Unlimited Revisions",
    description:
      "Get a unique, professional logo design for your brand. Package includes multiple concepts, unlimited revisions, and all source files in various formats.",
    category: "DESIGN",
    price: "75.00",
    deliveryDays: 3,
    status: "ACTIVE",
    totalOrders: 56,
    averageRating: "4.8",
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-02-20T00:00:00.000Z",
  },
  {
    id: "3",
    userId: "user-1",
    title: "SEO-Optimized Blog Articles & Content Writing",
    description:
      "Professional content writing services for blogs, websites, and marketing materials. Well-researched, engaging content optimized for search engines.",
    category: "WRITING",
    price: "50.00",
    deliveryDays: 2,
    status: "ACTIVE",
    totalOrders: 89,
    averageRating: "5.0",
    createdAt: "2024-03-10T00:00:00.000Z",
    updatedAt: "2024-03-10T00:00:00.000Z",
  },
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-warning/20 text-warning",
  in_progress: "bg-primary/20 text-primary",
  delivered: "bg-accent/20 text-accent",
  completed: "bg-success/20 text-success",
  cancelled: "bg-error/20 text-error",
};

export const MOCK_SERVICE_ORDERS: ServiceOrder[] = [
  {
    id: "ord-1",
    serviceId: "1",
    clientId: "client-sarah",
    clientName: "Sarah Johnson",
    clientAvatar: "SJ",
    status: "in_progress",
    price: 150,
    orderedAt: "2024-12-01",
    deliveryDate: "2024-12-08",
    hasDispute: false,
  },
  {
    id: "ord-2",
    serviceId: "1",
    clientId: "client-michael",
    clientName: "Michael Chen",
    clientAvatar: "MC",
    status: "pending",
    price: 150,
    orderedAt: "2024-12-10",
    deliveryDate: "2024-12-17",
    hasDispute: false,
  },
  {
    id: "ord-3",
    serviceId: "1",
    clientId: "client-emily",
    clientName: "Emily Rodriguez",
    clientAvatar: "ER",
    status: "completed",
    price: 150,
    orderedAt: "2024-11-15",
    deliveryDate: "2024-11-22",
    hasDispute: false,
  },
  {
    id: "ord-4",
    serviceId: "1",
    clientId: "client-david",
    clientName: "David Kim",
    clientAvatar: "DK",
    status: "delivered",
    price: 150,
    orderedAt: "2024-11-28",
    deliveryDate: "2024-12-05",
    hasDispute: true,
  },
  {
    id: "ord-5",
    serviceId: "2",
    clientId: "client-lisa",
    clientName: "Lisa Thompson",
    clientAvatar: "LT",
    status: "in_progress",
    price: 75,
    orderedAt: "2024-12-08",
    deliveryDate: "2024-12-11",
    hasDispute: false,
  },
];

export function getServiceById(id: string): Service | undefined {
  return MOCK_SERVICES.find((s) => s.id === id);
}

export function getOrdersByServiceId(serviceId: string): ServiceOrder[] {
  return MOCK_SERVICE_ORDERS.filter((o) => o.serviceId === serviceId);
}

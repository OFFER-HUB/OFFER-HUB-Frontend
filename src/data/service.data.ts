import type { Service, ServiceCategory, ServiceOrder, OrderStatus } from "@/types/service.types";

export const MIN_TITLE_LENGTH = 10;
export const MIN_DESCRIPTION_LENGTH = 50;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MIN_PRICE = 5;
export const MIN_DELIVERY_DAYS = 1;
export const MAX_DELIVERY_DAYS = 90;

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: "web-development", label: "Web Development" },
  { value: "mobile-development", label: "Mobile Development" },
  { value: "design", label: "Design & Creative" },
  { value: "writing", label: "Writing & Translation" },
  { value: "marketing", label: "Marketing & Sales" },
  { value: "video", label: "Video & Animation" },
  { value: "music", label: "Music & Audio" },
  { value: "data", label: "Data & Analytics" },
  { value: "other", label: "Other" },
];

export const MOCK_SERVICES: Service[] = [
  {
    id: "1",
    title: "Professional React & Next.js Web Development",
    description:
      "I will build modern, responsive web applications using React and Next.js with TypeScript. Includes SEO optimization, performance tuning, and clean code architecture.",
    category: "web-development",
    price: 150,
    deliveryDays: 7,
    status: "active",
    createdAt: "2024-01-15",
    orders: 24,
    rating: 4.9,
  },
  {
    id: "2",
    title: "Custom Logo Design with Unlimited Revisions",
    description:
      "Get a unique, professional logo design for your brand. Package includes multiple concepts, unlimited revisions, and all source files in various formats.",
    category: "design",
    price: 75,
    deliveryDays: 3,
    status: "active",
    createdAt: "2024-02-20",
    orders: 56,
    rating: 4.8,
  },
  {
    id: "3",
    title: "SEO-Optimized Blog Articles & Content Writing",
    description:
      "Professional content writing services for blogs, websites, and marketing materials. Well-researched, engaging content optimized for search engines.",
    category: "writing",
    price: 50,
    deliveryDays: 2,
    status: "active",
    createdAt: "2024-03-10",
    orders: 89,
    rating: 5.0,
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

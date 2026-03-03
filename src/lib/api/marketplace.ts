const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// =====================
// Types
// =====================

export interface MarketplaceOffer {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  deadline: string;
  status: string;
  createdAt: string;
  userId: string;
  applicantsCount: number;
  user: {
    id: string;
    email: string;
  };
  attachments: Array<{
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
  }>;
}

export interface MarketplaceService {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  price: string;
  deliveryDays: number;
  status: string;
  totalOrders: number;
  averageRating: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}

// =====================
// Offers - Public Marketplace
// =====================

export async function getPublicOffers(params?: {
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  search?: string;
  limit?: number;
  cursor?: string;
}): Promise<PaginatedResponse<MarketplaceOffer>> {
  const query = new URLSearchParams();

  if (params?.category) query.append("category", params.category);
  if (params?.minBudget) query.append("min_budget", params.minBudget.toFixed(2));
  if (params?.maxBudget) query.append("max_budget", params.maxBudget.toFixed(2));
  if (params?.search) query.append("search", params.search);
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.cursor) query.append("cursor", params.cursor);

  const response = await fetch(`${API_URL}/offers/marketplace/offers?${query.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch offers");
  }

  const json = await response.json();
  return json.data; // Unwrap the ResponseInterceptor wrapper
}

export async function getPublicOfferById(offerId: string): Promise<MarketplaceOffer> {
  const response = await fetch(`${API_URL}/offers/marketplace/offers/${offerId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch offer");
  }

  const json = await response.json();
  return json.data; // Unwrap the ResponseInterceptor wrapper
}

// =====================
// Services - Public Marketplace
// =====================

export async function getPublicServices(params?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  cursor?: string;
}): Promise<PaginatedResponse<MarketplaceService>> {
  const query = new URLSearchParams();

  if (params?.category) query.append("category", params.category);
  if (params?.minPrice) query.append("min_price", params.minPrice.toFixed(2));
  if (params?.maxPrice) query.append("max_price", params.maxPrice.toFixed(2));
  if (params?.search) query.append("search", params.search);
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.cursor) query.append("cursor", params.cursor);

  const response = await fetch(`${API_URL}/services/marketplace/services?${query.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch services");
  }

  const json = await response.json();
  return json.data; // Unwrap the ResponseInterceptor wrapper
}

export async function getPublicServiceById(serviceId: string): Promise<MarketplaceService> {
  const response = await fetch(`${API_URL}/services/marketplace/services/${serviceId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch service");
  }

  const json = await response.json();
  return json.data; // Unwrap the ResponseInterceptor wrapper
}

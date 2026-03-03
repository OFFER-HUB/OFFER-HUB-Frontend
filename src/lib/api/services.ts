const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Backend types (match API response structure)
export type ServiceStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type ServiceCategory =
  | 'WEB_DEVELOPMENT'
  | 'MOBILE_DEVELOPMENT'
  | 'DESIGN'
  | 'WRITING'
  | 'MARKETING'
  | 'VIDEO'
  | 'MUSIC'
  | 'DATA'
  | 'OTHER';

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

export interface CreateServicePayload {
  title: string;
  description: string;
  category: ServiceCategory;
  price: string; // Must be decimal string with 2 decimals
  deliveryDays: number;
}

export interface UpdateServicePayload {
  title?: string;
  description?: string;
  category?: ServiceCategory;
  price?: string;
  deliveryDays?: number;
}

export interface UpdateServiceStatusPayload {
  status: ServiceStatus;
}

/**
 * Create a new service
 */
export async function createService(
  token: string,
  payload: CreateServicePayload
): Promise<Service> {
  const response = await fetch(`${API_BASE_URL}/services`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create service');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get all services for the current user
 */
export async function getMyServices(token: string): Promise<Service[]> {
  const response = await fetch(`${API_BASE_URL}/services`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch services');
  }

  const responseData = await response.json();

  // Backend uses ResponseInterceptor which wraps all responses with { data: T, meta: {...} }
  return responseData.data;
}

/**
 * Get a single service by ID
 */
export async function getServiceById(
  token: string,
  serviceId: string
): Promise<Service> {
  const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch service');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Update a service
 */
export async function updateService(
  token: string,
  serviceId: string,
  payload: UpdateServicePayload
): Promise<Service> {
  const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update service');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Update service status
 */
export async function updateServiceStatus(
  token: string,
  serviceId: string,
  payload: UpdateServiceStatusPayload
): Promise<Service> {
  const response = await fetch(`${API_BASE_URL}/services/${serviceId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update service status');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Delete a service
 */
export async function deleteService(
  token: string,
  serviceId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete service');
  }
}

/**
 * Get orders for a service
 */
export async function getServiceOrders(
  token: string,
  serviceId: string
): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/services/${serviceId}/orders`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch service orders');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Hire a service (create order)
 */
export async function hireService(
  token: string,
  serviceId: string,
  requirements?: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/services/${serviceId}/hire`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requirements }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to hire service');
  }

  const data = await response.json();
  return data.data;
}

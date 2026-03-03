import type { Order, CreateOrderPayload, Milestone } from '@/types/order.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function createOrder(token: string, payload: CreateOrderPayload): Promise<Order> {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create order');
  }

  const data = await response.json();
  return data.data || data;
}

export async function listOrders(token: string, userId: string, filters?: {
  role?: 'buyer' | 'seller';
  status?: string;
}): Promise<Order[]> {
  const query = new URLSearchParams();

  // Convert role filter to buyer_id or seller_id query param
  if (filters?.role === 'buyer') {
    query.append('buyer_id', userId);
  } else if (filters?.role === 'seller') {
    query.append('seller_id', userId);
  }

  if (filters?.status) query.append('status', filters.status);

  const response = await fetch(`${API_URL}/orders?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch orders');
  }

  const responseData = await response.json();
  // Backend wraps response: { data: { data: Order[], hasMore, nextCursor }, meta: {...} }
  const paginatedResult = responseData.data;
  return paginatedResult?.data || [];
}

export async function getOrderById(token: string, orderId: string): Promise<Order> {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch order');
  }

  const data = await response.json();
  return data.data || data;
}

export async function reserveFunds(token: string, orderId: string): Promise<Order> {
  const response = await fetch(`${API_URL}/orders/${orderId}/reserve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to reserve funds');
  }

  const data = await response.json();
  return data.data || data;
}

export async function cancelOrder(token: string, orderId: string): Promise<Order> {
  const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to cancel order');
  }

  const data = await response.json();
  return data.data || data;
}

export async function createEscrow(token: string, orderId: string): Promise<Order> {
  const response = await fetch(`${API_URL}/orders/${orderId}/escrow`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create escrow');
  }

  const data = await response.json();
  return data.data || data;
}

export async function fundEscrow(token: string, orderId: string): Promise<Order> {
  const response = await fetch(`${API_URL}/orders/${orderId}/escrow/fund`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fund escrow');
  }

  const data = await response.json();
  return data.data || data;
}

export async function getMilestones(token: string, orderId: string): Promise<Milestone[]> {
  const response = await fetch(`${API_URL}/orders/${orderId}/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch milestones');
  }

  const data = await response.json();
  return data.data || data;
}

export async function completeMilestone(token: string, milestoneId: string): Promise<Milestone> {
  const response = await fetch(`${API_URL}/milestones/${milestoneId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to complete milestone');
  }

  const data = await response.json();
  return data.data || data;
}

// =====================
// Resolution Actions
// =====================

export async function releaseFunds(token: string, orderId: string, reason?: string): Promise<Order> {
  const response = await fetch(`${API_URL}/orders/${orderId}/resolution/release`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to release funds');
  }

  const data = await response.json();
  return data.data || data;
}

export async function requestRefund(token: string, orderId: string, reason: string): Promise<Order> {
  const response = await fetch(`${API_URL}/orders/${orderId}/resolution/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to request refund');
  }

  const data = await response.json();
  return data.data || data;
}

export interface OpenDisputePayload {
  orderId: string;
  openedBy: 'BUYER' | 'SELLER';
  reason: 'NOT_DELIVERED' | 'QUALITY_ISSUE' | 'OTHER';
  evidence?: string[];
}

export async function openDispute(token: string, payload: OpenDisputePayload): Promise<any> {
  const response = await fetch(`${API_URL}/orders/${payload.orderId}/resolution/dispute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to open dispute');
  }

  const data = await response.json();
  return data.data || data;
}

export async function markOrderCompleted(token: string, orderId: string): Promise<Order> {
  const response = await fetch(`${API_URL}/orders/${orderId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to mark order as completed');
  }

  const data = await response.json();
  return data.data || data;
}

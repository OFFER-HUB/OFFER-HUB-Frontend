const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ClientStats {
  activeOrders: number;
  activeOffers: number;
  servicesPurchased: number;
  budgetSpent: string;
}

export interface ClientActivity {
  id: string;
  type: 'order_created' | 'order_completed' | 'topup_completed';
  title: string;
  description: string;
  createdAt: string;
  time: string;
}

export async function getClientStats(token: string): Promise<ClientStats> {
  const response = await fetch(`${API_BASE_URL}/client/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch client stats');
  }

  const data = await response.json();
  return data.data;
}

export async function getClientActivities(token: string): Promise<ClientActivity[]> {
  const response = await fetch(`${API_BASE_URL}/client/activities`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch client activities');
  }

  const data = await response.json();
  return data.data;
}

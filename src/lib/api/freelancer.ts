const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface FreelancerStats {
  activeServices: number;
  totalEarnings: string;
  stellarBalance: string;
  balanceSynced: boolean;
  pendingProposals: number;
  unreadMessages: number;
}

export interface FreelancerActivity {
  id: string;
  type: 'order_created' | 'order_completed' | 'payment_received' | 'withdrawal_completed' | 'topup_completed';
  title: string;
  description: string;
  createdAt: string;
  time: string;
}

export async function getFreelancerStats(token: string): Promise<FreelancerStats> {
  const response = await fetch(`${API_BASE_URL}/freelancer/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch freelancer stats');
  }

  const data = await response.json();
  return data.data;
}

export async function getFreelancerActivities(token: string): Promise<FreelancerActivity[]> {
  const response = await fetch(`${API_BASE_URL}/freelancer/activities`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch freelancer activities');
  }

  const data = await response.json();
  return data.data;
}

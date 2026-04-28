import { API_URL } from "@/config/api";
import type { DashboardStats } from "@/types/freelancer-dashboard.types";

const API_BASE_URL = API_URL;

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
  type:
    | "order_created"
    | "order_completed"
    | "payment_received"
    | "withdrawal_completed"
    | "topup_completed"
    | "review_received"
    | "service_updated"
    | "proposal_accepted"
    | "proposal_sent"
    | "message"
    | "service_created";
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

export async function getDashboardStats(token: string): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/freelancer/dashboard/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
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

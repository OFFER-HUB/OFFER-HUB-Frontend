import type { Dispute } from "@/types/dispute.types";
import { API_URL } from "@/config/api";

export interface DisputesResponse {
  data: Dispute[];
  hasMore: boolean;
}

export async function listDisputes(
  token: string | null,
  filters?: { status?: string; page?: number; limit?: number }
): Promise<DisputesResponse> {
  const query = new URLSearchParams();
  if (filters?.status) query.append("status", filters.status);
  if (filters?.page) query.append("page", String(filters.page));
  if (filters?.limit) query.append("limit", String(filters.limit));

  const queryString = query.toString();
  const response = await fetch(
    `${API_URL}/disputes${queryString ? `?${queryString}` : ""}`,
    {
      headers: { Authorization: `Bearer ${token ?? ""}` },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch disputes");
  }

  const responseData = await response.json();
  const paginatedResult = responseData.data;
  return {
    data: paginatedResult?.data || [],
    hasMore: paginatedResult?.hasMore ?? false,
  };
}

export async function getDisputeById(
  token: string | null,
  disputeId: string
): Promise<Dispute> {
  const response = await fetch(`${API_URL}/disputes/${disputeId}`, {
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch dispute");
  }

  const data = await response.json();
  return data.data || data;
}

export async function cancelDispute(
  token: string | null,
  disputeId: string
): Promise<Dispute> {
  const response = await fetch(`${API_URL}/disputes/${disputeId}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to cancel dispute");
  }

  const data = await response.json();
  return data.data || data;
}

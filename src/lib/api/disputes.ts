import type { Dispute } from "@/types/dispute.types";
import { API_URL } from "@/config/api";
import { MOCK_DISPUTES, getDisputeById as getMockById } from "@/data/dispute.data";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export interface DisputesResponse {
  data: Dispute[];
  hasMore: boolean;
}

export async function listDisputes(
  token: string | null,
  filters?: { status?: string; page?: number; limit?: number }
): Promise<DisputesResponse> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const filtered = filters?.status
      ? MOCK_DISPUTES.filter((d) => d.status === filters.status)
      : MOCK_DISPUTES;
    const limit = filters?.limit ?? 10;
    const page = filters?.page ?? 1;
    const start = (page - 1) * limit;
    const pageData = filtered.slice(start, start + limit);
    return { data: pageData, hasMore: start + limit < filtered.length };
  }

  const query = new URLSearchParams();
  if (filters?.status) query.append("status", filters.status);
  if (filters?.page) query.append("page", String(filters.page));
  if (filters?.limit) query.append("limit", String(filters.limit));

  const response = await fetch(`${API_URL}/disputes?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });

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
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const found = getMockById(disputeId);
    if (!found) throw new Error("Dispute not found");
    return found;
  }

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
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const found = getMockById(disputeId);
    if (!found) throw new Error("Dispute not found");
    return { ...found, status: "closed" };
  }

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

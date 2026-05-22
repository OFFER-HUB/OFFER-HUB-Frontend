import type { Dispute } from "@/types/dispute.types";
import { API_URL } from "@/config/api";
import {
  mapApiDisputeToDispute,
  mapApiDisputesToDisputes,
  toApiDisputeStatus,
  unwrapApiResponse,
  type ApiDispute,
} from "@/lib/disputes/map-dispute";

export interface DisputesResponse {
  data: Dispute[];
  hasMore: boolean;
}

interface DisputesListPayload {
  data?: ApiDispute[];
  hasMore?: boolean;
}

export async function listDisputes(
  token: string | null,
  filters?: { status?: string; page?: number; limit?: number },
  currentUserId?: string
): Promise<DisputesResponse> {
  const query = new URLSearchParams();
  const apiStatus = toApiDisputeStatus(filters?.status);
  if (apiStatus) query.append("status", apiStatus);
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

  const json = await response.json();
  const payload = unwrapApiResponse<DisputesListPayload | ApiDispute[]>(json);
  const rawList = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  return {
    data: mapApiDisputesToDisputes(rawList, currentUserId),
    hasMore: Array.isArray(payload) ? false : (payload?.hasMore ?? false),
  };
}

export async function getDisputeById(
  token: string | null,
  disputeId: string,
  currentUserId?: string
): Promise<Dispute> {
  const response = await fetch(`${API_URL}/disputes/${disputeId}`, {
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch dispute");
  }

  const json = await response.json();
  const apiDispute = unwrapApiResponse<ApiDispute>(json);
  return mapApiDisputeToDispute(apiDispute, currentUserId);
}

export async function cancelDispute(
  token: string | null,
  disputeId: string,
  currentUserId?: string
): Promise<Dispute> {
  const response = await fetch(`${API_URL}/disputes/${disputeId}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to cancel dispute");
  }

  const json = await response.json();
  const apiDispute = unwrapApiResponse<ApiDispute>(json);
  return mapApiDisputeToDispute(apiDispute, currentUserId);
}

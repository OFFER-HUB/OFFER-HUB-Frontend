import { API_URL } from "@/config/api";
import { unwrapApiResponse } from "@/lib/disputes/map-dispute";
import type {
  AdminDispute,
  ResolveDisputePayload,
  AddDisputeNotePayload,
  UpdateDisputeStatusPayload,
} from "@/types/admin.types";

const API_BASE_URL = API_URL;

type ApiErrorResponse = {
  message?: string;
  title?: string;
  error?: { message?: string };
};

type DisputesListPayload = {
  data?: AdminDispute[];
};

async function parseApiError(response: Response, fallback: string): Promise<Error> {
  const json = (await response.json().catch(() => null)) as ApiErrorResponse | null;
  return new Error(json?.error?.message ?? json?.message ?? json?.title ?? fallback);
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function unwrapDisputesList(json: unknown): AdminDispute[] {
  const payload = unwrapApiResponse<DisputesListPayload | AdminDispute[]>(json);
  if (Array.isArray(payload)) {
    return payload;
  }
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function getAdminDisputes(token: string): Promise<AdminDispute[]> {
  const response = await fetch(`${API_BASE_URL}/disputes`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch disputes");
  }

  const json = await response.json();
  return unwrapDisputesList(json);
}

export async function getAdminDisputeById(
  token: string,
  disputeId: string
): Promise<AdminDispute> {
  const response = await fetch(`${API_BASE_URL}/disputes/${disputeId}`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch dispute");
  }

  const json = await response.json();
  return unwrapApiResponse<AdminDispute>(json);
}

export async function updateDisputeStatus(
  token: string,
  disputeId: string,
  payload: UpdateDisputeStatusPayload
): Promise<AdminDispute> {
  const response = await fetch(`${API_BASE_URL}/admin/disputes/${disputeId}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to update dispute status");
  }

  const data = await response.json();
  return data.data as AdminDispute;
}

export async function resolveDispute(
  token: string,
  disputeId: string,
  payload: ResolveDisputePayload
): Promise<AdminDispute> {
  const response = await fetch(`${API_BASE_URL}/admin/disputes/${disputeId}/resolve`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to resolve dispute");
  }

  const data = await response.json();
  return data.data as AdminDispute;
}

export async function addInternalNote(
  token: string,
  disputeId: string,
  payload: AddDisputeNotePayload
): Promise<AdminDispute> {
  const response = await fetch(`${API_BASE_URL}/admin/disputes/${disputeId}/notes`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to add note");
  }

  const data = await response.json();
  return data.data as AdminDispute;
}

export async function addAdminComment(
  token: string,
  disputeId: string,
  content: string
): Promise<AdminDispute> {
  const response = await fetch(`${API_BASE_URL}/admin/disputes/${disputeId}/comments`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to add comment");
  }

  const data = await response.json();
  return data.data as AdminDispute;
}

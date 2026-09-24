import { API_URL } from "@/config/api";
import type {
  AdminDispute,
  AdminDisputesPage,
  AdminDisputesQuery,
  ResolveDisputePayload,
} from "@/types/admin.types";

const API_BASE_URL = API_URL;

type ApiErrorResponse = {
  message?: string;
  title?: string;
  error?: { message?: string };
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

/**
 * The disputes controller returns `{ data, hasMore }` and the global
 * ResponseInterceptor wraps that once more, so the wire shape is
 * `{ data: { data: AdminDispute[], hasMore } }`.
 */
export function unwrapDisputesPage(json: unknown): AdminDisputesPage {
  const outer = (json as { data?: unknown })?.data;
  const inner = outer as { data?: unknown; hasMore?: unknown } | undefined;
  const disputes = Array.isArray(inner?.data) ? (inner!.data as AdminDispute[]) : Array.isArray(outer) ? (outer as AdminDispute[]) : [];
  return { disputes, hasMore: inner?.hasMore === true };
}

/** Single-resource responses are wrapped once: `{ data: AdminDispute }`. */
function unwrapDispute(json: unknown): AdminDispute {
  return (json as { data: AdminDispute }).data;
}

export function buildAdminDisputesSearchParams(query: AdminDisputesQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.status !== "ALL") params.set("status", query.status);
  if (query.openedBy !== "ALL") params.set("openedBy", query.openedBy);
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  return params;
}

export async function getAdminDisputes(token: string, query: AdminDisputesQuery): Promise<AdminDisputesPage> {
  const response = await fetch(`${API_BASE_URL}/disputes?${buildAdminDisputesSearchParams(query).toString()}`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch disputes");
  }

  return unwrapDisputesPage(await response.json());
}

export async function getAdminDispute(token: string, disputeId: string): Promise<AdminDispute> {
  const response = await fetch(`${API_BASE_URL}/disputes/${disputeId}`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch dispute");
  }

  return unwrapDispute(await response.json());
}

/** OPEN → UNDER_REVIEW. `assignedTo` is the reviewing admin's user id. */
export async function assignDispute(token: string, disputeId: string, assignedTo: string): Promise<AdminDispute> {
  const response = await fetch(`${API_BASE_URL}/disputes/${disputeId}/assign`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ assignedTo }),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to assign dispute");
  }

  return unwrapDispute(await response.json());
}

/** UNDER_REVIEW → RESOLVED, executing the escrow release / refund / split. */
export async function resolveDispute(
  token: string,
  disputeId: string,
  payload: ResolveDisputePayload
): Promise<AdminDispute> {
  const response = await fetch(`${API_BASE_URL}/disputes/${disputeId}/resolve`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to resolve dispute");
  }

  return unwrapDispute(await response.json());
}

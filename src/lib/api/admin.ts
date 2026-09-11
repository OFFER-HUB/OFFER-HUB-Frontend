import { API_URL } from "@/config/api";
import type {
  AdminUser,
  AdminUserDetail,
  AdminUsersPage,
  AdminUsersQuery,
  UpdateAdminUserPayload,
  BanUserPayload,
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
 * Translate the UI query into the params `AdminUsersQueryDto` validates.
 * "ALL" and empty strings mean "no filter" and are simply not sent.
 */
export function buildAdminUsersSearchParams(query: AdminUsersQuery): URLSearchParams {
  const params = new URLSearchParams();
  const search = query.search.trim();
  if (search) params.set("search", search);
  if (query.status !== "ALL") params.set("status", query.status);
  if (query.role !== "ALL") params.set("role", query.role);
  if (query.registeredAfter) params.set("registeredFrom", query.registeredAfter);
  if (query.registeredBefore) params.set("registeredTo", query.registeredBefore);
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  params.set("sortBy", query.sort.field);
  params.set("sortOrder", query.sort.direction);
  return params;
}

export async function getAdminUsers(token: string, query: AdminUsersQuery): Promise<AdminUsersPage> {
  const response = await fetch(
    `${API_BASE_URL}/admin/users?${buildAdminUsersSearchParams(query).toString()}`,
    { headers: authHeaders(token) }
  );

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch users");
  }

  const json = (await response.json()) as { data: AdminUser[]; meta: AdminUsersPage["meta"] };
  return { users: json.data, meta: json.meta };
}

export async function getAdminUserDetail(token: string, userId: string): Promise<AdminUserDetail> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch user");
  }

  const json = (await response.json()) as { data: AdminUserDetail };
  return json.data;
}

export async function updateAdminUser(
  token: string,
  userId: string,
  payload: UpdateAdminUserPayload
): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to update user");
  }

  const json = (await response.json()) as { data: AdminUser };
  return json.data;
}

export async function banUser(
  token: string,
  userId: string,
  payload: BanUserPayload
): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/ban`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to ban user");
  }

  const json = (await response.json()) as { data: AdminUser };
  return json.data;
}

export async function unbanUser(token: string, userId: string): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/unban`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to unban user");
  }

  const json = (await response.json()) as { data: AdminUser };
  return json.data;
}

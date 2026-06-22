import { API_URL } from "@/config/api";
import type {
  AdminUser,
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

export async function getAdminUsers(token: string): Promise<AdminUser[]> {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch users");
  }

  const data = await response.json();
  return data.data as AdminUser[];
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

  const data = await response.json();
  return data.data as AdminUser;
}

export async function banUser(
  token: string,
  userId: string,
  payload: BanUserPayload
): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/ban`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to ban user");
  }

  const data = await response.json();
  return data.data as AdminUser;
}

export async function unbanUser(
  token: string,
  userId: string
): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/unban`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to unban user");
  }

  const data = await response.json();
  return data.data as AdminUser;
}

export async function deleteUser(
  token: string,
  userId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to delete user");
  }
}

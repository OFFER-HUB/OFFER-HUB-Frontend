import { API_URL } from "@/config/api";
import type {
  AdminUser,
  UpdateAdminUserPayload,
  BanUserPayload,
  UserActivityRecord,
  UserActivityType,
} from "@/types/admin.types";
import { MOCK_ADMIN_USERS } from "@/data/admin-users.data";

const API_BASE_URL = API_URL;

/**
 * Set to false when real admin API endpoints are available on the backend.
 * When true, all functions resolve against the local mock dataset.
 */
const USE_MOCK = true;

// ─── In-memory mock store (mutated optimistically in mock mode) ───────────────
const mockStore: AdminUser[] = structuredClone(MOCK_ADMIN_USERS);

export async function getAdminUsers(_token: string): Promise<AdminUser[]> {
  if (USE_MOCK) {
    await simulateDelay(600);
    return structuredClone(mockStore);
  }

  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${_token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to fetch users");
  }

  const data = await response.json();
  return data.data as AdminUser[];
}

export async function updateAdminUser(
  token: string,
  userId: string,
  payload: UpdateAdminUserPayload
): Promise<AdminUser> {
  if (USE_MOCK) {
    await simulateDelay(400);
    const idx = mockStore.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("User not found");

    const prev = mockStore[idx];
    const activityRecords: UserActivityRecord[] = [];

    if (payload.type !== undefined && payload.type !== prev.type) {
      activityRecords.push(
        createActivityRecord("ROLE_CHANGED", `Role changed from ${prev.type} to ${payload.type}`)
      );
    }
    if (payload.status !== undefined && payload.status !== prev.status) {
      activityRecords.push(
        createActivityRecord("STATUS_CHANGED", `Status changed from ${prev.status} to ${payload.status}`)
      );
    }
    if (
      (payload.username !== undefined && payload.username !== prev.username) ||
      (payload.email !== undefined && payload.email !== prev.email)
    ) {
      activityRecords.push(createActivityRecord("PROFILE_UPDATED", "Profile details updated"));
    }

    mockStore[idx] = {
      ...prev,
      ...payload,
      activityHistory: [...prev.activityHistory, ...activityRecords],
    };
    return structuredClone(mockStore[idx]);
  }

  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to update user");
  }

  const data = await response.json();
  return data.data as AdminUser;
}

export async function banUser(
  token: string,
  userId: string,
  payload: BanUserPayload
): Promise<AdminUser> {
  if (USE_MOCK) {
    await simulateDelay(400);
    const idx = mockStore.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("User not found");

    const banRecord = {
      id: `ban-${Date.now()}`,
      adminId: "usr-016",
      adminUsername: "admin_root",
      action: "BAN" as const,
      reason: payload.reason,
      createdAt: new Date().toISOString(),
    };

    mockStore[idx] = {
      ...mockStore[idx],
      status: "BANNED",
      banHistory: [...mockStore[idx].banHistory, banRecord],
      activityHistory: [
        ...mockStore[idx].activityHistory,
        createActivityRecord("BAN", `Account banned: ${payload.reason}`),
      ],
    };

    return structuredClone(mockStore[idx]);
  }

  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/ban`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to ban user");
  }

  const data = await response.json();
  return data.data as AdminUser;
}

export async function unbanUser(
  token: string,
  userId: string
): Promise<AdminUser> {
  if (USE_MOCK) {
    await simulateDelay(400);
    const idx = mockStore.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("User not found");

    const unbanRecord = {
      id: `ban-${Date.now()}`,
      adminId: "usr-016",
      adminUsername: "admin_root",
      action: "UNBAN" as const,
      reason: "Ban lifted by administrator.",
      createdAt: new Date().toISOString(),
    };

    mockStore[idx] = {
      ...mockStore[idx],
      status: "ACTIVE",
      banHistory: [...mockStore[idx].banHistory, unbanRecord],
      activityHistory: [
        ...mockStore[idx].activityHistory,
        createActivityRecord("UNBAN", "Ban lifted by administrator"),
      ],
    };

    return structuredClone(mockStore[idx]);
  }

  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/unban`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to unban user");
  }

  const data = await response.json();
  return data.data as AdminUser;
}

export async function deleteUser(
  token: string,
  userId: string
): Promise<void> {
  if (USE_MOCK) {
    await simulateDelay(400);
    const idx = mockStore.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("User not found");
    mockStore.splice(idx, 1);
    return;
  }

  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to delete user");
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createActivityRecord(
  type: UserActivityType,
  description: string,
  performedBy: string = "admin_root"
): UserActivityRecord {
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    description,
    performedBy,
    createdAt: new Date().toISOString(),
  };
}

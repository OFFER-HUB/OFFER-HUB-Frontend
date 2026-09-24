import { API_URL } from "@/config/api";

export interface Session {
  id: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  os: string;
  browser: string;
  ip: string;
  location: string;
  lastActivity: string;
  isCurrent: boolean;
}

export async function fetchSessions(token: string): Promise<Session[]> {
  const response = await fetch(`${API_URL}/users/me/sessions`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch sessions");
  }

  const data = await response.json();
  return data.data || data;
}

export async function revokeSession(token: string, sessionId: string): Promise<void> {
  const response = await fetch(`${API_URL}/users/me/sessions/${sessionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to revoke session");
  }
}

export async function revokeOtherSessions(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/users/me/sessions/others`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to revoke other sessions");
  }
}
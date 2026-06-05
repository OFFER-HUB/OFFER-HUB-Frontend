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

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_SESSIONS === "true";

// Mock Data
const MOCK_SESSIONS: Session[] = [
  {
    id: "session-1",
    deviceType: "desktop",
    os: "Windows 11",
    browser: "Chrome",
    ip: "192.168.1.100",
    location: "New York, USA",
    lastActivity: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: "session-2",
    deviceType: "mobile",
    os: "iOS 16",
    browser: "Safari",
    ip: "10.0.0.5",
    location: "New York, USA",
    lastActivity: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    isCurrent: false,
  },
  {
    id: "session-3",
    deviceType: "tablet",
    os: "Android 13",
    browser: "Chrome",
    ip: "192.168.1.101",
    location: "Boston, USA",
    lastActivity: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    isCurrent: false,
  },
];

export async function fetchSessions(token: string): Promise<Session[]> {
  if (USE_MOCK) {
    return [...MOCK_SESSIONS];
  }

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
  if (USE_MOCK) {
    return;
  }

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
  if (USE_MOCK) {
    return;
  }

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

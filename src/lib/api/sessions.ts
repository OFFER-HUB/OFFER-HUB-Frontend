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

interface ApiSession {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  lastActivity: string;
  isCurrent?: boolean;
}

// The API stores deviceInfo as "<Device> · <Browser> · <OS>" (see SessionService.parseDeviceInfo).
function toSession(raw: ApiSession): Session {
  const [device = "", browser = "Unknown browser", os = ""] = (raw.deviceInfo ?? "").split(" · ");
  const deviceType = device.toLowerCase();
  return {
    id: raw.id,
    deviceType:
      deviceType === "desktop" || deviceType === "mobile" || deviceType === "tablet"
        ? deviceType
        : "unknown",
    os: os || "Unknown OS",
    browser,
    ip: raw.ipAddress ?? "Unknown IP",
    location: "",
    lastActivity: raw.lastActivity,
    isCurrent: raw.isCurrent === true,
  };
}

export async function fetchSessions(token: string): Promise<Session[]> {
  const response = await fetch(`${API_URL}/auth/sessions`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch sessions");
  }

  const body = (await response.json()) as { data: ApiSession[] };
  return body.data.map(toSession);
}

export async function revokeSession(token: string, sessionId: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/sessions/${sessionId}`, {
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
  const response = await fetch(`${API_URL}/auth/sessions`, {
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
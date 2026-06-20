import { API_URL } from "@/config/api";

export interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  bio: string | null;
  professionalTitle: string | null;
  location: string | null;
  timezone: string | null;
  phone: string | null;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  username?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  avatarUrl?: string;
  bio?: string;
  professionalTitle?: string;
  location?: string;
  timezone?: string;
  phone?: string;
}

/**
 * Get the profile of the authenticated user
 */
export async function getProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Update the profile of the authenticated user
 */
export async function updateProfile(
  token: string,
  profileData: UpdateProfileData
): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to update profile");
  }

  const data = await response.json();
  return data.data;
}

export interface ProfileCompletenessData {
  percentage: number;
  missingFields: Array<{
    field: string;
    label: string;
    href: string;
  }>;
  isComplete: boolean;
}

interface ProfileCompletenessApiResponse {
  percentage: number;
  completed?: string[];
  missing: string[];
  suggestions?: string[];
}

const PROFILE_COMPLETENESS_FIELD_MAP: Record<string, { label: string; href: string }> = {
  avatar: { label: "Profile Photo", href: "/app/profile" },
  firstName: { label: "First Name", href: "/app/profile" },
  lastName: { label: "Last Name", href: "/app/profile" },
  username: { label: "Username", href: "/app/profile" },
  bio: { label: "Bio", href: "/app/profile" },
  contact: { label: "Phone Number", href: "/app/profile" },
  title: { label: "Professional Title", href: "/app/profile" },
  location: { label: "Location", href: "/app/profile" },
};

function toCompletenessPercentage(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, value));
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return Math.min(100, Math.max(0, parsed));
    }
  }
  return 0;
}

function formatMissingFieldLabel(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function mapMissingField(field: string): ProfileCompletenessData["missingFields"][number] {
  const config = PROFILE_COMPLETENESS_FIELD_MAP[field];

  return {
    field,
    label: config?.label ?? formatMissingFieldLabel(field),
    href: config?.href ?? "/app/profile",
  };
}

function normalizeProfileCompleteness(payload: unknown): ProfileCompletenessData {
  const raw = (payload && typeof payload === "object" ? payload : {}) as Partial<
    ProfileCompletenessApiResponse
  >;
  const percentage = toCompletenessPercentage(raw.percentage);
  const missing = Array.isArray(raw.missing) ? raw.missing.filter((field) => typeof field === "string") : [];

  return {
    percentage,
    missingFields: missing.map(mapMissingField),
    isComplete: percentage >= 100,
  };
}

/**
 * Get the profile completeness status for the authenticated user
 */
export async function getProfileCompleteness(token: string): Promise<ProfileCompletenessData> {
  const response = await fetch(`${API_URL}/users/me/completeness`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile completeness");
  }

  const data = await response.json();
  return normalizeProfileCompleteness(data.data);
}

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
  return data.data;
}

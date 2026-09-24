import { API_URL } from "@/config/api";

export interface FreelancerAvailability {
  availableForWork: boolean;
  vacationMode: boolean;
  hoursPerWeek: number;
  timezone: string;
  preferredWeekdays: number[];
  availableFromDate: string | null;
  updatedAt?: string;
}

export type UpdateAvailabilityPayload = Partial<
  Omit<FreelancerAvailability, "updatedAt">
>;

function getDefaultTimezone(): string {
  if (typeof Intl === "undefined") return "UTC";
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export const DEFAULT_FREELANCER_AVAILABILITY: FreelancerAvailability = {
  availableForWork: true,
  vacationMode: false,
  hoursPerWeek: 40,
  timezone: getDefaultTimezone(),
  preferredWeekdays: [],
  availableFromDate: null,
};

export function listIanaTimezones(): string[] {
  try {
    if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
      return Intl.supportedValuesOf("timeZone");
    }
  } catch {
    /* ignore */
  }
  return ["UTC"];
}

export async function getFreelancerAvailability(
  token: string
): Promise<FreelancerAvailability> {
  const response = await fetch(`${API_URL}/freelancer/availability`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    return { ...DEFAULT_FREELANCER_AVAILABILITY, timezone: getDefaultTimezone() };
  }

  if (!response.ok) {
    throw new Error("Failed to fetch availability");
  }

  const data = await response.json();
  return data.data as FreelancerAvailability;
}

export async function updateFreelancerAvailability(
  token: string,
  payload: UpdateAvailabilityPayload
): Promise<FreelancerAvailability> {
  const response = await fetch(`${API_URL}/freelancer/availability`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const message =
      errBody.error?.message ||
      errBody.message ||
      "Failed to update availability";
    throw new Error(message);
  }

  const data = await response.json();
  return data.data as FreelancerAvailability;
}

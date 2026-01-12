export type AvailabilityStatus = "available" | "busy" | "unavailable";

export interface FreelancerProfileData {
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  availability: AvailabilityStatus;
  location: string;
  website: string;
  profileImage: string | null;
}

export interface FreelancerProfileErrors {
  firstName?: string;
  lastName?: string;
  title?: string;
  bio?: string;
  skills?: string;
  hourlyRate?: string;
}

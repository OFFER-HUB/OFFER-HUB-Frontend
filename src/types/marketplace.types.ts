/**
 * Marketplace types for offers and freelancers
 */

export interface Freelancer {
  id: string;
  name: string;
  avatar: string;
  title: string;
  rating: number;
  location: string;
  skills: string[];
  hourlyRate: number;
  isAvailable: boolean;
}

export interface Offer {
  id: string;
  company: {
    name: string;
    logo: string;
  };
  title: string;
  rating: number;
  location: string;
  postedAt: string;
  applicants: number;
  isBookmarked: boolean;
}

export interface JobListing {
  id: string;
  company: {
    name: string;
    logo: string;
  };
  title: string;
  postedAt: string;
  type: "Full Time" | "Part Time" | "Contract" | "Freelance";
  duration: string;
  applicants: number;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  rating: number;
  location: string;
  tags: string[];
  isUrgent: boolean;
  isBookmarked: boolean;
}

export interface FilterState {
  salary: {
    min: number;
    max: number;
  };
  availability: string[];
  rating: number;
  experience: string[];
}

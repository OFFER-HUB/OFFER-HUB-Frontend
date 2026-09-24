import type { FreelancerProfileData, AvailabilityStatus } from "@/types/freelancer-profile.types";

export const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: "available", label: "Available", color: "bg-success" },
  { value: "busy", label: "Busy", color: "bg-warning" },
  { value: "unavailable", label: "Unavailable", color: "bg-error" },
];

export const SUGGESTED_SKILLS: string[] = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "UI/UX Design",
  "Figma",
  "GraphQL",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Docker",
  "Solidity",
  "Web3",
];

export const INITIAL_FREELANCER_PROFILE: FreelancerProfileData = {
  firstName: "",
  lastName: "",
  title: "",
  bio: "",
  skills: [],
  hourlyRate: 50,
  availability: "available",
  location: "",
  website: "",
  profileImage: null,
};

export const MOCK_FREELANCER_PROFILE: FreelancerProfileData = {
  firstName: "John",
  lastName: "Doe",
  title: "Full Stack Developer",
  bio: "Experienced developer with 5+ years building web applications. Specialized in React, Node.js, and blockchain technologies.",
  skills: ["JavaScript", "TypeScript", "React", "Node.js", "Solidity"],
  hourlyRate: 75,
  availability: "available",
  location: "San Francisco, CA",
  website: "https://johndoe.dev",
  profileImage: null,
};

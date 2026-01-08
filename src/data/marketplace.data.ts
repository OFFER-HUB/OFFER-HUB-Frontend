import type { Offer, JobListing, Freelancer } from "@/types/marketplace.types";

/**
 * Mock data for popular offers displayed at the top of marketplace
 */
export const popularOffers: Offer[] = [
  {
    id: "offer-1",
    company: {
      name: "Google.co",
      logo: "/mock-images/man1.png",
    },
    title: "Product UI Design",
    rating: 4.5,
    location: "San Francisco",
    postedAt: "4 days ago",
    applicants: 12,
    isBookmarked: true,
  },
  {
    id: "offer-2",
    company: {
      name: "Spotify",
      logo: "/mock-images/woman1.png",
    },
    title: "Product UI Design",
    rating: 4.5,
    location: "New York",
    postedAt: "1 days ago",
    applicants: 45,
    isBookmarked: false,
  },
  {
    id: "offer-3",
    company: {
      name: "AirBNB",
      logo: "/mock-images/man2.png",
    },
    title: "House keeping",
    rating: 4.5,
    location: "Miami",
    postedAt: "3 days ago",
    applicants: 64,
    isBookmarked: false,
  },
  {
    id: "offer-4",
    company: {
      name: "Meta",
      logo: "/mock-images/woman2.png",
    },
    title: "EXP Laner",
    rating: 4.5,
    location: "Austin",
    postedAt: "6 days ago",
    applicants: 34,
    isBookmarked: false,
  },
];

/**
 * Mock data for job listings
 */
export const jobListings: JobListing[] = [
  {
    id: "job-1",
    company: {
      name: "PT. Beruang Motors",
      logo: "/mock-images/man3.png",
    },
    title: "Senior UI Designer",
    postedAt: "1 days ago",
    type: "Full Time",
    duration: "3 - 12 month",
    applicants: 45,
    salary: {
      min: 1000,
      max: 4000,
      currency: "$",
    },
    description:
      "Looking for an experienced UI designer for an ongoing project. It is hoped that you will be able to work with the existing team to work on the project that we are currently developing at our company.",
    rating: 5,
    location: "Bandung, Indonesia",
    tags: ["User Interface Design", "Figma", "Designer", "Working"],
    isUrgent: true,
    isBookmarked: false,
  },
  {
    id: "job-2",
    company: {
      name: "Fox sin no ban",
      logo: "/mock-images/woman3.png",
    },
    title: "Full Stack Developer",
    postedAt: "1 days ago",
    type: "Full Time",
    duration: "3 - 12 month",
    applicants: 45,
    salary: {
      min: 1000,
      max: 4000,
      currency: "$",
    },
    description:
      "By providing services to atone for the sins of all people, we need your help to make us a full website for the sale of our products. We will pay you more with pre-approval.",
    rating: 4,
    location: "Sukabumi, Indonesia",
    tags: ["React", "Node.js", "TypeScript", "Full Stack"],
    isUrgent: false,
    isBookmarked: false,
  },
];

/**
 * Mock data for freelancers grid
 */
export const freelancers: Freelancer[] = [
  {
    id: "freelancer-1",
    name: "Sarah Johnson",
    avatar: "/mock-images/woman1.png",
    title: "UI/UX Designer",
    rating: 4.9,
    location: "San Francisco, USA",
    skills: ["Figma", "UI Design", "Prototyping"],
    hourlyRate: 85,
    isAvailable: true,
  },
  {
    id: "freelancer-2",
    name: "Michael Chen",
    avatar: "/mock-images/man1.png",
    title: "Full Stack Developer",
    rating: 4.8,
    location: "Toronto, Canada",
    skills: ["React", "Node.js", "TypeScript"],
    hourlyRate: 95,
    isAvailable: true,
  },
  {
    id: "freelancer-3",
    name: "Emily Davis",
    avatar: "/mock-images/woman2.png",
    title: "Product Designer",
    rating: 4.7,
    location: "London, UK",
    skills: ["Product Design", "User Research", "Figma"],
    hourlyRate: 75,
    isAvailable: false,
  },
  {
    id: "freelancer-4",
    name: "James Wilson",
    avatar: "/mock-images/man2.png",
    title: "Mobile Developer",
    rating: 4.9,
    location: "Berlin, Germany",
    skills: ["React Native", "iOS", "Android"],
    hourlyRate: 90,
    isAvailable: true,
  },
  {
    id: "freelancer-5",
    name: "Sofia Martinez",
    avatar: "/mock-images/woman3.png",
    title: "Data Analyst",
    rating: 4.6,
    location: "Madrid, Spain",
    skills: ["Python", "SQL", "Tableau"],
    hourlyRate: 70,
    isAvailable: true,
  },
  {
    id: "freelancer-6",
    name: "David Kim",
    avatar: "/mock-images/man3.png",
    title: "DevOps Engineer",
    rating: 4.8,
    location: "Seoul, South Korea",
    skills: ["AWS", "Docker", "Kubernetes"],
    hourlyRate: 100,
    isAvailable: true,
  },
];

/**
 * Filter options for the sidebar
 */
export const experienceOptions = [
  "Graphic Designer",
  "UI Designer",
  "UX Designer",
  "Developer",
  "UX Writer",
  "Data Analyst",
  "User Testing",
];

export const availabilityOptions = ["Urgent", "Remote", "Full-Time"];

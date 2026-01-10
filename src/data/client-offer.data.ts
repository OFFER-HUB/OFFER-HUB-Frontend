import type { ClientOffer, ClientOfferDetail } from "@/types/client-offer.types";

export const MOCK_CLIENT_OFFERS: ClientOffer[] = [
  {
    id: "1",
    title: "Build a responsive e-commerce website",
    category: "Web Development",
    budget: 2500,
    deadline: "2026-02-15",
    status: "active",
    applicants: 8,
    createdAt: "2026-01-05",
  },
  {
    id: "2",
    title: "Mobile app UI/UX design",
    category: "Design & Creative",
    budget: 1200,
    deadline: "2026-01-25",
    status: "active",
    applicants: 12,
    createdAt: "2026-01-03",
  },
  {
    id: "3",
    title: "Logo design for tech startup",
    category: "Design & Creative",
    budget: 500,
    deadline: "2026-01-20",
    status: "pending",
    applicants: 5,
    createdAt: "2026-01-07",
  },
  {
    id: "4",
    title: "Backend API development",
    category: "Web Development",
    budget: 3000,
    deadline: "2026-01-10",
    status: "closed",
    applicants: 15,
    createdAt: "2025-12-20",
  },
  {
    id: "5",
    title: "Content writing for blog",
    category: "Writing & Translation",
    budget: 300,
    deadline: "2026-01-30",
    status: "active",
    applicants: 3,
    createdAt: "2026-01-08",
  },
];

export const MOCK_CLIENT_OFFER_DETAILS: Record<string, ClientOfferDetail> = {
  "1": {
    id: "1",
    title: "Build a responsive e-commerce website",
    description:
      "We need a professional e-commerce website built using React and Next.js. The website should include product listings, shopping cart, checkout flow, user authentication, and an admin panel for managing products and orders. Must be mobile-responsive and optimized for SEO.",
    category: "Web Development",
    budget: 2500,
    deadline: "2026-02-15",
    status: "active",
    createdAt: "2026-01-05",
    applicants: [
      {
        id: "a1",
        name: "John Developer",
        avatar: "JD",
        title: "Senior Full-Stack Developer",
        rating: 4.9,
        hourlyRate: 75,
        proposalDate: "2026-01-06",
        coverLetter:
          "I have 8+ years of experience building e-commerce platforms. I've worked with React, Next.js, and various payment integrations.",
      },
      {
        id: "a2",
        name: "Sarah Designer",
        avatar: "SD",
        title: "UI/UX Developer",
        rating: 4.8,
        hourlyRate: 65,
        proposalDate: "2026-01-07",
        coverLetter:
          "I specialize in creating beautiful, user-friendly e-commerce experiences. I can deliver a modern design with excellent UX.",
      },
      {
        id: "a3",
        name: "Mike Tech",
        avatar: "MT",
        title: "React Specialist",
        rating: 4.7,
        hourlyRate: 55,
        proposalDate: "2026-01-08",
        coverLetter:
          "I've built 20+ e-commerce sites using React and Next.js. Fast delivery and clean code guaranteed.",
      },
    ],
  },
  "2": {
    id: "2",
    title: "Mobile app UI/UX design",
    description:
      "Looking for a talented designer to create UI/UX for our mobile fitness app. Need wireframes, high-fidelity mockups, and a design system. The app will have features like workout tracking, meal planning, and progress charts.",
    category: "Design & Creative",
    budget: 1200,
    deadline: "2026-01-25",
    status: "active",
    createdAt: "2026-01-03",
    applicants: [
      {
        id: "a4",
        name: "Emma Creative",
        avatar: "EC",
        title: "Product Designer",
        rating: 5.0,
        hourlyRate: 80,
        proposalDate: "2026-01-04",
        coverLetter:
          "I've designed 15+ fitness apps and understand the space deeply. I'll create an engaging experience for your users.",
      },
    ],
  },
};

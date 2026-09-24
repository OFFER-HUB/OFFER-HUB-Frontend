import type {
  ClientOffer,
  ClientOfferDetail,
  OfferFormData,
  FormErrors,
} from "@/types/client-offer.types";
import { MOCK_API_DELAY } from "@/lib/constants";

export const CATEGORIES = [
  { value: "", label: "Select a category" },
  { value: "web-development", label: "Web Development" },
  { value: "mobile-development", label: "Mobile Development" },
  { value: "design", label: "Design & Creative" },
  { value: "writing", label: "Writing & Translation" },
  { value: "marketing", label: "Marketing & Sales" },
  { value: "video", label: "Video & Animation" },
  { value: "music", label: "Music & Audio" },
  { value: "data", label: "Data & Analytics" },
  { value: "other", label: "Other" },
];

export const CATEGORY_LABEL_TO_VALUE: Record<string, string> = Object.fromEntries(
  CATEGORIES.filter((cat) => cat.value !== "").map((cat) => [cat.label, cat.value])
);

export const INITIAL_FORM_DATA: OfferFormData = {
  title: "",
  description: "",
  budget: "",
  category: "",
  deadline: "",
};

export const MIN_TITLE_LENGTH = 10;
export const MIN_DESCRIPTION_LENGTH = 50;
export const MIN_BUDGET = 10;
export { MOCK_API_DELAY };
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_ATTACHMENTS = 5;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export function validateOfferForm(formData: OfferFormData, originalDeadline?: string): FormErrors {
  const errors: FormErrors = {};

  if (!formData.title.trim()) {
    errors.title = "Title is required";
  } else if (formData.title.length < MIN_TITLE_LENGTH) {
    errors.title = `Title must be at least ${MIN_TITLE_LENGTH} characters`;
  }

  if (!formData.description.trim()) {
    errors.description = "Description is required";
  } else if (formData.description.length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`;
  }

  if (!formData.budget.trim()) {
    errors.budget = "Budget is required";
  } else {
    const budgetNum = parseFloat(formData.budget);
    if (isNaN(budgetNum) || budgetNum < MIN_BUDGET) {
      errors.budget = `Budget must be at least $${MIN_BUDGET}`;
    }
  }

  if (!formData.category) {
    errors.category = "Please select a category";
  }

  if (!formData.deadline) {
    errors.deadline = "Deadline is required";
  } else {
    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isUnchanged = originalDeadline !== undefined && formData.deadline === originalDeadline;
    if (!isUnchanged && deadlineDate < today) {
      errors.deadline = "Deadline must be in the future";
    }
  }

  return errors;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function resolveCategoryValue(categoryLabel: string): string {
  return CATEGORY_LABEL_TO_VALUE[categoryLabel] ?? "";
}

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
    status: "completed",
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
    attachments: [
      { name: "wireframes.pdf", size: 2_400_000, type: "document" },
      { name: "homepage-mockup.png", size: 1_800_000, type: "image" },
    ],
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
    attachments: [{ name: "brand-guidelines.pdf", size: 3_200_000, type: "document" }],
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
  "5": {
    id: "5",
    title: "Content writing for blog",
    description:
      "Need a skilled content writer to create engaging blog posts for our tech startup. Topics include AI, machine learning, and software development best practices. Looking for someone who can write technical content in an accessible way.",
    category: "Writing & Translation",
    budget: 300,
    deadline: "2026-01-30",
    status: "completed",
    createdAt: "2026-01-08",
    applicants: [
      {
        id: "a5",
        name: "Alex Writer",
        avatar: "AW",
        title: "Technical Content Writer",
        rating: 4.9,
        hourlyRate: 45,
        proposalDate: "2026-01-09",
        coverLetter:
          "I have 5+ years of experience writing technical content for tech companies. I can make complex topics easy to understand.",
      },
    ],
    hiredFreelancer: {
      id: "a5",
      name: "Alex Writer",
      avatar: "AW",
      title: "Technical Content Writer",
      rating: 4.9,
      hourlyRate: 45,
      proposalDate: "2026-01-09",
      coverLetter:
        "I have 5+ years of experience writing technical content for tech companies. I can make complex topics easy to understand.",
    },
  },
};

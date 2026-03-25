// ─── Enums / Unions ───────────────────────────────────────────────────────────

export type PortfolioCategory =
  | "web_development"
  | "mobile_development"
  | "ui_ux_design"
  | "graphic_design"
  | "data_science"
  | "devops"
  | "writing"
  | "marketing"
  | "video"
  | "other";

export const PORTFOLIO_CATEGORY_LABELS: Record<PortfolioCategory, string> = {
  web_development: "Web Development",
  mobile_development: "Mobile Development",
  ui_ux_design: "UI/UX Design",
  graphic_design: "Graphic Design",
  data_science: "Data Science",
  devops: "DevOps",
  writing: "Writing",
  marketing: "Marketing",
  video: "Video",
  other: "Other",
};

// ─── Core models ──────────────────────────────────────────────────────────────

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: PortfolioCategory;
  tags: string[];
  images: string[];
  /** Live URL of the project */
  projectUrl?: string;
  /** GitHub / source code URL */
  repoUrl?: string;
  /** Project start date (ISO date string YYYY-MM-DD) */
  startDate?: string;
  /** Project end date (ISO date string YYYY-MM-DD) */
  endDate?: string;
  /** Whether this item is visible on the public profile */
  isPublic: boolean;
  /** 0-based display order */
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export interface PortfolioFormData {
  title: string;
  description: string;
  category: PortfolioCategory;
  tags: string[];
  images: string[];
  projectUrl: string;
  repoUrl: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
}

export interface PortfolioFormErrors {
  title?: string;
  description?: string;
  category?: string;
  tags?: string;
  images?: string;
  projectUrl?: string;
  repoUrl?: string;
  startDate?: string;
  endDate?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_IMAGES_PER_ITEM = 5;
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 600;
export const MAX_TAGS = 8;
export const MAX_TAG_LENGTH = 24;

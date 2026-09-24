export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  items: FAQItem[];
}

export type FAQCategoryId =
  | "general"
  | "payments"
  | "security"
  | "technical"
  | "clients"
  | "freelancers";

/**
 * Client offer management types
 */

export type OfferStatus = "active" | "pending" | "closed";

export interface Applicant {
  id: string;
  name: string;
  avatar: string;
  title: string;
  rating: number;
  hourlyRate: number;
  proposalDate: string;
  coverLetter: string;
}

export interface ClientOffer {
  id: string;
  title: string;
  category: string;
  budget: number;
  deadline: string;
  status: OfferStatus;
  applicants: number;
  createdAt: string;
}

export interface ClientOfferDetail extends Omit<ClientOffer, "applicants"> {
  description: string;
  applicants: Applicant[];
}

export type FilterStatus = OfferStatus | "all";

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
}

export const STATUS_CONFIG: Record<OfferStatus, StatusConfig> = {
  active: { label: "Active", color: "text-success", bg: "bg-success/10" },
  pending: { label: "Pending", color: "text-warning", bg: "bg-warning/10" },
  closed: { label: "Closed", color: "text-text-secondary", bg: "bg-gray-100" },
};

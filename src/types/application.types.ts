export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Application {
  id: string;
  offerId: string;
  freelancerId: string;
  coverLetter: string;
  proposedRate?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  freelancer?: {
    id: string;
    email: string;
  };
  offer?: {
    id: string;
    title: string;
    budget: string;
    userId: string;
  };
}

export interface CreateApplicationPayload {
  coverLetter: string;
  proposedRate?: string;
}

export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus;
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
  limit?: number;
  cursor?: string;
}

export const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10' },
  ACCEPTED: { label: 'Accepted', color: 'text-success', bg: 'bg-success/10' },
  REJECTED: { label: 'Rejected', color: 'text-error', bg: 'bg-error/10' },
  WITHDRAWN: { label: 'Withdrawn', color: 'text-text-secondary', bg: 'bg-gray-100' },
};

/**
 * What a freelancer who already applied sees, by the state of their proposal.
 * It used to say "Proposal Submitted" even after the client accepted them.
 */
export const APPLIED_COPY: Record<ApplicationStatus, { title: string; detail: string }> = {
  PENDING: { title: "Proposal Submitted", detail: "You have applied to this offer. The client has not answered yet." },
  ACCEPTED: { title: "Assigned to you", detail: "The client chose you for this offer. An order was created." },
  REJECTED: { title: "Not selected", detail: "The client chose someone else for this offer." },
  WITHDRAWN: { title: "Proposal withdrawn", detail: "You withdrew your proposal for this offer." },
};

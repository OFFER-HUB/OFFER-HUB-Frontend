import type { Dispute, DisputeReason } from "@/types/dispute.types";

export const MOCK_DISPUTES: Dispute[] = [
  {
    id: "dispute-1",
    offerId: "offer-1",
    offerTitle: "E-commerce Website Development",
    freelancerName: "John Developer",
    reason: "quality_issues",
    description:
      "The delivered work does not meet the agreed specifications. Several features are missing and the code quality is below professional standards.",
    status: "open",
    evidence: [
      {
        id: "ev-1",
        name: "screenshot-bugs.png",
        type: "image/png",
        size: 245000,
        uploadedAt: "2024-01-15T10:30:00Z",
      },
    ],
    events: [
      {
        id: "event-1",
        type: "created",
        description: "Dispute opened by client",
        timestamp: "2024-01-15T10:00:00Z",
        actor: "You",
        actorRole: "client",
      },
      {
        id: "event-2",
        type: "evidence_added",
        description: "Evidence file uploaded: screenshot-bugs.png",
        timestamp: "2024-01-15T10:30:00Z",
        actor: "You",
        actorRole: "client",
      },
    ],
    comments: [
      {
        id: "comment-1",
        content: "I have uploaded screenshots showing the bugs in the delivered work. The shopping cart functionality is completely broken.",
        author: "You",
        authorRole: "client",
        timestamp: "2024-01-15T10:35:00Z",
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "dispute-2",
    offerId: "offer-2",
    offerTitle: "Mobile App UI Design",
    freelancerName: "Sarah Designer",
    reason: "deadline_missed",
    description:
      "The freelancer failed to deliver the project by the agreed deadline without prior communication or explanation.",
    status: "under_review",
    evidence: [
      {
        id: "ev-2",
        name: "contract-agreement.pdf",
        type: "application/pdf",
        size: 156000,
        uploadedAt: "2024-01-10T14:20:00Z",
      },
      {
        id: "ev-3",
        name: "chat-history.pdf",
        type: "application/pdf",
        size: 89000,
        uploadedAt: "2024-01-10T14:25:00Z",
      },
    ],
    events: [
      {
        id: "event-3",
        type: "created",
        description: "Dispute opened by client",
        timestamp: "2024-01-10T14:00:00Z",
        actor: "You",
        actorRole: "client",
      },
      {
        id: "event-4",
        type: "evidence_added",
        description: "Evidence files uploaded: contract-agreement.pdf, chat-history.pdf",
        timestamp: "2024-01-10T14:25:00Z",
        actor: "You",
        actorRole: "client",
      },
      {
        id: "event-5",
        type: "status_changed",
        description: "Dispute status changed to Under Review",
        timestamp: "2024-01-11T09:00:00Z",
        actor: "Support Team",
        actorRole: "admin",
      },
      {
        id: "event-6",
        type: "comment_added",
        description: "Admin added a comment",
        timestamp: "2024-01-12T09:30:00Z",
        actor: "Support Team",
        actorRole: "admin",
      },
    ],
    comments: [
      {
        id: "comment-2",
        content: "The deadline was clearly stated in the contract. I waited 5 extra days before opening this dispute.",
        author: "You",
        authorRole: "client",
        timestamp: "2024-01-10T14:30:00Z",
      },
      {
        id: "comment-3",
        content: "I apologize for the delay. I had some personal issues but should have communicated better.",
        author: "Sarah Designer",
        authorRole: "freelancer",
        timestamp: "2024-01-11T16:00:00Z",
      },
      {
        id: "comment-4",
        content: "We are reviewing this case. We will reach out to both parties for more information.",
        author: "Support Team",
        authorRole: "admin",
        timestamp: "2024-01-12T09:30:00Z",
      },
    ],
    createdAt: "2024-01-10T14:00:00Z",
    updatedAt: "2024-01-12T09:30:00Z",
  },
  {
    id: "dispute-3",
    offerId: "offer-3",
    offerTitle: "SEO Optimization Service",
    freelancerName: "Mike SEO Expert",
    reason: "scope_disagreement",
    description: "There was a misunderstanding about the scope of work. The freelancer claims additional features were out of scope.",
    status: "resolved",
    evidence: [],
    events: [
      {
        id: "event-7",
        type: "created",
        description: "Dispute opened by client",
        timestamp: "2024-01-05T08:00:00Z",
        actor: "You",
        actorRole: "client",
      },
      {
        id: "event-8",
        type: "status_changed",
        description: "Dispute status changed to Under Review",
        timestamp: "2024-01-06T10:00:00Z",
        actor: "Support Team",
        actorRole: "admin",
      },
      {
        id: "event-9",
        type: "resolved",
        description: "Dispute resolved - Both parties agreed to split additional work cost",
        timestamp: "2024-01-08T16:45:00Z",
        actor: "Support Team",
        actorRole: "admin",
      },
    ],
    comments: [
      {
        id: "comment-5",
        content: "The original agreement included keyword research and on-page optimization, but not link building.",
        author: "Mike SEO Expert",
        authorRole: "freelancer",
        timestamp: "2024-01-05T12:00:00Z",
      },
      {
        id: "comment-6",
        content: "After reviewing the original contract, we propose a 50/50 cost split for the additional work.",
        author: "Support Team",
        authorRole: "admin",
        timestamp: "2024-01-07T14:00:00Z",
      },
      {
        id: "comment-7",
        content: "I agree to the proposed resolution.",
        author: "You",
        authorRole: "client",
        timestamp: "2024-01-08T10:00:00Z",
      },
      {
        id: "comment-8",
        content: "I also agree. Thank you for the fair resolution.",
        author: "Mike SEO Expert",
        authorRole: "freelancer",
        timestamp: "2024-01-08T11:30:00Z",
      },
    ],
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-08T16:45:00Z",
    resolution: "After review, both parties agreed to split the additional work cost. Client paid 50% extra and freelancer completed the features.",
  },
];

export const DISPUTE_REASONS: { value: DisputeReason; label: string; description: string }[] = [
  {
    value: "quality_issues",
    label: "Quality Issues",
    description: "The delivered work does not meet the agreed quality standards",
  },
  {
    value: "deadline_missed",
    label: "Deadline Missed",
    description: "The project was not delivered by the agreed deadline",
  },
  {
    value: "communication_problems",
    label: "Communication Problems",
    description: "The freelancer is unresponsive or difficult to communicate with",
  },
  {
    value: "payment_dispute",
    label: "Payment Dispute",
    description: "There is a disagreement about payment terms or amounts",
  },
  {
    value: "scope_disagreement",
    label: "Scope Disagreement",
    description: "There is a misunderstanding about what was included in the project",
  },
  {
    value: "other",
    label: "Other",
    description: "Another issue not listed above",
  },
];

// Mock function to check if an offer is eligible for dispute
export function isOfferEligibleForDispute(offerId: string, offerStatus: string): boolean {
  // Only active or in-progress offers can have disputes opened
  const eligibleStatuses = ["active", "in_progress", "completed"];

  // Check if there's already an open dispute for this offer
  const hasOpenDispute = MOCK_DISPUTES.some(
    (d) => d.offerId === offerId && (d.status === "open" || d.status === "under_review")
  );

  return eligibleStatuses.includes(offerStatus) && !hasOpenDispute;
}

// Mock function to get disputes for a specific offer
export function getDisputesByOfferId(offerId: string): Dispute[] {
  return MOCK_DISPUTES.filter((d) => d.offerId === offerId);
}

// Mock function to get a dispute by ID
export function getDisputeById(disputeId: string): Dispute | undefined {
  return MOCK_DISPUTES.find((d) => d.id === disputeId);
}

// Mock eligible offers for the dispute form dropdown
export const MOCK_ELIGIBLE_OFFERS = [
  { id: "offer-1", title: "E-commerce Website Development" },
  { id: "offer-2", title: "Mobile App UI Design" },
  { id: "offer-4", title: "Logo Design Project" },
  { id: "offer-5", title: "Content Writing Service" },
];

// Freelancer-specific mock disputes (disputes where current user is the freelancer)
export const MOCK_FREELANCER_DISPUTES: Dispute[] = [
  {
    id: "f-dispute-1",
    offerId: "service-1",
    offerTitle: "Full-Stack Web Development",
    clientName: "TechCorp Inc.",
    reason: "payment_dispute",
    description:
      "Client has not released payment after I delivered the completed project according to all specifications.",
    status: "open",
    evidence: [
      {
        id: "f-ev-1",
        name: "delivery-confirmation.pdf",
        type: "application/pdf",
        size: 128000,
        uploadedAt: "2024-01-18T09:00:00Z",
      },
      {
        id: "f-ev-2",
        name: "project-screenshots.zip",
        type: "application/zip",
        size: 2450000,
        uploadedAt: "2024-01-18T09:15:00Z",
      },
    ],
    events: [
      {
        id: "f-event-1",
        type: "created",
        description: "Dispute opened by freelancer",
        timestamp: "2024-01-18T08:30:00Z",
        actor: "You",
        actorRole: "freelancer",
      },
      {
        id: "f-event-2",
        type: "evidence_added",
        description: "Evidence files uploaded",
        timestamp: "2024-01-18T09:15:00Z",
        actor: "You",
        actorRole: "freelancer",
      },
    ],
    comments: [
      {
        id: "f-comment-1",
        content:
          "I completed the project on January 15th and the client confirmed receipt. However, they have not released the payment.",
        author: "You",
        authorRole: "freelancer",
        timestamp: "2024-01-18T08:35:00Z",
      },
    ],
    createdAt: "2024-01-18T08:30:00Z",
    updatedAt: "2024-01-18T09:15:00Z",
  },
  {
    id: "f-dispute-2",
    offerId: "service-2",
    offerTitle: "UI/UX Design Service",
    clientName: "StartupXYZ",
    reason: "scope_disagreement",
    description:
      "Client is requesting additional features that were not part of the original agreement without additional compensation.",
    status: "under_review",
    evidence: [
      {
        id: "f-ev-3",
        name: "original-contract.pdf",
        type: "application/pdf",
        size: 95000,
        uploadedAt: "2024-01-12T14:00:00Z",
      },
    ],
    events: [
      {
        id: "f-event-3",
        type: "created",
        description: "Dispute opened by freelancer",
        timestamp: "2024-01-12T13:00:00Z",
        actor: "You",
        actorRole: "freelancer",
      },
      {
        id: "f-event-4",
        type: "status_changed",
        description: "Dispute status changed to Under Review",
        timestamp: "2024-01-13T10:00:00Z",
        actor: "Support Team",
        actorRole: "admin",
      },
      {
        id: "f-event-5",
        type: "comment_added",
        description: "Client responded to the dispute",
        timestamp: "2024-01-14T11:00:00Z",
        actor: "StartupXYZ",
        actorRole: "client",
      },
    ],
    comments: [
      {
        id: "f-comment-2",
        content:
          "The original scope included 5 screens. The client is now asking for 3 additional screens without offering extra payment.",
        author: "You",
        authorRole: "freelancer",
        timestamp: "2024-01-12T13:05:00Z",
      },
      {
        id: "f-comment-3",
        content:
          "We thought these screens were implied in the project description. However, we are willing to negotiate.",
        author: "StartupXYZ",
        authorRole: "client",
        timestamp: "2024-01-14T11:00:00Z",
      },
      {
        id: "f-comment-4",
        content:
          "We are reviewing the original contract and will provide a recommendation shortly.",
        author: "Support Team",
        authorRole: "admin",
        timestamp: "2024-01-15T09:00:00Z",
      },
    ],
    createdAt: "2024-01-12T13:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
  },
  {
    id: "f-dispute-3",
    offerId: "service-3",
    offerTitle: "Mobile App Development",
    clientName: "Digital Solutions Ltd",
    reason: "communication_problems",
    description:
      "Client was unresponsive for 3 weeks during the project, causing delays, and now blames me for the timeline.",
    status: "resolved",
    evidence: [
      {
        id: "f-ev-4",
        name: "message-history.pdf",
        type: "application/pdf",
        size: 156000,
        uploadedAt: "2024-01-02T10:00:00Z",
      },
    ],
    events: [
      {
        id: "f-event-6",
        type: "created",
        description: "Dispute opened by freelancer",
        timestamp: "2024-01-02T09:00:00Z",
        actor: "You",
        actorRole: "freelancer",
      },
      {
        id: "f-event-7",
        type: "status_changed",
        description: "Dispute status changed to Under Review",
        timestamp: "2024-01-03T10:00:00Z",
        actor: "Support Team",
        actorRole: "admin",
      },
      {
        id: "f-event-8",
        type: "resolved",
        description:
          "Dispute resolved - Deadline extended by 3 weeks due to client delays",
        timestamp: "2024-01-08T15:00:00Z",
        actor: "Support Team",
        actorRole: "admin",
      },
    ],
    comments: [
      {
        id: "f-comment-5",
        content:
          "I have attached the message history showing my attempts to contact the client from Dec 10-31.",
        author: "You",
        authorRole: "freelancer",
        timestamp: "2024-01-02T09:10:00Z",
      },
      {
        id: "f-comment-6",
        content:
          "I apologize for the lack of communication. I had a family emergency but should have notified.",
        author: "Digital Solutions Ltd",
        authorRole: "client",
        timestamp: "2024-01-05T14:00:00Z",
      },
      {
        id: "f-comment-7",
        content:
          "Based on the evidence, we are extending the project deadline by 3 weeks to compensate for the communication gap.",
        author: "Support Team",
        authorRole: "admin",
        timestamp: "2024-01-08T15:00:00Z",
      },
    ],
    createdAt: "2024-01-02T09:00:00Z",
    updatedAt: "2024-01-08T15:00:00Z",
    resolution:
      "The project deadline was extended by 3 weeks. Both parties agreed to continue working together with improved communication.",
  },
];

// Get all freelancer disputes
export function getFreelancerDisputes(): Dispute[] {
  return MOCK_FREELANCER_DISPUTES;
}

// Get freelancer dispute by ID
export function getFreelancerDisputeById(disputeId: string): Dispute | undefined {
  return MOCK_FREELANCER_DISPUTES.find((d) => d.id === disputeId);
}

// Check if a service/order has an existing dispute (for freelancer)
export function getFreelancerDisputeByServiceId(serviceId: string): Dispute | undefined {
  return MOCK_FREELANCER_DISPUTES.find((d) => d.offerId === serviceId);
}

// Mock eligible services for freelancer dispute form (services with active orders)
export const MOCK_FREELANCER_ELIGIBLE_SERVICES = [
  { id: "service-1", title: "Full-Stack Web Development", clientName: "TechCorp Inc." },
  { id: "service-2", title: "UI/UX Design Service", clientName: "StartupXYZ" },
  { id: "service-4", title: "React Native App Development", clientName: "Mobile First LLC" },
  { id: "service-5", title: "API Integration Service", clientName: "DataSync Corp" },
];

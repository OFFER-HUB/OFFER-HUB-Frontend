import type { AdminDispute } from "@/types/admin.types";

export const MOCK_ADMIN_DISPUTES: AdminDispute[] = [
  {
    id: "adm-dispute-1",
    offerId: "offer-101",
    offerTitle: "E-commerce Website Development",
    amount: 1200.0,
    reason: "quality_issues",
    description:
      "The delivered work does not meet the agreed specifications. Several features are missing and the code quality is below professional standards. The shopping cart is broken and checkout flow crashes on mobile.",
    status: "open",
    priority: "high",
    evidence: [
      {
        id: "ev-adm-1",
        name: "screenshot-bugs.png",
        type: "image/png",
        size: 245000,
        uploadedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "ev-adm-2",
        name: "error-logs.txt",
        type: "text/plain",
        size: 12000,
        uploadedAt: "2024-01-15T11:00:00Z",
      },
    ],
    events: [
      {
        id: "ev1-1",
        type: "created",
        description: "Dispute opened by client",
        timestamp: "2024-01-15T10:00:00Z",
        actor: "alex_buyer",
        actorRole: "client",
      },
      {
        id: "ev1-2",
        type: "evidence_added",
        description: "Evidence files uploaded: screenshot-bugs.png, error-logs.txt",
        timestamp: "2024-01-15T11:00:00Z",
        actor: "alex_buyer",
        actorRole: "client",
      },
    ],
    comments: [
      {
        id: "c1-1",
        content:
          "I have uploaded screenshots showing the bugs. The shopping cart functionality is completely broken and the checkout crashes on iOS Safari.",
        author: "alex_buyer",
        authorRole: "client",
        timestamp: "2024-01-15T10:35:00Z",
      },
      {
        id: "c1-2",
        content:
          "I tested the site on Chrome and Firefox and everything worked fine. The iOS issue might be a browser compatibility problem that was not in the original spec.",
        author: "john_dev",
        authorRole: "freelancer",
        timestamp: "2024-01-16T09:00:00Z",
      },
    ],
    buyer: {
      id: "usr-001",
      username: "alex_buyer",
      email: "alex@example.com",
      totalDisputes: 2,
      previousDisputes: [
        {
          id: "old-dispute-1",
          offerTitle: "Logo Design",
          status: "resolved",
          outcome: "buyer_wins",
          createdAt: "2023-08-10T00:00:00Z",
        },
      ],
    },
    seller: {
      id: "usr-002",
      username: "john_dev",
      email: "john@example.com",
      totalDisputes: 3,
      previousDisputes: [
        {
          id: "old-dispute-2",
          offerTitle: "Landing Page",
          status: "resolved",
          outcome: "seller_wins",
          createdAt: "2023-06-05T00:00:00Z",
        },
        {
          id: "old-dispute-3",
          offerTitle: "WordPress Plugin",
          status: "closed",
          createdAt: "2023-10-20T00:00:00Z",
        },
      ],
    },
    internalNotes: [],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-16T09:00:00Z",
  },
  {
    id: "adm-dispute-2",
    offerId: "offer-102",
    offerTitle: "Mobile App UI Design",
    amount: 850.0,
    reason: "deadline_missed",
    description:
      "The freelancer failed to deliver the project by the agreed deadline of January 5th without any prior communication or explanation. The deadline was explicitly stated in the contract.",
    status: "under_review",
    priority: "critical",
    evidence: [
      {
        id: "ev-adm-3",
        name: "contract-agreement.pdf",
        type: "application/pdf",
        size: 156000,
        uploadedAt: "2024-01-10T14:20:00Z",
      },
      {
        id: "ev-adm-4",
        name: "chat-history.pdf",
        type: "application/pdf",
        size: 89000,
        uploadedAt: "2024-01-10T14:25:00Z",
      },
    ],
    events: [
      {
        id: "ev2-1",
        type: "created",
        description: "Dispute opened by client",
        timestamp: "2024-01-10T14:00:00Z",
        actor: "maria_client",
        actorRole: "client",
      },
      {
        id: "ev2-2",
        type: "evidence_added",
        description: "Evidence files uploaded: contract-agreement.pdf, chat-history.pdf",
        timestamp: "2024-01-10T14:25:00Z",
        actor: "maria_client",
        actorRole: "client",
      },
      {
        id: "ev2-3",
        type: "status_changed",
        description: "Dispute status changed to Under Review",
        timestamp: "2024-01-11T09:00:00Z",
        actor: "admin_root",
        actorRole: "admin",
      },
    ],
    comments: [
      {
        id: "c2-1",
        content:
          "The deadline was clearly stated in the contract as January 5th. I waited 5 extra days before opening this dispute.",
        author: "maria_client",
        authorRole: "client",
        timestamp: "2024-01-10T14:30:00Z",
      },
      {
        id: "c2-2",
        content:
          "I apologize for the delay. I had some personal issues but should have communicated better. I can deliver within 3 days.",
        author: "sarah_design",
        authorRole: "freelancer",
        timestamp: "2024-01-11T16:00:00Z",
      },
      {
        id: "c2-3",
        content:
          "We are reviewing this case and will reach out to both parties for more information.",
        author: "Support Team",
        authorRole: "admin",
        timestamp: "2024-01-12T09:30:00Z",
      },
    ],
    buyer: {
      id: "usr-003",
      username: "maria_client",
      email: "maria@techstartup.com",
      totalDisputes: 1,
      previousDisputes: [],
    },
    seller: {
      id: "usr-004",
      username: "sarah_design",
      email: "sarah@designstudio.com",
      totalDisputes: 2,
      previousDisputes: [
        {
          id: "old-dispute-4",
          offerTitle: "Brand Identity Package",
          status: "resolved",
          outcome: "seller_wins",
          createdAt: "2023-09-15T00:00:00Z",
        },
      ],
    },
    internalNotes: [
      {
        id: "note-1",
        content:
          "Contract clearly shows Jan 5 deadline. Freelancer acknowledged delay. Recommend partial refund for late delivery.",
        adminUsername: "admin_root",
        createdAt: "2024-01-12T10:00:00Z",
      },
    ],
    createdAt: "2024-01-10T14:00:00Z",
    updatedAt: "2024-01-12T09:30:00Z",
  },
  {
    id: "adm-dispute-3",
    offerId: "offer-103",
    offerTitle: "SEO Optimization Service",
    amount: 350.0,
    reason: "scope_disagreement",
    description:
      "There was a misunderstanding about the scope of work. The freelancer claims additional features (link building) were out of scope, while the client believed they were included.",
    status: "resolved",
    priority: "medium",
    evidence: [],
    events: [
      {
        id: "ev3-1",
        type: "created",
        description: "Dispute opened by client",
        timestamp: "2024-01-05T08:00:00Z",
        actor: "bob_marketing",
        actorRole: "client",
      },
      {
        id: "ev3-2",
        type: "status_changed",
        description: "Dispute status changed to Under Review",
        timestamp: "2024-01-06T10:00:00Z",
        actor: "admin_root",
        actorRole: "admin",
      },
      {
        id: "ev3-3",
        type: "resolved",
        description: "Dispute resolved — Both parties agreed to split additional work cost",
        timestamp: "2024-01-08T16:45:00Z",
        actor: "admin_root",
        actorRole: "admin",
      },
    ],
    comments: [
      {
        id: "c3-1",
        content:
          "The original agreement included keyword research and on-page optimization, but not link building.",
        author: "mike_seo",
        authorRole: "freelancer",
        timestamp: "2024-01-05T12:00:00Z",
      },
      {
        id: "c3-2",
        content:
          "After reviewing the original contract, we propose a 50/50 cost split for the additional work.",
        author: "Support Team",
        authorRole: "admin",
        timestamp: "2024-01-07T14:00:00Z",
      },
      {
        id: "c3-3",
        content: "I agree to the proposed resolution.",
        author: "bob_marketing",
        authorRole: "client",
        timestamp: "2024-01-08T10:00:00Z",
      },
      {
        id: "c3-4",
        content: "I also agree. Thank you for the fair resolution.",
        author: "mike_seo",
        authorRole: "freelancer",
        timestamp: "2024-01-08T11:30:00Z",
      },
    ],
    buyer: {
      id: "usr-005",
      username: "bob_marketing",
      email: "bob@marketingco.com",
      totalDisputes: 1,
      previousDisputes: [],
    },
    seller: {
      id: "usr-006",
      username: "mike_seo",
      email: "mike@seoexperts.com",
      totalDisputes: 1,
      previousDisputes: [],
    },
    resolution:
      "After reviewing the original contract, both parties agreed to a 50/50 split. Client paid 50% extra and freelancer completed the link building features.",
    resolutionOutcome: "split",
    resolvedAt: "2024-01-08T16:45:00Z",
    resolvedBy: "admin_root",
    internalNotes: [
      {
        id: "note-2",
        content:
          "Contract was ambiguous on link building scope. Split resolution is fair given the ambiguity.",
        adminUsername: "admin_root",
        createdAt: "2024-01-07T13:00:00Z",
      },
    ],
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-08T16:45:00Z",
  },
  {
    id: "adm-dispute-4",
    offerId: "offer-104",
    offerTitle: "Full-Stack Web Application",
    amount: 4500.0,
    reason: "payment_dispute",
    description:
      "Client has not released the final payment of $4,500 despite the project being fully delivered and accepted. Client claims there are hidden bugs but cannot provide specific details.",
    status: "under_review",
    priority: "critical",
    evidence: [
      {
        id: "ev-adm-5",
        name: "delivery-confirmation.pdf",
        type: "application/pdf",
        size: 128000,
        uploadedAt: "2024-01-18T09:00:00Z",
      },
      {
        id: "ev-adm-6",
        name: "project-screenshots.zip",
        type: "application/zip",
        size: 2450000,
        uploadedAt: "2024-01-18T09:15:00Z",
      },
      {
        id: "ev-adm-7",
        name: "client-approval-email.pdf",
        type: "application/pdf",
        size: 45000,
        uploadedAt: "2024-01-18T09:20:00Z",
      },
    ],
    events: [
      {
        id: "ev4-1",
        type: "created",
        description: "Dispute opened by freelancer",
        timestamp: "2024-01-18T08:30:00Z",
        actor: "dev_james",
        actorRole: "freelancer",
      },
      {
        id: "ev4-2",
        type: "evidence_added",
        description: "Evidence files uploaded",
        timestamp: "2024-01-18T09:20:00Z",
        actor: "dev_james",
        actorRole: "freelancer",
      },
      {
        id: "ev4-3",
        type: "status_changed",
        description: "Dispute escalated to Under Review due to high value",
        timestamp: "2024-01-18T10:00:00Z",
        actor: "admin_root",
        actorRole: "admin",
      },
    ],
    comments: [
      {
        id: "c4-1",
        content:
          "I completed the project on January 15th and the client confirmed receipt via email (attached). They have not released the final payment.",
        author: "dev_james",
        authorRole: "freelancer",
        timestamp: "2024-01-18T08:35:00Z",
      },
      {
        id: "c4-2",
        content:
          "There are performance issues in the checkout flow. Loading takes 8+ seconds which was not acceptable per our agreement.",
        author: "corp_client",
        authorRole: "client",
        timestamp: "2024-01-19T11:00:00Z",
      },
    ],
    buyer: {
      id: "usr-007",
      username: "corp_client",
      email: "tech@corporation.com",
      totalDisputes: 2,
      previousDisputes: [
        {
          id: "old-dispute-5",
          offerTitle: "CRM Integration",
          status: "closed",
          createdAt: "2023-11-01T00:00:00Z",
        },
      ],
    },
    seller: {
      id: "usr-008",
      username: "dev_james",
      email: "james@freelancedev.com",
      totalDisputes: 1,
      previousDisputes: [],
    },
    internalNotes: [
      {
        id: "note-3",
        content:
          "High-value dispute. Client approval email is strong evidence. Need to verify the performance claims. Request screen recording from client.",
        adminUsername: "admin_root",
        createdAt: "2024-01-18T10:30:00Z",
      },
    ],
    createdAt: "2024-01-18T08:30:00Z",
    updatedAt: "2024-01-19T11:00:00Z",
  },
  {
    id: "adm-dispute-5",
    offerId: "offer-105",
    offerTitle: "Content Writing Package",
    amount: 200.0,
    reason: "communication_problems",
    description:
      "Freelancer was unresponsive for 2 weeks during the project causing significant delays in our content schedule.",
    status: "closed",
    priority: "low",
    evidence: [
      {
        id: "ev-adm-8",
        name: "message-history.pdf",
        type: "application/pdf",
        size: 67000,
        uploadedAt: "2024-01-03T10:00:00Z",
      },
    ],
    events: [
      {
        id: "ev5-1",
        type: "created",
        description: "Dispute opened by client",
        timestamp: "2024-01-03T09:00:00Z",
        actor: "startup_ceo",
        actorRole: "client",
      },
      {
        id: "ev5-2",
        type: "status_changed",
        description: "Dispute closed — parties reached direct agreement",
        timestamp: "2024-01-05T14:00:00Z",
        actor: "admin_root",
        actorRole: "admin",
      },
    ],
    comments: [
      {
        id: "c5-1",
        content:
          "Writer was unreachable for 2 weeks. We eventually resolved this directly but want it on record.",
        author: "startup_ceo",
        authorRole: "client",
        timestamp: "2024-01-03T09:10:00Z",
      },
      {
        id: "c5-2",
        content: "We have confirmed the parties resolved this directly. Closing dispute.",
        author: "Support Team",
        authorRole: "admin",
        timestamp: "2024-01-05T14:00:00Z",
      },
    ],
    buyer: {
      id: "usr-009",
      username: "startup_ceo",
      email: "ceo@startup.io",
      totalDisputes: 1,
      previousDisputes: [],
    },
    seller: {
      id: "usr-010",
      username: "content_writer",
      email: "writer@freelance.com",
      totalDisputes: 1,
      previousDisputes: [],
    },
    resolution: "Parties reached a direct agreement. Dispute closed.",
    resolutionOutcome: "dismissed",
    resolvedAt: "2024-01-05T14:00:00Z",
    resolvedBy: "admin_root",
    internalNotes: [],
    createdAt: "2024-01-03T09:00:00Z",
    updatedAt: "2024-01-05T14:00:00Z",
  },
  {
    id: "adm-dispute-6",
    offerId: "offer-106",
    offerTitle: "React Native Mobile App",
    amount: 3200.0,
    reason: "quality_issues",
    description:
      "The delivered app has critical crashes on Android devices running OS version 12+. Affects approximately 60% of the target user base.",
    status: "open",
    priority: "critical",
    evidence: [
      {
        id: "ev-adm-9",
        name: "crash-report.pdf",
        type: "application/pdf",
        size: 320000,
        uploadedAt: "2024-01-20T08:00:00Z",
      },
      {
        id: "ev-adm-10",
        name: "screen-recording.mp4",
        type: "video/mp4",
        size: 15000000,
        uploadedAt: "2024-01-20T08:30:00Z",
      },
    ],
    events: [
      {
        id: "ev6-1",
        type: "created",
        description: "Dispute opened by client",
        timestamp: "2024-01-20T07:30:00Z",
        actor: "mobile_startup",
        actorRole: "client",
      },
      {
        id: "ev6-2",
        type: "evidence_added",
        description: "Crash reports and screen recording uploaded",
        timestamp: "2024-01-20T08:30:00Z",
        actor: "mobile_startup",
        actorRole: "client",
      },
    ],
    comments: [
      {
        id: "c6-1",
        content:
          "The app crashes immediately on launch for Android 12+ devices. This is a critical issue affecting our launch.",
        author: "mobile_startup",
        authorRole: "client",
        timestamp: "2024-01-20T07:35:00Z",
      },
    ],
    buyer: {
      id: "usr-011",
      username: "mobile_startup",
      email: "cto@mobilestartup.com",
      totalDisputes: 1,
      previousDisputes: [],
    },
    seller: {
      id: "usr-012",
      username: "rn_developer",
      email: "rn@appdev.com",
      totalDisputes: 2,
      previousDisputes: [
        {
          id: "old-dispute-6",
          offerTitle: "iOS App Development",
          status: "resolved",
          outcome: "seller_wins",
          createdAt: "2023-07-10T00:00:00Z",
        },
      ],
    },
    internalNotes: [
      {
        id: "note-4",
        content:
          "High-value dispute opened today. Android 12 crash is a real regression - not present in spec. Priority: critical. Assign for immediate review.",
        adminUsername: "admin_root",
        createdAt: "2024-01-20T09:00:00Z",
      },
    ],
    createdAt: "2024-01-20T07:30:00Z",
    updatedAt: "2024-01-20T09:00:00Z",
  },
];

export function getAdminDisputeById(id: string): AdminDispute | undefined {
  return MOCK_ADMIN_DISPUTES.find((d) => d.id === id);
}

export type NotificationChannel = "email" | "inApp" | "push";

export type NotificationFrequency = "instant" | "daily_digest" | "off";

export type NotificationPreferenceType =
  | "orderLifecycle"
  | "offerUpdates"
  | "newMessages"
  | "paymentActivity"
  | "disputeStatus"
  | "reviewActivity"
  | "securityAlerts"
  | "platformAnnouncements";

export interface NotificationPreferenceItemMeta {
  key: NotificationPreferenceType;
  title: string;
  description: string;
}

export interface NotificationPreferenceSectionMeta {
  id: string;
  title: string;
  description: string;
  items: NotificationPreferenceItemMeta[];
}

export interface NotificationPreference {
  channels: Record<NotificationChannel, boolean>;
  frequency: NotificationFrequency;
}

export type NotificationPreferencesMap = Record<NotificationPreferenceType, NotificationPreference>;

export interface NotificationPreferences {
  muteAll: boolean;
  preferences: NotificationPreferencesMap;
}

export const NOTIFICATION_PREFERENCE_SECTIONS: NotificationPreferenceSectionMeta[] = [
  {
    id: "orders-offers",
    title: "Orders and offers",
    description: "Stay informed about offer decisions, order progress, and milestones.",
    items: [
      {
        key: "orderLifecycle",
        title: "Order lifecycle",
        description: "Created, accepted, completed, or cancelled order events.",
      },
      {
        key: "offerUpdates",
        title: "Offer updates",
        description: "When an offer is received, accepted, rejected, or withdrawn.",
      },
    ],
  },
  {
    id: "communication-payments",
    title: "Communication and payments",
    description: "Track conversations and money movement without missing critical actions.",
    items: [
      {
        key: "newMessages",
        title: "Messages",
        description: "New direct messages, replies, and mentions in active discussions.",
      },
      {
        key: "paymentActivity",
        title: "Payments",
        description: "Payout releases, receipts, refunds, and wallet balance changes.",
      },
    ],
  },
  {
    id: "trust-platform",
    title: "Trust and platform",
    description: "Get updates about account safety, reviews, disputes, and platform news.",
    items: [
      {
        key: "disputeStatus",
        title: "Disputes",
        description: "Dispute opened, reviewed, resolved, or escalated notifications.",
      },
      {
        key: "reviewActivity",
        title: "Ratings and reviews",
        description: "New reviews received and review-response reminders.",
      },
      {
        key: "securityAlerts",
        title: "Security alerts",
        description: "Login attempts, device changes, and suspicious account activity.",
      },
      {
        key: "platformAnnouncements",
        title: "Platform announcements",
        description: "Product updates, policy changes, and maintenance alerts.",
      },
    ],
  },
];

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  muteAll: false,
  preferences: {
    orderLifecycle: {
      channels: { email: true, inApp: true, push: true },
      frequency: "instant",
    },
    offerUpdates: {
      channels: { email: true, inApp: true, push: false },
      frequency: "instant",
    },
    newMessages: {
      channels: { email: false, inApp: true, push: true },
      frequency: "instant",
    },
    paymentActivity: {
      channels: { email: true, inApp: true, push: true },
      frequency: "instant",
    },
    disputeStatus: {
      channels: { email: true, inApp: true, push: true },
      frequency: "instant",
    },
    reviewActivity: {
      channels: { email: true, inApp: true, push: false },
      frequency: "daily_digest",
    },
    securityAlerts: {
      channels: { email: true, inApp: true, push: true },
      frequency: "instant",
    },
    platformAnnouncements: {
      channels: { email: true, inApp: true, push: false },
      frequency: "daily_digest",
    },
  },
};

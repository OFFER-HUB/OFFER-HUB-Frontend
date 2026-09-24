import type { SupportResource, ContactMethod } from "@/types/help.types";

export const supportResources: SupportResource[] = [
  {
    id: "faq",
    title: "FAQ",
    description: "Find answers to commonly asked questions about OFFER HUB",
    icon: "help-circle",
    href: "/faq",
  },
  {
    id: "docs",
    title: "Documentation",
    description: "Comprehensive guides and API documentation for developers",
    icon: "book",
    href: "https://github.com/OFFER-HUB/OFFER-HUB-Frontend/tree/main/docs",
  },
  {
    id: "community",
    title: "Community",
    description: "Join our Discord server to connect with other users",
    icon: "users",
    href: "https://discord.gg/offerhub",
  },
  {
    id: "github",
    title: "GitHub",
    description: "Report bugs, request features, or contribute to the project",
    icon: "github",
    href: "https://github.com/OFFER-HUB",
  },
];

export const contactMethods: ContactMethod[] = [
  {
    id: "discord",
    title: "Discord",
    description: "Real-time support from our community",
    icon: "discord",
    value: "discord.gg/SuqxDrVznQ",
    href: "https://discord.gg/SuqxDrVznQ",
  },
  {
    id: "telegram",
    title: "Telegram",
    description: "Join our Telegram group for quick support",
    icon: "telegram",
    value: "t.me/+nllS-VpK5QJmNjA5",
    href: "https://t.me/+nllS-VpK5QJmNjA5",
  },
  {
    id: "twitter",
    title: "X (Twitter)",
    description: "Follow us for updates and announcements",
    icon: "twitter",
    value: "@offerhub_",
    href: "https://x.com/offerhub_",
  },
];

export const subjectOptions = [
  { value: "general", label: "General Inquiry" },
  { value: "technical", label: "Technical Support" },
  { value: "billing", label: "Billing & Payments" },
  { value: "account", label: "Account Issues" },
  { value: "feedback", label: "Feedback & Suggestions" },
  { value: "other", label: "Other" },
];

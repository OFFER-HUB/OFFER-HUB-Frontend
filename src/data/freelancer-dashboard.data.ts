import { ICON_PATHS } from "@/components/ui/Icon";
import type {
  FreelancerStatCard,
  FreelancerActivity,
  FreelancerActivityType,
} from "@/types/freelancer-dashboard.types";

export const FREELANCER_STATS: FreelancerStatCard[] = [
  {
    label: "Active Services",
    value: 3,
    iconPath: ICON_PATHS.briefcase,
    color: "bg-primary",
  },
  {
    label: "Total Earnings",
    value: "$4,850",
    iconPath: ICON_PATHS.currency,
    color: "bg-success",
  },
  {
    label: "Pending Proposals",
    value: 5,
    iconPath: ICON_PATHS.document,
    color: "bg-secondary",
  },
  {
    label: "Unread Messages",
    value: 2,
    iconPath: ICON_PATHS.chat,
    color: "bg-accent",
  },
];

export const FREELANCER_ACTIVITY: FreelancerActivity[] = [
  {
    id: "1",
    type: "payment_received",
    title: "Payment received",
    description: "You received $500 for 'E-commerce Website Development'",
    time: "1 hour ago",
  },
  {
    id: "2",
    type: "review_received",
    title: "New review",
    description: "Client left a 5-star review for 'Mobile App UI Design'",
    time: "3 hours ago",
  },
  {
    id: "3",
    type: "proposal_accepted",
    title: "Proposal accepted",
    description: "Your proposal for 'Logo Design' was accepted",
    time: "1 day ago",
  },
  {
    id: "4",
    type: "message",
    title: "New message",
    description: "John D. sent you a message about 'API Development'",
    time: "1 day ago",
  },
  {
    id: "5",
    type: "service_created",
    title: "Service published",
    description: "Your service 'Full-Stack Development' is now live",
    time: "2 days ago",
  },
];

export const ACTIVITY_ICONS: Record<FreelancerActivityType, string> = {
  service_created: ICON_PATHS.plus,
  proposal_accepted: ICON_PATHS.check,
  message: ICON_PATHS.chat,
  payment_received: ICON_PATHS.currency,
  review_received: ICON_PATHS.star,
};
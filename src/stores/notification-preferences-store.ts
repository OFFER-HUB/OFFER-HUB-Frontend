import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NotificationType } from "@/types/notification.types";

export const NOTIFICATION_CATEGORIES = [
  { id: "orders", label: "Orders", description: "New, completed and cancelled orders." },
  { id: "offers", label: "Offers", description: "Offers received, accepted or rejected." },
  { id: "messages", label: "Messages", description: "New chat messages." },
  { id: "payments", label: "Payments", description: "Payments you receive." },
  { id: "disputes", label: "Disputes", description: "Disputes opened or resolved." },
  { id: "reviews", label: "Reviews", description: "New reviews on your work." },
  { id: "system", label: "System", description: "Announcements and account notices." },
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]["id"];

const TYPE_TO_CATEGORY: Record<NotificationType, NotificationCategory> = {
  order_created: "orders",
  order_completed: "orders",
  order_cancelled: "orders",
  offer_received: "offers",
  offer_accepted: "offers",
  offer_rejected: "offers",
  message_received: "messages",
  payment_received: "payments",
  dispute_opened: "disputes",
  dispute_resolved: "disputes",
  review_received: "reviews",
  system: "system",
};

export function categoryOf(type: NotificationType): NotificationCategory {
  return TYPE_TO_CATEGORY[type] ?? "system";
}

type Popups = Record<NotificationCategory, boolean>;

function allEnabled(): Popups {
  return Object.fromEntries(NOTIFICATION_CATEGORIES.map((c) => [c.id, true])) as Popups;
}

interface NotificationPreferencesState {
  /** Whether a pop-up appears for each category of new notification. */
  popups: Popups;
  setPopup: (category: NotificationCategory, enabled: boolean) => void;
  reset: () => void;
}

/**
 * Per-device notification preferences. Notifications always appear in the bell
 * and the notifications page; these switches only control the pop-up that
 * shows when a new one arrives.
 */
export const useNotificationPreferences = create<NotificationPreferencesState>()(
  persist(
    (set) => ({
      popups: allEnabled(),
      setPopup: (category, enabled) =>
        set((state) => ({ popups: { ...state.popups, [category]: enabled } })),
      reset: () => set({ popups: allEnabled() }),
    }),
    { name: "notification-preferences", partialize: ({ popups }) => ({ popups }) },
  ),
);

export function isPopupEnabled(type: NotificationType): boolean {
  return useNotificationPreferences.getState().popups[categoryOf(type)] !== false;
}

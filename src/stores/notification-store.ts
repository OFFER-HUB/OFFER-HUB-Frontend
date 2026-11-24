import { create } from "zustand";
import type { Notification } from "@/types/notification.types";
import {
  getNotifications,
  markNotificationsRead,
  markAllNotificationsRead,
} from "@/lib/api/notifications";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
  nextCursor: string | undefined;
  isLoading: boolean;
  isLoadingMore: boolean;
  isMutating: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  fetchMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  pushNotification: (notification: Notification) => void;
  incrementUnread: () => void;
}

const NOTIFICATIONS_ERROR = "We couldn't load your notifications.";

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  hasMore: false,
  nextCursor: undefined,
  isLoading: false,
  isLoadingMore: false,
  isMutating: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    const res = await getNotifications();
    if (res.ok && res.data) {
      set({
        notifications: res.data.notifications,
        unreadCount: res.data.unreadCount,
        hasMore: res.data.hasMore,
        nextCursor: res.data.nextCursor,
      });
    } else {
      set({ error: NOTIFICATIONS_ERROR });
    }
    set({ isLoading: false });
  },

  fetchMore: async () => {
    const { isLoadingMore, hasMore, nextCursor, notifications } = get();
    if (isLoadingMore || !hasMore) return;

    set({ isLoadingMore: true, error: null });
    const res = await getNotifications(nextCursor);
    if (res.ok && res.data) {
      set({
        notifications: [...notifications, ...res.data.notifications],
        hasMore: res.data.hasMore,
        nextCursor: res.data.nextCursor,
      });
    } else {
      set({ error: NOTIFICATIONS_ERROR });
    }
    set({ isLoadingMore: false });
  },

  markAsRead: async (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    set({ isMutating: true });
    await markNotificationsRead([id]);
    set({ isMutating: false });
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));

    set({ isMutating: true });
    await markAllNotificationsRead();
    set({ isMutating: false });
  },

  pushNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));
  },

  incrementUnread: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }));
  },
}));

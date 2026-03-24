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

  // Actions
  fetchNotifications: () => Promise<void>;
  fetchMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  hasMore: false,
  nextCursor: undefined,
  isLoading: false,
  isLoadingMore: false,
  isMutating: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    const res = await getNotifications();
    if (res.ok && res.data) {
      set({
        notifications: res.data.notifications,
        unreadCount: res.data.unreadCount,
        hasMore: res.data.hasMore,
        nextCursor: res.data.nextCursor,
      });
    }
    set({ isLoading: false });
  },

  fetchMore: async () => {
    const { isLoadingMore, hasMore, nextCursor, notifications } = get();
    if (isLoadingMore || !hasMore) return;

    set({ isLoadingMore: true });
    const res = await getNotifications(nextCursor);
    if (res.ok && res.data) {
      set({
        notifications: [...notifications, ...res.data.notifications],
        hasMore: res.data.hasMore,
        nextCursor: res.data.nextCursor,
      });
    }
    set({ isLoadingMore: false });
  },

  markAsRead: async (id: string) => {
    // Optimistic update
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
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));

    set({ isMutating: true });
    await markAllNotificationsRead();
    set({ isMutating: false });
  },
}));
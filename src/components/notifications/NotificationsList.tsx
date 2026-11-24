"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { LoadingSpinner } from "@/components/ui/Icon";
import { NotificationItem } from "./NotificationItem";
import { useNotificationStore } from "@/stores/notification-store";

export function NotificationsList(): React.JSX.Element {
  const {
    notifications,
    unreadCount,
    hasMore,
    isLoading,
    isLoadingMore,
    isMutating,
    error,
    fetchNotifications,
    fetchMore,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="md" className="text-primary" />
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm font-semibold text-text-primary">{error}</p>
        <button
          type="button"
          onClick={() => void fetchNotifications()}
          className="text-sm font-medium text-primary hover:text-primary/70 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-16 text-center">
        <p className="text-sm font-semibold text-text-primary">You&apos;re all caught up</p>
        <p className="text-xs text-text-secondary">No notifications yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {unreadCount > 0 ? `${unreadCount} unread` : "All notifications read"}
        </p>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void markAllAsRead()}
            disabled={isMutating}
            className={cn(
              "text-sm font-medium text-primary hover:text-primary/70 transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-white py-2 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} onRead={markAsRead} />
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-center text-sm text-error">
          {error}
        </p>
      )}

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => void fetchMore()}
            disabled={isLoadingMore}
            className={cn(
              "rounded-xl px-5 py-2 text-sm font-medium text-primary",
              "bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useNotificationStore } from "@/stores/notification-store";

export default function NotificationsPage(): React.JSX.Element {
  const {
    notifications,
    unreadCount,
    hasMore,
    isLoading,
    isLoadingMore,
    fetchNotifications,
    fetchMore,
    markAsRead,
    markAllAsRead,
    isMutating,
  } = useNotificationStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
        fetchMore();
      }
    },
    [hasMore, isLoadingMore, fetchMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(handleIntersect, {
      root: scrollRef.current,
      threshold: 0.1,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <div className="page-full-height flex justify-center">
      <div
        className={cn(
          "w-full max-w-2xl",
          "bg-white rounded-2xl overflow-hidden",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
          "flex flex-col"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-background">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-text-primary">Notifications</h1>
            {unreadCount > 0 && (
              <span
                className={cn(
                  "min-w-[1.25rem] h-5 px-1.5 rounded-full flex items-center justify-center",
                  "text-[10px] font-bold text-white bg-primary"
                )}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={isMutating}
              className={cn(
                "text-xs font-medium text-primary",
                "hover:text-primary/70 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Scrollable list */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto py-2"
          style={{ scrollbarWidth: "thin" }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="md" className="text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 gap-3">
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center",
                  "bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
                )}
              >
                <Icon
                  path={ICON_PATHS.bell}
                  size="lg"
                  className="text-text-secondary"
                />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-text-primary">
                  You&apos;re all caught up
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  No notifications yet
                </p>
              </div>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                />
              ))}

              <div ref={sentinelRef} className="h-1" />

              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" className="text-primary" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

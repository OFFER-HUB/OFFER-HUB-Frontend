"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NotificationItem } from "./NotificationItem";
import { useNotificationStore } from "@/stores/notification-store";
import { DROPDOWN_MENU } from "@/lib/styles";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({
  isOpen,
  onClose,
}: NotificationDropdownProps): React.JSX.Element | null {
  const {
    notifications,
    unreadCount,
    hasMore,
    isLoading,
    isLoadingMore,
    isMutating,
    fetchNotifications,
    fetchMore,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fetch on first open
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Infinite scroll via IntersectionObserver
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

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        DROPDOWN_MENU,
        // Override width for notifications - needs more room
        "w-80 sm:w-96 py-0 right-0 top-[calc(100%+0.75rem)]"
      )}
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-background">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-text-primary">Notifications</h2>
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
        className="overflow-y-auto max-h-[22rem] py-2"
        style={{ scrollbarWidth: "thin" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <LoadingSpinner size="md" className="text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-10 px-4 gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                "bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
              )}
            >
              <Icon
                path={ICON_PATHS.bell}
                size="md"
                className="text-text-secondary"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">
                You&apos;re all caught up
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
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

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-1" />

            {isLoadingMore && (
              <div className="flex justify-center py-3">
                <LoadingSpinner size="sm" className="text-primary" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-background px-5 py-3">
        <Link
          href="/app/notifications"
          onClick={onClose}
          className={cn(
            "flex items-center justify-center gap-1.5 w-full",
            "text-xs font-medium text-primary",
            "hover:text-primary/70 transition-colors"
          )}
        >
          View all notifications
          <Icon
            path={ICON_PATHS.chevronRight}
            size="sm"
            className="opacity-70"
          />
        </Link>
      </div>
    </div>
  );
}
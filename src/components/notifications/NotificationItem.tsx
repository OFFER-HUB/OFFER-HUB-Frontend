"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { Notification, NotificationType } from "@/types/notification.types";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const diff = now - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case "order_created":
    case "order_completed":
    case "order_cancelled":
      return ICON_PATHS.shoppingCart;
    case "offer_received":
    case "offer_accepted":
    case "offer_rejected":
      return ICON_PATHS.briefcase;
    case "message_received":
      return ICON_PATHS.chat;
    case "payment_received":
      return ICON_PATHS.currency;
    case "dispute_opened":
    case "dispute_resolved":
      return ICON_PATHS.shield;
    case "review_received":
      return ICON_PATHS.star;
    default:
      return ICON_PATHS.infoCircle;
  }
}

function getIconColor(type: NotificationType): string {
  switch (type) {
    case "order_completed":
    case "offer_accepted":
    case "dispute_resolved":
    case "payment_received":
      return "text-success";
    case "order_cancelled":
    case "offer_rejected":
    case "dispute_opened":
      return "text-error";
    case "message_received":
      return "text-primary";
    default:
      return "text-text-secondary";
  }
}

export function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps): React.JSX.Element {
  const iconPath = getNotificationIcon(notification.type);
  const iconColor = getIconColor(notification.type);

  function handleClick(): void {
    if (!notification.isRead) {
      onRead(notification.id);
    }
  }

  const content = (
    <div
      onClick={handleClick}
      className={cn(
        "group flex items-start gap-3 px-4 py-3 mx-2 my-0.5 rounded-xl cursor-pointer",
        "transition-all duration-200",
        "hover:bg-background hover:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
        !notification.isRead && "bg-primary/5"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mt-0.5 w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center",
          "bg-white shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]"
        )}
      >
        <Icon path={iconPath} size="sm" className={iconColor} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-snug truncate",
              notification.isRead
                ? "font-medium text-text-secondary"
                : "font-semibold text-text-primary"
            )}
          >
            {notification.title}
          </p>
          <span className="text-xs text-text-secondary whitespace-nowrap flex-shrink-0 mt-0.5">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
          {notification.message}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
      )}
    </div>
  );

  if (notification.href) {
    return <Link href={notification.href}>{content}</Link>;
  }

  return content;
}
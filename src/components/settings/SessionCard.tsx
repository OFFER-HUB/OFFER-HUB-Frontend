import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import type { Session } from "@/lib/api/sessions";

interface SessionCardProps {
  session: Session;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
}

export function SessionCard({
  session,
  onRevoke,
  isRevoking,
}: SessionCardProps): React.JSX.Element {
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return ICON_PATHS.mobile;
      case "tablet":
        return ICON_PATHS.tablet;
      case "desktop":
      default:
        return ICON_PATHS.desktop;
    }
  };

  const relativeTime = session.lastActivity
    ? formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })
    : "Unknown";

  return (
    <div
      className={cn(
        NEUMORPHIC_CARD,
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon path={getDeviceIcon(session.deviceType)} size="lg" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-text-primary">
              {session.os} &bull; {session.browser}
            </h3>
            {session.isCurrent && (
              <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success border border-success/20">
                Current Session
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary flex items-center gap-1.5 mb-1">
            <Icon path={ICON_PATHS.mapPin} size="sm" />
            {session.location} ({session.ip})
          </p>
          <p className="text-xs text-text-secondary">Last active {relativeTime}</p>
        </div>
      </div>

      {!session.isCurrent && (
        <button
          type="button"
          onClick={() => onRevoke(session.id)}
          disabled={isRevoking}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 min-w-[100px]",
            isRevoking
              ? "opacity-70 cursor-not-allowed bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] text-text-secondary"
              : "text-error hover:bg-error/10 hover:shadow-none bg-background shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
          )}
        >
          {isRevoking ? <LoadingSpinner size="sm" /> : "Sign out"}
        </button>
      )}
    </div>
  );
}

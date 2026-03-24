import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { DisputeEvent, DisputeEventType } from "@/types/dispute.types";

const EVENT_ICONS: Record<DisputeEventType, string> = {
  created: ICON_PATHS.plus,
  evidence_added: ICON_PATHS.file,
  status_changed: ICON_PATHS.flag,
  comment_added: ICON_PATHS.chat,
  resolved: ICON_PATHS.check,
};

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface DisputeTimelineProps {
  events: DisputeEvent[];
}

export function DisputeTimeline({ events }: DisputeTimelineProps): React.JSX.Element {
  return (
    <div className="relative">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex gap-4">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center z-10",
                "bg-white",
                "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                index === 0 ? "ring-2 ring-primary" : ""
              )}
            >
              <Icon
                path={EVENT_ICONS[event.type]}
                size="sm"
                className={index === 0 ? "text-primary" : "text-text-secondary"}
              />
            </div>
            <div className="flex-1 pb-4">
              <p className="text-text-primary text-sm font-medium">
                {event.description}
              </p>
              <p className="text-text-secondary text-xs mt-1">
                {formatDateTime(event.timestamp)}
              </p>
              <p className="text-text-secondary text-xs">by {event.actor}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { cn } from "@/lib/cn";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

interface ActivityFeedItemProps<TType extends string> {
  type: TType;
  title: string;
  subtitle: string;
  time: string;
  /**
   * Icon path per activity type. Generic over the caller's own union so each
   * dashboard is forced to map every type it can receive.
   */
  iconByType: Record<TType, string>;
  /** Drawn when the API sends a type the map does not cover. */
  fallbackIconPath?: string;
}

/**
 * Sunken row of a dashboard activity feed: icon, title, subtitle and timestamp.
 */
export function ActivityFeedItem<TType extends string>({
  type,
  title,
  subtitle,
  time,
  iconByType,
  fallbackIconPath = ICON_PATHS.check,
}: ActivityFeedItemProps<TType>): React.JSX.Element {
  return (
    <div className={cn("flex items-start gap-4 p-4 rounded-xl", NEUMORPHIC_INSET)}>
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon path={iconByType[type] ?? fallbackIconPath} size="md" className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary">{title}</p>
        <p className="text-sm text-text-secondary truncate">{subtitle}</p>
      </div>
      <span className="text-xs text-text-secondary whitespace-nowrap">{time}</span>
    </div>
  );
}

/** Placeholder row with the same footprint as {@link ActivityFeedItem}. */
export function ActivityFeedItemSkeleton(): React.JSX.Element {
  return (
    <div
      className={cn("flex items-start gap-4 p-4 rounded-xl animate-pulse", NEUMORPHIC_INSET)}
    >
      <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded mb-2 w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-16" />
    </div>
  );
}

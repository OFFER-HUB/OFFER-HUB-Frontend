import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, ICON_CONTAINER } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

interface StatsCardProps {
  label: string;
  value: string | number;
  iconPath: string;
  accentColor: string;
  trend?: number | null;
  isLoading?: boolean;
}

export function StatsCard({
  label,
  value,
  iconPath,
  accentColor,
  trend,
  isLoading,
}: StatsCardProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div className={cn(NEUMORPHIC_CARD, "animate-pulse")}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  const trendIsPositive = trend !== null && trend !== undefined && trend >= 0;

  return (
    <div
      className={cn(
        NEUMORPHIC_CARD,
        "group transition-all duration-300 hover:-translate-y-1",
        "hover:shadow-[10px_10px_20px_#d1d5db,-10px_-10px_20px_#ffffff]"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            ICON_CONTAINER,
            accentColor,
            "group-hover:scale-110 transition-transform duration-500"
          )}
        >
          <Icon path={iconPath} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-text-primary truncate">{value}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-sm text-text-secondary">{label}</p>
            {trend !== null && trend !== undefined && (
              <span
                className={cn(
                  "text-[10px] font-semibold flex items-center gap-0.5",
                  trendIsPositive ? "text-success" : "text-error"
                )}
              >
                <Icon
                  path={trendIsPositive ? ICON_PATHS.arrowUp : ICON_PATHS.arrowDown}
                  size="sm"
                />
                {trendIsPositive ? "+" : ""}
                {trend}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

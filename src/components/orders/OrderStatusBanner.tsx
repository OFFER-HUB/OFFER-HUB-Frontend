import { cn } from "@/lib/cn";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

export type OrderBannerTone = "error" | "success";

interface ToneConfig {
  title: string;
  iconPath: string;
  border: string;
  bubble: string;
  text: string;
  hover: string;
  role: "alert" | "status";
}

const TONE_CONFIG: Record<OrderBannerTone, ToneConfig> = {
  error: {
    title: "Error",
    iconPath: ICON_PATHS.alertCircle,
    border: "border-error",
    bubble: "bg-error/10",
    text: "text-error",
    hover: "hover:bg-error/5",
    role: "alert",
  },
  success: {
    title: "Success",
    iconPath: ICON_PATHS.check,
    border: "border-success",
    bubble: "bg-success/10",
    text: "text-success",
    hover: "hover:bg-success/5",
    role: "status",
  },
};

interface OrderStatusBannerProps {
  tone: OrderBannerTone;
  /** Nothing renders while this is null, so callers can drop it in unguarded. */
  message: string | null;
  onDismiss: () => void;
  /** Overrides the heading above the message. */
  title?: string;
}

/**
 * Dismissible notification bar for the outcome of an order action.
 */
export function OrderStatusBanner({
  tone,
  message,
  onDismiss,
  title,
}: OrderStatusBannerProps): React.JSX.Element | null {
  if (!message) return null;

  const config = TONE_CONFIG[tone];

  return (
    <div
      role={config.role}
      className={cn(
        "p-4 rounded-xl flex items-start gap-3",
        NEUMORPHIC_INSET,
        "border-l-4",
        config.border
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          config.bubble
        )}
      >
        <Icon path={config.iconPath} size="sm" className={config.text} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-semibold mb-1", config.text)}>{title ?? config.title}</p>
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={`Dismiss ${(title ?? config.title).toLowerCase()} message`}
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0",
          config.text,
          config.hover
        )}
      >
        <Icon path={ICON_PATHS.close} size="sm" />
      </button>
    </div>
  );
}

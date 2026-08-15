import { cn } from "@/lib/cn";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon } from "@/components/ui/Icon";

/** Accent applied to the left border, the icon bubble and the icon itself. */
export type OrderCalloutTone = "primary" | "success" | "warning" | "error";

interface ToneStyles {
  border: string;
  bubble: string;
  icon: string;
}

const TONE_STYLES: Record<OrderCalloutTone, ToneStyles> = {
  primary: { border: "border-primary", bubble: "bg-primary/10", icon: "text-primary" },
  success: { border: "border-success", bubble: "bg-success/10", icon: "text-success" },
  warning: { border: "border-warning", bubble: "bg-warning/10", icon: "text-warning" },
  error: { border: "border-error", bubble: "bg-error/10", icon: "text-error" },
};

interface OrderStatusCalloutProps {
  tone: OrderCalloutTone;
  iconPath: string;
  title: string;
  description: string;
  className?: string;
}

/**
 * Sunken status block with a coloured edge: what the order is doing right now
 * and what it means for the person reading it.
 *
 * Used by both role panels, which show the same shape with different copy.
 */
export function OrderStatusCallout({
  tone,
  iconPath,
  title,
  description,
  className,
}: OrderStatusCalloutProps): React.JSX.Element {
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={cn("p-4 rounded-xl", NEUMORPHIC_INSET, "border-l-4", styles.border, className)}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            styles.bubble
          )}
        >
          <Icon path={iconPath} size="sm" className={styles.icon} />
        </div>
        <div>
          <p className="font-semibold text-text-primary text-sm">{title}</p>
          <p className="text-xs text-text-secondary">{description}</p>
        </div>
      </div>
    </div>
  );
}

interface OrderNoticeRowProps {
  tone: OrderCalloutTone;
  iconPath: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Icon-and-sentence row used for guidance that sits above an action button, or
 * inside a bordered panel when there is nothing to do but wait.
 */
export function OrderNoticeRow({
  tone,
  iconPath,
  children,
  className,
}: OrderNoticeRowProps): React.JSX.Element {
  const styles = TONE_STYLES[tone];

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          styles.bubble
        )}
      >
        <Icon path={iconPath} size="sm" className={styles.icon} />
      </div>
      <p className="text-sm text-text-secondary pt-2">{children}</p>
    </div>
  );
}

/** Border utility for the tone, for panels that own their own container. */
export function orderCalloutBorder(tone: OrderCalloutTone): string {
  return TONE_STYLES[tone].border;
}

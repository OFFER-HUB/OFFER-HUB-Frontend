import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, PRIMARY_BUTTON } from "@/lib/styles";

interface EmptyStateProps {
  icon: string;
  title?: string;
  message: string;
  linkHref?: string;
  linkText?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "card";
}

export function EmptyState({
  icon,
  title,
  message,
  linkHref,
  linkText,
  actionLabel,
  onAction,
  variant = "default",
}: EmptyStateProps): React.JSX.Element {
  const content = (
    <>
      <div
        className={cn(
          "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
          "bg-background",
          "shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
        )}
      >
        <Icon path={icon} size="xl" className="text-text-secondary" ariaHidden />
      </div>
      {title && (
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      )}
      <p className="text-text-secondary mb-4">{message}</p>
      {linkHref && linkText && (
        <Link
          href={linkHref}
          className={cn(PRIMARY_BUTTON, "inline-flex items-center gap-2")}
        >
          {linkText}
        </Link>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={cn(PRIMARY_BUTTON, "inline-flex items-center gap-2")}
        >
          {actionLabel}
        </button>
      )}
    </>
  );

  if (variant === "card") {
    return (
      <div className={cn(NEUMORPHIC_CARD, "text-center py-8")}>
        {content}
      </div>
    );
  }

  return (
    <div className="text-center py-12" role="status">
      {content}
    </div>
  );
}

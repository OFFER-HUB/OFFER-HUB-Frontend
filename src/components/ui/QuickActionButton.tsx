import Link from "next/link";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_BUTTON, ICON_CONTAINER } from "@/lib/styles";
import { Icon } from "@/components/ui/Icon";

interface QuickActionButtonProps {
  href: string;
  iconPath: string;
  /** Tailwind background utilities for the icon tile, e.g. `bg-primary/90`. */
  iconColor: string;
  title: string;
  description: string;
  /** Optional counter pill — a sunken chip so it reads as recessed into the raised button. */
  badge?: string | number;
}

/**
 * Raised shortcut tile used by the dashboard quick-action grids.
 */
export function QuickActionButton({
  href,
  iconPath,
  iconColor,
  title,
  description,
  badge,
}: QuickActionButtonProps): React.JSX.Element {
  return (
    <Link href={href} className={NEUMORPHIC_BUTTON}>
      <div className={cn(ICON_CONTAINER, iconColor)}>
        <Icon path={iconPath} className="text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      {badge !== undefined && (
        <span
          className={cn(
            "ml-auto flex-shrink-0 px-2.5 py-1 rounded-full",
            "text-xs font-bold text-primary",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

/**
 * Feature-local primitives for the Sub Rosa demo.
 *
 * Kept inside `src/features/sub-rosa` so the feature stays removable and the
 * shared `Button`/`Card` used by the rest of the app are left untouched. Every
 * shadow and colour comes from the design tokens in `globals.css`, so the page
 * follows the light/dark theme instead of hard-coding light-mode hex values.
 */

type ActionVariant = "primary" | "soft" | "quiet";
type ActionSize = "sm" | "md";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionVariant;
  size?: ActionSize;
  iconPath?: string;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const ACTION_VARIANTS: Record<ActionVariant, string> = {
  primary: cn(
    "bg-primary text-white shadow-[var(--shadow-neumorphic-light)]",
    "hover:bg-primary-hover hover:-translate-y-px",
    "active:translate-y-0 active:shadow-[var(--shadow-neumorphic-inset-light)]"
  ),
  soft: cn(
    "bg-white text-primary shadow-[var(--shadow-neumorphic-light)]",
    "hover:-translate-y-px hover:text-primary-hover",
    "active:translate-y-0 active:shadow-[var(--shadow-neumorphic-inset-light)]"
  ),
  quiet: cn(
    "bg-transparent text-text-secondary",
    "hover:bg-background hover:text-text-primary",
    "active:shadow-[var(--shadow-neumorphic-inset-light)]"
  ),
};

const ACTION_SIZES: Record<ActionSize, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
};

/**
 * A button with one clear disabled look: a sunken, neutral well. The shared
 * `Button` fades to 50% opacity instead, which on the outline variant turns
 * into a washed-out teal outline that reads as broken rather than unavailable.
 */
export function ActionButton({
  variant = "primary",
  size = "md",
  iconPath,
  isLoading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ActionButtonProps): React.JSX.Element {
  const isDisabled = disabled === true || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold whitespace-nowrap",
        "transition-[transform,box-shadow,background-color,color] duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ACTION_VARIANTS[variant],
        ACTION_SIZES[size],
        fullWidth && "w-full",
        isDisabled &&
          cn(
            "cursor-not-allowed translate-y-0 hover:translate-y-0",
            variant === "quiet"
              ? "text-text-secondary/60 hover:bg-transparent hover:text-text-secondary/60"
              : "bg-background text-text-secondary hover:bg-background hover:text-text-secondary shadow-[var(--shadow-neumorphic-inset-light)]"
          ),
        className
      )}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : iconPath ? (
        <Icon path={iconPath} size="sm" className="shrink-0" />
      ) : null}
      {children}
    </button>
  );
}

type BadgeTone = "primary" | "neutral" | "dark" | "success";

const BADGE_TONES: Record<BadgeTone, string> = {
  primary: "bg-primary/10 text-primary",
  neutral: "bg-background text-text-secondary ring-1 ring-inset ring-border-light",
  dark: "bg-secondary text-white",
  success: "bg-success/10 text-success",
};

interface BadgeProps {
  tone?: BadgeTone;
  iconPath?: string;
  children: ReactNode;
  className?: string;
}

export function Badge({
  tone = "neutral",
  iconPath,
  children,
  className,
}: BadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 shrink-0 rounded-full px-2.5 py-1",
        "text-xs font-semibold leading-none",
        BADGE_TONES[tone],
        className
      )}
    >
      {iconPath ? <Icon path={iconPath} size="sm" className="w-3.5 h-3.5" /> : null}
      {children}
    </span>
  );
}

interface PanelProps extends HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "aside";
  children: ReactNode;
}

/** Raised surface used by every block on the page, stretched to row height. */
export function Panel({
  as: Tag = "section",
  className,
  children,
  ...props
}: PanelProps): React.JSX.Element {
  return (
    <Tag
      className={cn(
        "flex flex-col min-w-0 h-full rounded-2xl bg-white p-5 sm:p-6",
        "shadow-[var(--shadow-neumorphic-light)]",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

interface PanelHeaderProps {
  iconPath: string;
  title: string;
  description?: string;
  aside?: ReactNode;
}

export function PanelHeader({
  iconPath,
  title,
  description,
  aside,
}: PanelHeaderProps): React.JSX.Element {
  return (
    <header className="mb-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <IconWell iconPath={iconPath} />
          <h2 className="text-base font-bold text-text-primary truncate">{title}</h2>
        </div>
        {aside}
      </div>
      {description ? (
        <p className="text-sm text-text-secondary mt-3 leading-relaxed">{description}</p>
      ) : null}
    </header>
  );
}

/** Sunken square holding an icon — the page's recurring "label" motif. */
export function IconWell({
  iconPath,
  className,
}: {
  iconPath: string;
  className?: string;
}): React.JSX.Element {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center justify-center shrink-0 w-9 h-9 rounded-xl",
        "bg-background text-primary shadow-[var(--shadow-neumorphic-inset-light)]",
        className
      )}
    >
      <Icon path={iconPath} size="sm" />
    </span>
  );
}

/** Thin external link with a consistent icon and focus treatment. */
export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-primary",
        "hover:text-primary-hover hover:underline underline-offset-4",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
    >
      {children}
      <Icon path={ICON_PATHS.externalLink} size="sm" className="w-3.5 h-3.5" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

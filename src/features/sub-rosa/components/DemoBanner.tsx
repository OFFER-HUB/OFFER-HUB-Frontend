import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { SUBROSA_LINKS } from "../sub-rosa.constants";
import { Badge, IconWell } from "./ui";

/**
 * Permanent, unmissable notice that nothing on this page is real. It stays
 * pinned above the fold rather than tucked into a footer — the demo exists to
 * be screenshotted, and a screenshot must carry its own disclaimer.
 */
export function DemoBanner(): React.JSX.Element {
  return (
    <div
      role="note"
      className={cn(
        "flex flex-col gap-4 p-5 rounded-2xl sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        "bg-white shadow-[var(--shadow-neumorphic-light)]"
      )}
    >
      <div className="flex items-start gap-4 min-w-0">
        <IconWell iconPath={ICON_PATHS.infoCircle} />
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-text-primary">
            <Badge tone="dark">Demo</Badge>
            Sample data, no blockchain activity
          </p>
          <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
            Not wired to OFFER HUB accounts, offers, payments or escrows. No contract ID,
            transaction hash or receipt is claimed anywhere on this page.
          </p>
        </div>
      </div>
      <a
        href={SUBROSA_LINKS.pilot}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center justify-center gap-2 shrink-0 h-11 px-5 rounded-xl",
          "text-sm font-semibold text-primary bg-white",
          "shadow-[var(--shadow-neumorphic-light)] transition-[transform,box-shadow] duration-200",
          "hover:-translate-y-px hover:text-primary-hover",
          "active:translate-y-0 active:shadow-[var(--shadow-neumorphic-inset-light)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        Read the pilot doc
        <Icon path={ICON_PATHS.externalLink} size="sm" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </div>
  );
}

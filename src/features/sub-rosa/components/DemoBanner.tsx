import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { SUBROSA_LINKS } from "../sub-rosa.constants";

/**
 * Permanent, unmissable notice that nothing on this page is real. It stays
 * pinned above the fold rather than tucked into a footer — the demo exists to
 * be screenshotted, and a screenshot must carry its own disclaimer.
 *
 * Built as a raised neumorphic surface rather than a solid colour block: the
 * raised/sunken shadow pair only reads against the light background, so a
 * filled panel would flatten the page.
 */
export function DemoBanner(): React.JSX.Element {
  return (
    <div
      role="note"
      className={cn(
        "flex flex-col gap-4 p-5 mb-6 rounded-2xl sm:flex-row sm:items-center sm:justify-between",
        "bg-white shadow-[var(--shadow-neumorphic-light)]"
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "inline-flex items-center justify-center shrink-0 w-10 h-10 rounded-xl",
            "bg-background text-primary",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
          )}
        >
          <Icon path={ICON_PATHS.infoCircle} size="md" />
        </span>
        <div>
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-text-primary">
            <span
              className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide",
                "bg-secondary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
              )}
            >
              DEMO
            </span>
            Sample data, no blockchain activity
          </p>
          <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
            An exploration of Sub Rosa as an optional sealed-proposal layer. It is not wired to
            OFFER HUB accounts, offers, payments or escrows, and no contract ID, transaction hash
            or receipt is claimed anywhere on this page.
          </p>
        </div>
      </div>
      <a
        href={SUBROSA_LINKS.pilot}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center justify-center gap-1.5 shrink-0 px-4 py-2.5 rounded-xl",
          "text-sm font-medium text-white bg-primary",
          "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
          "transition-shadow duration-200",
          "active:shadow-[var(--shadow-neumorphic-inset-light)]"
        )}
      >
        Pilot doc
        <Icon path={ICON_PATHS.externalLink} size="sm" />
      </a>
    </div>
  );
}

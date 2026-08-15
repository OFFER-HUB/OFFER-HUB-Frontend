import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { SUBROSA_LINKS } from "../sub-rosa.constants";

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
        "flex flex-col gap-4 p-5 mb-6 rounded-2xl sm:flex-row sm:items-center sm:justify-between",
        "bg-secondary text-white"
      )}
    >
      <div className="flex items-start gap-3">
        <Icon path={ICON_PATHS.infoCircle} size="md" className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-primary text-white">
              DEMO
            </span>
            Sample data, no blockchain activity
          </p>
          <p className="text-sm text-white/70 mt-1.5 leading-relaxed">
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
          "transition-colors duration-200 hover:bg-primary-hover"
        )}
      >
        Pilot doc
        <Icon path={ICON_PATHS.externalLink} size="sm" />
      </a>
    </div>
  );
}

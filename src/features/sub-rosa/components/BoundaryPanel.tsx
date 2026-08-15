import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import {
  OFFER_HUB_RESPONSIBILITIES,
  SUB_ROSA_RESPONSIBILITIES,
  SUBROSA_LINKS,
  SUBROSA_TEMPLATE,
} from "../sub-rosa.constants";

interface ColumnProps {
  title: string;
  items: readonly string[];
  accent: "primary" | "secondary";
}

function Column({ title, items, accent }: ColumnProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-background",
        "shadow-[var(--shadow-neumorphic-inset-light)]"
      )}
    >
      <h4
        className={cn(
          "text-sm font-bold mb-3",
          accent === "primary" ? "text-primary" : "text-secondary"
        )}
      >
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
            <Icon
              path={ICON_PATHS.check}
              size="sm"
              className={cn(
                "shrink-0 mt-0.5 w-3.5 h-3.5",
                accent === "primary" ? "text-primary" : "text-secondary"
              )}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The responsibility split, straight from the pilot doc. Worth rendering
 * prominently: the main risk in adopting a protocol layer is quietly handing
 * it decisions that should stay in the marketplace.
 */
export function BoundaryPanel(): React.JSX.Element {
  return (
    <Card padding="lg">
      <h3 className="text-lg font-bold text-text-primary">Where the boundary sits</h3>
      <p className="text-sm text-text-secondary mt-1 mb-5">
        Sub Rosa would supply the sealed proposal layer and nothing else. OFFER HUB keeps its
        marketplace and its selection logic.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Column title="OFFER HUB owns" items={OFFER_HUB_RESPONSIBILITIES} accent="primary" />
        <Column title="Sub Rosa would own" items={SUB_ROSA_RESPONSIBILITIES} accent="secondary" />
      </div>

      <div className="mt-5 pt-5 border-t border-border-light">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">
            Why {SUBROSA_TEMPLATE} and not an auction:
          </span>{" "}
          the cheapest proposal is not the best freelancer. {SUBROSA_TEMPLATE} seals and reveals the
          full set with zero escrow but declares no economic winner, so the client still compares
          experience, approach, timeline and price and makes the call. The selected provider stays
          application-level state and never becomes a protocol result.
        </p>

        <div className="flex flex-wrap gap-4 mt-4">
          <a
            href={SUBROSA_LINKS.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Sub Rosa repository
            <Icon path={ICON_PATHS.externalLink} size="sm" className="w-3.5 h-3.5" />
          </a>
          <a
            href={SUBROSA_LINKS.limitations}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Known limitations
            <Icon path={ICON_PATHS.externalLink} size="sm" className="w-3.5 h-3.5" />
          </a>
          <a
            href={SUBROSA_LINKS.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Integration docs
            <Icon path={ICON_PATHS.externalLink} size="sm" className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </Card>
  );
}

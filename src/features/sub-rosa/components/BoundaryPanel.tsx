import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import {
  OFFER_HUB_RESPONSIBILITIES,
  SUB_ROSA_RESPONSIBILITIES,
  SUBROSA_LINKS,
  SUBROSA_TEMPLATE,
} from "../sub-rosa.constants";
import { ExternalLink, Panel, PanelHeader } from "./ui";

interface ColumnProps {
  title: string;
  items: readonly string[];
  accent: "primary" | "secondary";
}

function Column({ title, items, accent }: ColumnProps): React.JSX.Element {
  const accentText = accent === "primary" ? "text-primary" : "text-text-primary";

  return (
    <div className="rounded-xl bg-background p-5 shadow-[var(--shadow-neumorphic-inset-light)]">
      <h3 className={cn("text-sm font-bold uppercase tracking-wide mb-4", accentText)}>{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-text-primary leading-snug">
            <Icon
              path={ICON_PATHS.checkCircle}
              size="sm"
              className={cn("shrink-0 mt-px", accent === "primary" ? "text-primary" : "text-text-secondary")}
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
    <Panel aria-label="Where the boundary sits">
      <PanelHeader
        iconPath={ICON_PATHS.grid}
        title="Where the boundary sits"
        description="Sub Rosa would supply the sealed proposal layer and nothing else. OFFER HUB keeps its marketplace and its selection logic."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Column title="OFFER HUB owns" items={OFFER_HUB_RESPONSIBILITIES} accent="primary" />
        <Column title="Sub Rosa would own" items={SUB_ROSA_RESPONSIBILITIES} accent="secondary" />
      </div>

      <div className="mt-6 pt-5 border-t border-border-light">
        <h3 className="text-sm font-bold text-text-primary">
          Why {SUBROSA_TEMPLATE} and not an auction
        </h3>
        <p className="text-sm text-text-secondary mt-2 leading-relaxed">
          The cheapest proposal is not the best freelancer. {SUBROSA_TEMPLATE} seals and reveals the
          full set with zero escrow but declares no economic winner, so the client still compares
          experience, approach, timeline and price and makes the call. The selected provider stays
          application-level state and never becomes a protocol result.
        </p>

        <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5">
          <ExternalLink href={SUBROSA_LINKS.repo}>Sub Rosa repository</ExternalLink>
          <ExternalLink href={SUBROSA_LINKS.limitations}>Known limitations</ExternalLink>
          <ExternalLink href={SUBROSA_LINKS.docs}>Integration docs</ExternalLink>
        </div>
      </div>
    </Panel>
  );
}

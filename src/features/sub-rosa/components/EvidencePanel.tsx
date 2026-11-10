import { cn } from "@/lib/cn";
import { ICON_PATHS } from "@/components/ui/Icon";
import { SAMPLE_ONLY, SUBROSA_TEMPLATE } from "../sub-rosa.constants";
import type { EvidenceRow, SealedRound } from "../sub-rosa.types";
import { Badge, Panel, PanelHeader } from "./ui";

interface EvidencePanelProps {
  round: SealedRound;
  revealedCount: number;
  selectedProviderName: string | null;
}

/**
 * Builds the evidence rows.
 *
 * Every field that would carry on-chain proof in a live round resolves to a
 * placeholder here. That is not an oversight — Sub Rosa's own pilot doc
 * requires that sample proposals are never presented as on-chain evidence, so
 * this demo fabricates no round ID, contract ID, transaction hash, signature
 * or receipt.
 */
function buildRows(
  round: SealedRound,
  revealedCount: number,
  selectedProviderName: string | null
): EvidenceRow[] {
  return [
    { label: "Partner workflow", value: "OFFER HUB" },
    { label: "Sub Rosa mode", value: SUBROSA_TEMPLATE },
    { label: "Proposal count", value: String(round.proposals.length) },
    { label: "Revealed", value: `${revealedCount}/${round.proposals.length}` },
    { label: "Selected provider", value: selectedProviderName ?? "Not selected" },
    { label: "Protocol winner", value: `None for ${SUBROSA_TEMPLATE}` },
    { label: "Round ID", value: SAMPLE_ONLY, isUnavailableInSample: true },
    { label: "Contract ID", value: SAMPLE_ONLY, isUnavailableInSample: true },
    { label: "Transaction hash", value: SAMPLE_ONLY, isUnavailableInSample: true },
    { label: "Receipt", value: "Not claimed", isUnavailableInSample: true },
  ];
}

export function EvidencePanel({
  round,
  revealedCount,
  selectedProviderName,
}: EvidencePanelProps): React.JSX.Element {
  const rows = buildRows(round, revealedCount, selectedProviderName);

  return (
    <Panel as="aside" aria-label="Evidence">
      <PanelHeader
        iconPath={ICON_PATHS.shield}
        title="Evidence"
        description="The record a partner or SCF reviewer would be shown after a round."
        aside={<Badge tone="dark">Demo</Badge>}
      />

      <dl className="divide-y divide-border-light">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm text-text-secondary">{row.label}</dt>
            <dd className="min-w-0 text-right">
              {row.isUnavailableInSample ? (
                <span
                  className={cn(
                    "inline-block rounded-md px-2 py-0.5 text-xs font-medium",
                    "bg-background text-text-secondary border border-dashed border-border"
                  )}
                >
                  {row.value}
                </span>
              ) : (
                <span className="text-sm font-semibold text-text-primary break-words">
                  {row.value}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-auto pt-5 text-xs text-text-secondary leading-relaxed">
        A live round fills the dashed rows from signed Stellar responses only. This page has made
        no network call and holds no round state beyond this browser tab.
      </p>
    </Panel>
  );
}

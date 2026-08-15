import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { SAMPLE_ONLY, SUBROSA_TEMPLATE } from "../sub-rosa.constants";
import type { EvidenceRow, SealedRound } from "../sub-rosa.types";

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
    { label: "Round ID", value: SAMPLE_ONLY, isUnavailableInSample: true },
    { label: "Contract ID", value: SAMPLE_ONLY, isUnavailableInSample: true },
    { label: "Transaction hash", value: SAMPLE_ONLY, isUnavailableInSample: true },
    { label: "Receipt", value: "Not claimed", isUnavailableInSample: true },
    { label: "Protocol winner", value: `None for ${SUBROSA_TEMPLATE}` },
  ];
}

export function EvidencePanel({
  round,
  revealedCount,
  selectedProviderName,
}: EvidencePanelProps): React.JSX.Element {
  const rows = buildRows(round, revealedCount, selectedProviderName);

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <Icon path={ICON_PATHS.shield} size="sm" className="text-text-secondary" />
          <h3 className="text-sm font-bold text-text-primary">Evidence</h3>
        </div>
        <span
          className={cn(
            "px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide",
            "bg-secondary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
          )}
        >
          DEMO
        </span>
      </div>
      <p className="text-xs text-text-secondary mb-5">
        The record a partner or SCF reviewer would be shown after a round.
      </p>

      <dl className="divide-y divide-border-light">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-xs text-text-secondary">{row.label}</dt>
            <dd
              className={cn(
                "text-sm text-right",
                row.isUnavailableInSample
                  ? "text-text-secondary italic"
                  : "font-medium text-text-primary"
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-xs text-text-secondary mt-5 pt-4 border-t border-border-light">
        A live round would fill the italic rows from signed Stellar responses only. This page has
        made no network call and holds no round state beyond this browser tab.
      </p>
    </Card>
  );
}

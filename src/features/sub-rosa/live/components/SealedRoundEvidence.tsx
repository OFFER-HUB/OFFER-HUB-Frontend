"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { explorerContractUrl, explorerTxUrl } from "../live.constants";
import { PoweredBySubRosa } from "./SubRosaBadges";
import type { SealedRoundRecord } from "../live.types";

function shorten(value: string, head = 6, tail = 6): string {
  return value.length > head + tail + 1 ? `${value.slice(0, head)}…${value.slice(-tail)}` : value;
}

interface EvidenceRowProps {
  label: string;
  value: string;
  href?: string;
}

function EvidenceRow({ label, value, href }: EvidenceRowProps): React.JSX.Element {
  const body = (
    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-primary">
      {shorten(value)}
      {href && <Icon path={ICON_PATHS.externalLink} size="sm" className="w-3 h-3 text-text-secondary" />}
    </span>
  );
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[11px] uppercase tracking-wider text-text-secondary">{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
          {body}
        </a>
      ) : (
        body
      )}
    </div>
  );
}

/**
 * The real on-chain evidence for a sealed round — round id, contract, network,
 * and the create transaction. Everything here is read from the persisted
 * record; nothing is fabricated (a missing tx hash renders as "—", never a
 * placeholder that looks real).
 */
export function SealedRoundEvidence({
  record,
  statusTag,
  className,
}: {
  record: SealedRoundRecord;
  statusTag?: string;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        "p-4 rounded-2xl bg-background",
        "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
          On-chain evidence
        </h4>
        <PoweredBySubRosa />
      </div>

      <div className="divide-y divide-border-light/50 dark:divide-border-light/10">
        <EvidenceRow label="Round ID" value={record.roundId} />
        <EvidenceRow
          label="Contract"
          value={record.contractId}
          href={explorerContractUrl(record.network, record.contractId)}
        />
        {record.createTxHash ? (
          <EvidenceRow
            label="Create tx"
            value={record.createTxHash}
            href={explorerTxUrl(record.network, record.createTxHash)}
          />
        ) : (
          <EvidenceRow label="Create tx" value="—" />
        )}
        <EvidenceRow label="Network" value={record.network} />
        <EvidenceRow label="Reveal round" value={String(record.revealRound)} />
        {statusTag && <EvidenceRow label="Status" value={statusTag} />}
      </div>
    </div>
  );
}

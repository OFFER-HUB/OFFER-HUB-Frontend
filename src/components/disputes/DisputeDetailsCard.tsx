"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { DISPUTE_REASON_LABELS } from "@/types/dispute.types";
import type { Dispute } from "@/types/dispute.types";

interface ParticipantInfo {
  label: string;
  value: string;
}

interface DisputeDetailsCardProps {
  dispute: Dispute;
  relatedLabel: string;
  relatedLinkLabel: string;
  relatedHref: string;
  participant?: ParticipantInfo;
}

/** The "Dispute Details" card shared by the client and freelancer detail pages. */
export function DisputeDetailsCard({
  dispute,
  relatedLabel,
  relatedLinkLabel,
  relatedHref,
  participant,
}: DisputeDetailsCardProps): React.JSX.Element {
  return (
    <div className={NEUMORPHIC_CARD}>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Dispute Details</h2>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <p className="text-text-secondary text-sm mb-1">Reason</p>
            <p className="text-text-primary font-medium">
              {DISPUTE_REASON_LABELS[dispute.reason]}
            </p>
          </div>
          {participant && (
            <div className="flex-1 min-w-[200px]">
              <p className="text-text-secondary text-sm mb-1">{participant.label}</p>
              <p className="text-text-primary font-medium">{participant.value}</p>
            </div>
          )}
        </div>
        <div>
          <p className="text-text-secondary text-sm mb-1">Description</p>
          <p className="text-text-primary">{dispute.description}</p>
        </div>
        <div>
          <p className="text-text-secondary text-sm mb-1">{relatedLabel}</p>
          <Link
            href={relatedHref}
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Icon path={ICON_PATHS.briefcase} size="sm" />
            {relatedLinkLabel}
          </Link>
        </div>
      </div>

      {dispute.resolution && (
        <div className={cn("mt-4 p-4 rounded-xl", NEUMORPHIC_INSET)}>
          <p className="text-sm font-medium text-success mb-2">Resolution</p>
          <p className="text-text-primary">{dispute.resolution}</p>
        </div>
      )}
    </div>
  );
}
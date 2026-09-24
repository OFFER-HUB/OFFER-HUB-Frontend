"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import { disputePartyName, type AdminDisputeParty } from "@/types/admin.types";

export interface DisputePartyCardProps {
  role: "Buyer" | "Seller";
  party: AdminDisputeParty;
  /** Highlight the side that opened the dispute. */
  openedDispute: boolean;
}

/** The order rows only carry id + email for each side — no username, no history. */
export function DisputePartyCard({ role, party, openedDispute }: DisputePartyCardProps): React.JSX.Element {
  const name = disputePartyName(party);
  return (
    <div className={cn(NEUMORPHIC_INSET, "p-4 rounded-xl")}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">{role}</p>
        {openedDispute && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning">Opened dispute</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
          {name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-text-primary text-sm truncate">{name}</p>
          <p className="text-xs text-text-secondary font-mono truncate">{party.id}</p>
        </div>
      </div>
    </div>
  );
}

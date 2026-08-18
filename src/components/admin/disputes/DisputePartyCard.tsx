import { cn } from "@/lib/cn";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import {
  ADMIN_DISPUTE_STATUS_CONFIG,
  type AdminDisputeParty,
} from "@/types/admin.types";
import { DISPUTE_STATUS_LABELS } from "@/types/dispute.types";

export interface DisputePartyCardProps {
  role: "Buyer" | "Seller";
  party: AdminDisputeParty;
}

export function DisputePartyCard({ role, party }: DisputePartyCardProps): React.JSX.Element {
  return (
    <div className={cn("p-4 rounded-xl", NEUMORPHIC_INSET)}>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
        {role}
      </p>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
          {party.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-text-primary text-sm truncate">{party.username}</p>
          <p className="text-xs text-text-secondary truncate">{party.email}</p>
        </div>
      </div>
      <p className="text-xs text-text-secondary mb-2">
        Total disputes:{" "}
        <span className="text-text-primary font-medium">{party.totalDisputes}</span>
      </p>
      {party.previousDisputes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-secondary mb-1.5">Previous disputes</p>
          <div className="space-y-1.5">
            {party.previousDisputes.map((pd) => {
              const cfg = ADMIN_DISPUTE_STATUS_CONFIG[pd.status];
              return (
                <div key={pd.id} className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary truncate max-w-[120px]" title={pd.offerTitle}>
                    {pd.offerTitle}
                  </span>
                  <span className={cn("font-medium px-1.5 py-0.5 rounded", cfg.color, cfg.bg)}>
                    {DISPUTE_STATUS_LABELS[pd.status]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

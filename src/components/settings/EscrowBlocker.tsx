import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { BlockingEscrow } from "@/lib/api/wallet-claim";

export interface EscrowBlockerProps {
  escrows: BlockingEscrow[];
}

export function EscrowBlocker({ escrows }: EscrowBlockerProps): React.JSX.Element {
  return (
    <div role="alert" className="rounded-2xl border border-warning/30 bg-warning/10 p-4">
      <div className="flex items-start gap-2.5">
        <Icon path={ICON_PATHS.alertTriangle} size="md" className="text-warning shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            Finish your active escrows first
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            The platform still signs releases and refunds with the custodial key. Moving that
            authority now would leave these funds stuck, so the migration stays closed until they
            settle.
          </p>

          {escrows.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {escrows.map((escrow) => (
                <li
                  key={escrow.escrowId}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="font-mono text-text-secondary truncate">{escrow.orderId}</span>
                  <span className="shrink-0 rounded-md bg-background px-2 py-0.5 font-medium text-text-secondary">
                    {escrow.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

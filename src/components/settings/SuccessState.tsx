import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { WalletAddress } from "@/components/ui/WalletAddress";
import type { ClaimWalletResult } from "@/lib/api/wallet-claim";

export interface SuccessStateProps {
  result: ClaimWalletResult;
}

export function SuccessState({ result }: SuccessStateProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
      <div className="flex items-start gap-2.5">
        <Icon path={ICON_PATHS.check} size="md" className="text-success shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            Your wallet is now non-custodial
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Signing authority belongs to your key. The account and its balances are unchanged —
            nothing moved on-chain except who is allowed to sign.
          </p>

          <div className="mt-3">
            <WalletAddress address={result.newSignerPublicKey} showFull />
          </div>

          {result.transactionHash !== null && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${result.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover"
            >
              View the transaction
              <Icon path={ICON_PATHS.externalLink} size="sm" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

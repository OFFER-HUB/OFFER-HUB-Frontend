import { Icon, ICON_PATHS } from "@/components/ui/Icon";

/**
 * OfferHub never holds a user's USDC or signs for them, so there is no in-app
 * "withdraw": the funds are already in the user's own Stellar wallet. This tells
 * them how to move them out, instead of a button that could only fail.
 *
 * Card style matches its neighbours on the wallet page (BalanceChart,
 * WalletMonthlyMetrics): rounded-3xl, raised, p-6, a text-lg bold title.
 */
export function MoveFundsOutCard(): React.JSX.Element {
  return (
    <section
      aria-labelledby="move-funds-out-title"
      className="rounded-3xl bg-white p-6 shadow-[var(--shadow-neumorphic-light)] dark:bg-slate-900 dark:shadow-[var(--shadow-neumorphic-dark)]"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <Icon path={ICON_PATHS.infoCircle} size="sm" />
        </span>
        <div className="min-w-0">
          <h2 id="move-funds-out-title" className="text-lg font-bold text-text-primary">
            Moving funds out
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-text-secondary">
            <li>
              <span className="font-semibold text-text-primary">To another wallet or an exchange:</span>{" "}
              send your USDC from your own wallet app (Freighter, Lobstr or xBull). OfferHub never holds
              it, so there is nothing to withdraw here.
            </li>
            <li>
              <span className="font-semibold text-text-primary">To a bank account:</span> when a client
              releases an order, your payout to the bank account you added starts automatically (Brazil,
              Mexico, Argentina and Colombia). You sign one transfer from your wallet.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

import { cn } from "@/lib/cn";
import { NEUMORPHIC_INSET } from "@/lib/styles";

function formatUsdc(amount: string): string {
  const value = Number(amount);
  return Number.isFinite(value) ? value.toFixed(2) : amount;
}

interface PayoutEstimateProps {
  usdcAmount: string;
  fiatAmount: string | null;
  fiatCurrency: string;
  exchangeRate: string | null | undefined;
  blindpayFeeUsd: string | null | undefined;
}

function formatMoney(amount: string, currency: string): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
  } catch {
    return `${amount} ${currency}`;
  }
}

/**
 * What the bank payout sends and what should reach the bank, shown before the
 * freelancer signs. Values come from the BlindPay quote stored by the API.
 */
export function PayoutEstimate({
  usdcAmount,
  fiatAmount,
  fiatCurrency,
  exchangeRate,
  blindpayFeeUsd,
}: PayoutEstimateProps): React.JSX.Element {
  const rows: { label: string; value: string; strong?: boolean }[] = [
    { label: "You send", value: `${formatUsdc(usdcAmount)} USDC` },
  ];
  if (blindpayFeeUsd) rows.push({ label: "BlindPay fee", value: `$${formatUsdc(blindpayFeeUsd)}` });
  if (exchangeRate) rows.push({ label: "Exchange rate", value: `1 USDC = ${Number(exchangeRate).toFixed(2)} ${fiatCurrency}` });
  if (fiatAmount) rows.push({ label: "Arrives at your bank (est.)", value: formatMoney(fiatAmount, fiatCurrency), strong: true });

  return (
    <dl className={cn(NEUMORPHIC_INSET, "p-4 space-y-2 text-xs")} data-testid="payout-estimate">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between text-text-secondary">
          <dt>{row.label}</dt>
          <dd className={row.strong ? "font-bold text-text-primary font-mono" : "font-semibold text-text-primary font-mono"}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

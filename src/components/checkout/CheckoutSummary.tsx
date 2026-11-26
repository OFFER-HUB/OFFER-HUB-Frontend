"use client";

import { useMemo } from "react";

import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { Order } from "@/types/order.types";
import type { FeeBreakdown } from "@/types/fees.types";

interface CheckoutSummaryProps {
  order?: Order;
  amount?: string;
  feeBreakdown?: FeeBreakdown | null;
  freelancerName?: string;
  paymentDueAt?: string;
}

function formatMoney(value?: string | null): string {
  if (!value) return "0.00";
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toFixed(2);
}

function formatDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function CheckoutSummary(props: CheckoutSummaryProps): React.JSX.Element {
  const order = props.order;
  const amount = order?.amount ?? props.amount ?? "0";
  const fb = (order?.feeBreakdown ?? props.feeBreakdown) ?? undefined;
  const name = props.freelancerName ?? order?.seller?.name ?? order?.seller?.username ?? "Freelancer";
  const paymentDueAt = props.paymentDueAt ?? (order as { paymentDueAt?: string } | undefined)?.paymentDueAt;

  const feesLine = useMemo(() => {
    if (!fb) return null;
    return `${formatMoney(fb.platformFee)} USDC platform · ${formatMoney(fb.trustlessWorkFee)} USDC network`;
  }, [fb]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-[#111827]">Lock the payment</h3>
      <dl className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <dt className="text-text-secondary font-medium">Order price</dt>
          <dd className="font-mono font-bold text-primary">${formatMoney(amount)} USDC</dd>
        </div>
        {fb && (
          <div className="flex items-center justify-between">
            <dt className="text-text-secondary font-medium">Fees (paid from the freelancer's share)</dt>
            <dd className="font-mono text-text-secondary">{feesLine ?? `${formatMoney(fb.totalFees)} USDC`}</dd>
          </div>
        )}
        {fb && (
          <div className="flex items-center justify-between">
            <dt className="text-text-secondary font-medium">{name} receives</dt>
            <dd className="font-mono font-bold text-[#111827]">${formatMoney(fb.netReceived)} USDC</dd>
          </div>
        )}
        {paymentDueAt && (
          <div className="flex items-center justify-between">
            <dt className="text-text-secondary font-medium">Pay by</dt>
            <dd className="font-mono text-text-secondary">{formatDate(paymentDueAt)}</dd>
          </div>
        )}
      </dl>
      <div className="flex items-start gap-2 p-3 rounded-xl bg-background border border-black/5">
        <Icon path={ICON_PATHS.shield} size="sm" className="text-primary mt-0.5" />
        <p className="text-xs text-text-secondary leading-relaxed">
          Funds go into a contract on Stellar. {name} gets paid only when you approve or the review window ends.
        </p>
      </div>
    </div>
  );
}

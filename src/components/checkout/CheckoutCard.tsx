"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { useCheckoutReadiness } from "@/hooks/useCheckoutReadiness";
import { useCheckout } from "@/hooks/useCheckout";
import { CheckoutSummary } from "./CheckoutSummary";
import { CheckoutReadinessList } from "./CheckoutReadinessList";
import { PayButton } from "./PayButton";
import type { Order } from "@/types/order.types";

interface CheckoutCardProps {
  order: Order;
  onPay?: () => void;
}

export function CheckoutCard({ order, onPay }: CheckoutCardProps): React.JSX.Element {
  const readiness = useCheckoutReadiness(order);
  const checkout = useCheckout(order);

  const handlePay = async () => {
    if (onPay) onPay();
    await checkout.pay();
  };

  const isBlocked = readiness.status !== "ready";

  return (
    <div className={cn(NEUMORPHIC_CARD, "p-6 border border-white/80 space-y-5")}>
      <CheckoutSummary order={order} />
      <CheckoutReadinessList
        issues={readiness.issues}
        onFix={() => {}}
        primaryAddress={order.buyer?.wallet?.publicKey}
        amount={order.amount}
      />
      <PayButton
        amount={order.amount}
        disabled={isBlocked}
        isChecking={readiness.status === "checking"}
        onPay={() => void handlePay()}
      />
    </div>
  );
}

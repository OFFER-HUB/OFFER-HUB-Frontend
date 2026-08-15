import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { ORDER_STATUS_CONFIG, type Order, type OrderStatus } from "@/types/order.types";

const FALLBACK_STATUS_STYLE = {
  color: "text-text-secondary",
  bg: "bg-text-secondary/10",
};

/** Status styling, tolerating a status the frontend does not know yet. */
function resolveStatusStyle(status: OrderStatus): { color: string; bg: string } {
  return ORDER_STATUS_CONFIG[status] ?? FALLBACK_STATUS_STYLE;
}

interface OrderSummaryHeaderProps {
  order: Order;
  /** Step wording for the pill — the lifecycle label, not the raw status. */
  statusLabel: string;
}

/**
 * Title, short id, amount and current status of the order.
 */
export function OrderSummaryHeader({
  order,
  statusLabel,
}: OrderSummaryHeaderProps): React.JSX.Element {
  const statusStyle = resolveStatusStyle(order.status);
  const amount = parseFloat(order.amount);

  return (
    <div className={NEUMORPHIC_CARD}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">{order.title}</h1>
          <p className="text-text-secondary text-sm">Order #{order.id?.slice(-8) || "N/A"}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-text-secondary">Amount</p>
            <p className="text-2xl font-bold text-primary">${amount.toFixed(2)}</p>
          </div>
          <span
            className={cn(
              "px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap",
              statusStyle.bg,
              statusStyle.color
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

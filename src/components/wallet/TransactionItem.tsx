import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { WalletTransactionRow, WalletTransactionType } from "@/lib/api/wallet";

type TransactionItemVariant = "table" | "card";

interface TransactionItemProps {
  transaction: WalletTransactionRow;
  currency: string;
  showRunningBalance: boolean;
  variant: TransactionItemVariant;
}

const TYPE_CONFIG: Record<
  WalletTransactionType,
  {
    label: string;
    icon: string;
    badgeClass: string;
    amountClass: string;
    prefix: string;
  }
> = {
  credit: {
    label: "Credit",
    icon: ICON_PATHS.plus,
    badgeClass: "bg-success/15 text-success",
    amountClass: "text-success",
    prefix: "+",
  },
  debit: {
    label: "Debit",
    icon: ICON_PATHS.shoppingCart,
    badgeClass: "bg-error/10 text-error",
    amountClass: "text-text-primary",
    prefix: "−",
  },
  reserve: {
    label: "Reserve",
    icon: ICON_PATHS.clock,
    badgeClass: "bg-warning/15 text-warning",
    amountClass: "text-warning",
    prefix: "−",
  },
};

function formatMoney(amount: string, currency: string): string {
  const value = Number.parseFloat(amount);
  if (Number.isNaN(value)) return amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderOrderLink(orderId?: string | null): React.JSX.Element | null {
  if (!orderId) return null;

  return (
    <Link
      href={`/app/orders/${orderId}`}
      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
    >
      <Icon path={ICON_PATHS.externalLink} size="sm" />
      Related order
    </Link>
  );
}

export function getTransactionGroupLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function TransactionItem({
  transaction,
  currency,
  showRunningBalance,
  variant,
}: TransactionItemProps): React.JSX.Element {
  const config = TYPE_CONFIG[transaction.type];
  const amount = `${config.prefix}${formatMoney(transaction.amount, currency)}`;
  const orderLink = renderOrderLink(transaction.orderId);

  if (variant === "table") {
    return (
      <tr className="border-t border-gray-100 align-top hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-4 whitespace-nowrap">
          <span
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
              config.badgeClass
            )}
          >
            <Icon path={config.icon} size="sm" />
            {config.label}
          </span>
        </td>
        <td className="px-4 py-4 min-w-[260px]">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text-primary">{transaction.description}</p>
            {orderLink}
          </div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
          {formatDateTime(transaction.createdAt)}
        </td>
        <td className={cn("px-4 py-4 whitespace-nowrap text-sm font-semibold", config.amountClass)}>
          {amount}
        </td>
        {showRunningBalance ? (
          <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
            {transaction.balanceAfter ? formatMoney(transaction.balanceAfter, currency) : "—"}
          </td>
        ) : null}
      </tr>
    );
  }

  return (
    <article
      className={cn(
        "rounded-2xl p-4 bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
              config.badgeClass
            )}
          >
            <Icon path={config.icon} size="md" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{transaction.description}</p>
            <p className="text-xs text-text-secondary mt-1">{formatDateTime(transaction.createdAt)}</p>
          </div>
        </div>
        <span className={cn("text-sm font-semibold shrink-0", config.amountClass)}>{amount}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
            config.badgeClass
          )}
        >
          {config.label}
        </span>
        {showRunningBalance && transaction.balanceAfter ? (
          <span className="text-xs text-text-secondary">
            Balance: {formatMoney(transaction.balanceAfter, currency)}
          </span>
        ) : null}
      </div>

      {orderLink ? <div className="mt-3">{orderLink}</div> : null}
    </article>
  );
}
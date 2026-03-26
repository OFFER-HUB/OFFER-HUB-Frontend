import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/ui/EmptyState";
import { ICON_PATHS } from "@/components/ui/Icon";
import type { WalletTransactionRow } from "@/lib/api/wallet";
import { TransactionItem, getTransactionGroupLabel } from "./TransactionItem";

interface TransactionListProps {
  transactions: WalletTransactionRow[];
  currency: string;
  showRunningBalance: boolean;
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

interface TransactionGroup {
  label: string;
  transactions: WalletTransactionRow[];
}

function LoadingRows({ showRunningBalance }: { showRunningBalance: boolean }): React.JSX.Element {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]">
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-3">
            <div className="h-10 rounded-xl bg-gray-100" />
            <div className="h-10 rounded-xl bg-gray-100 col-span-2" />
            <div className="h-10 rounded-xl bg-gray-100" />
            {showRunningBalance ? <div className="hidden" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function groupTransactions(transactions: WalletTransactionRow[]): TransactionGroup[] {
  const map = new Map<string, WalletTransactionRow[]>();

  for (const transaction of transactions) {
    const label = getTransactionGroupLabel(transaction.createdAt);
    const group = map.get(label);
    if (group) {
      group.push(transaction);
    } else {
      map.set(label, [transaction]);
    }
  }

  return Array.from(map.entries()).map(([label, items]) => ({
    label,
    transactions: items,
  }));
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}): React.JSX.Element | null {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 pt-2" aria-label="Transaction pages">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-xl bg-white text-sm font-medium text-text-primary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] disabled:opacity-50"
      >
        Previous
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={cn(
            "min-w-10 px-3 py-2 rounded-xl text-sm font-semibold transition-all",
            page === currentPage
              ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
              : "bg-white text-text-primary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
          )}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-xl bg-white text-sm font-medium text-text-primary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] disabled:opacity-50"
      >
        Next
      </button>
    </nav>
  );
}

export function TransactionList({
  transactions,
  currency,
  showRunningBalance,
  isLoading = false,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: TransactionListProps): React.JSX.Element {
  if (isLoading) {
    return <LoadingRows showRunningBalance={showRunningBalance} />;
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-4 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]">
        <EmptyState
          icon={ICON_PATHS.currency}
          title="No transactions found"
          message="Try adjusting your filters, search term, or date range."
        />
      </div>
    );
  }

  const groups = groupTransactions(transactions);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm text-text-secondary">
          Showing {start}-{end} of {totalItems} transactions
        </p>
        <p className="text-sm text-text-secondary">Grouped by transaction date</p>
      </div>

      {groups.map((group) => (
        <section key={group.label} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base sm:text-lg font-bold text-text-primary">{group.label}</h2>
            <span className="text-xs sm:text-sm text-text-secondary">
              {group.transactions.length} transaction{group.transactions.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="hidden md:block rounded-3xl bg-white overflow-x-auto shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
                    Amount
                  </th>
                  {showRunningBalance ? (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
                      Running balance
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {group.transactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    currency={currency}
                    showRunningBalance={showRunningBalance}
                    variant="table"
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-3 md:hidden">
            {group.transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                currency={currency}
                showRunningBalance={showRunningBalance}
                variant="card"
              />
            ))}
          </div>
        </section>
      ))}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
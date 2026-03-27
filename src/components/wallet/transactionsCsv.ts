import type { WalletTransactionRow, WalletTransactionsData } from "@/lib/api/wallet";

function csvEscape(cell: string): string {
  if (/[",\n\r]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
}

function row(cells: string[]): string {
  return cells.map(csvEscape).join(",");
}

export function buildWalletTransactionsCsv(data: WalletTransactionsData): string {
  const lines: string[] = [];

  lines.push(row(["OFFER HUB - Wallet transactions export"]));
  lines.push(row(["Currency", data.currency]));
  lines.push(row(["Transaction count", String(data.transactions.length)]));
  lines.push("");
  lines.push(
    row([
      "Date",
      "Type",
      "Amount",
      "Description",
      "Related order",
      "Running balance",
    ])
  );

  for (const transaction of data.transactions) {
    lines.push(
      row([
        transaction.createdAt,
        transaction.type,
        transaction.amount,
        transaction.description,
        transaction.orderId ?? "",
        transaction.balanceAfter ?? "",
      ])
    );
  }

  return lines.join("\n");
}

export function downloadWalletTransactionsCsv(
  transactions: WalletTransactionRow[],
  currency: string,
  filename: string,
  runningBalanceAvailable: boolean
): void {
  const content =
    "\uFEFF" +
    buildWalletTransactionsCsv({
      currency,
      transactions,
      runningBalanceAvailable,
    });
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
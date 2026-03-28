import type { FreelancerEarningsAnalytics } from "@/lib/api/earnings";

function csvEscape(cell: string): string {
  const s = String(cell);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function row(cells: string[]): string {
  return cells.map(csvEscape).join(",");
}

/**
 * Builds a CSV string for the current analytics payload (UTF-8 with BOM for Excel).
 */
export function buildEarningsAnalyticsCsv(data: FreelancerEarningsAnalytics): string {
  const lines: string[] = [];
  const { currency } = data;

  lines.push(row(["OFFER HUB - Earnings export"]));
  lines.push(row(["Currency", currency]));
  lines.push("");
  lines.push(row(["Totals"]));
  lines.push(row(["This month", data.totals.thisMonth]));
  lines.push(row(["This year", data.totals.thisYear]));
  lines.push(row(["All time", data.totals.allTime]));
  lines.push("");
  lines.push(row(["Selected period"]));
  lines.push(row(["Start", data.currentPeriod.start]));
  lines.push(row(["End", data.currentPeriod.end]));
  lines.push(row(["Total earnings", data.currentPeriod.totalEarnings]));
  lines.push(row(["Order count", String(data.currentPeriod.orderCount)]));
  lines.push(row(["Average order value", data.currentPeriod.averageOrderValue]));
  lines.push("");
  lines.push(row(["Previous period (comparison)"]));
  lines.push(row(["Start", data.previousPeriod.start]));
  lines.push(row(["End", data.previousPeriod.end]));
  lines.push(row(["Total earnings", data.previousPeriod.totalEarnings]));
  lines.push(row(["Order count", String(data.previousPeriod.orderCount)]));
  lines.push(row(["Average order value", data.previousPeriod.averageOrderValue]));
  lines.push("");
  lines.push(row(["Monthly (selected range)"]));
  lines.push(row(["Month", "Earnings", "Orders"]));
  for (const m of data.monthly) {
    lines.push(row([m.label, String(m.earnings), String(m.orderCount)]));
  }
  lines.push("");
  lines.push(row(["Top clients"]));
  lines.push(row(["Client", "Earnings", "Orders"]));
  for (const c of data.byClient) {
    lines.push(row([c.clientName, String(c.earnings), String(c.orderCount)]));
  }
  lines.push("");
  lines.push(row(["By category"]));
  lines.push(row(["Category", "Earnings", "Orders"]));
  for (const c of data.byCategory) {
    lines.push(row([c.categoryLabel, String(c.earnings), String(c.orderCount)]));
  }

  return lines.join("\n");
}

export function downloadEarningsCsv(data: FreelancerEarningsAnalytics, filename: string): void {
  const bom = "\uFEFF";
  const content = bom + buildEarningsAnalyticsCsv(data);
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

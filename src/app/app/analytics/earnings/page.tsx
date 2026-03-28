"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useModeStore } from "@/stores/mode-store";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import {
  buildMockEarningsAnalytics,
  getFreelancerEarningsAnalytics,
  type FreelancerEarningsAnalytics,
} from "@/lib/api/earnings";
import {
  EarningsBreakdown,
  EarningsChart,
  EarningsPageSkeleton,
  downloadEarningsCsv,
} from "@/components/analytics";

function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type PresetId = "custom" | "30d" | "90d" | "12m" | "ytd" | "all";

function getRangeForPreset(preset: Exclude<PresetId, "custom">): { start: string; end: string } {
  const end = new Date();
  const endStr = toLocalISODate(end);

  if (preset === "30d") {
    const s = new Date(end);
    s.setDate(s.getDate() - 29);
    return { start: toLocalISODate(s), end: endStr };
  }
  if (preset === "90d") {
    const s = new Date(end);
    s.setDate(s.getDate() - 89);
    return { start: toLocalISODate(s), end: endStr };
  }
  if (preset === "12m") {
    const s = new Date(end.getFullYear(), end.getMonth() - 11, 1);
    return { start: toLocalISODate(s), end: endStr };
  }
  if (preset === "ytd") {
    const s = new Date(end.getFullYear(), 0, 1);
    return { start: toLocalISODate(s), end: endStr };
  }
  const s = new Date(end.getFullYear() - 3, 0, 1);
  return { start: toLocalISODate(s), end: endStr };
}

function parseMoney(s: string): number {
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}

function pctChange(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((current - prev) / prev) * 100;
}

function formatPct(p: number): string {
  const sign = p > 0 ? "+" : "";
  return `${sign}${p.toFixed(1)}%`;
}

const CARD = cn(
  "p-5 rounded-3xl bg-white",
  "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
);

export default function EarningsAnalyticsPage(): React.JSX.Element {
  const { setMode } = useModeStore();
  const token = useAuthStore((s) => s.token);

  const initialRange = useMemo(() => getRangeForPreset("12m"), []);
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [activePreset, setActivePreset] = useState<PresetId>("12m");

  const [data, setData] = useState<FreelancerEarningsAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setMode("freelancer");
  }, [setMode]);

  const load = useCallback(async () => {
    if (!token) {
      setData(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await getFreelancerEarningsAnalytics(token, { startDate, endDate });
      setData(res);
      setIsDemo(false);
    } catch {
      setData(buildMockEarningsAnalytics(startDate, endDate));
      setIsDemo(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, startDate, endDate]);

  useEffect(() => {
    setIsLoading(true);
    void load();
  }, [load]);

  function applyPreset(p: Exclude<PresetId, "custom">): void {
    const r = getRangeForPreset(p);
    setStartDate(r.start);
    setEndDate(r.end);
    setActivePreset(p);
  }

  function onCustomStart(v: string): void {
    setStartDate(v);
    setActivePreset("custom");
  }

  function onCustomEnd(v: string): void {
    setEndDate(v);
    setActivePreset("custom");
  }

  function refresh(): void {
    if (!token) return;
    setIsRefreshing(true);
    void load();
  }

  function exportCsv(): void {
    if (!data) return;
    const fname = `offer-hub-earnings-${startDate}-to-${endDate}.csv`;
    downloadEarningsCsv(data, fname);
  }

  if (!token) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <Icon path={ICON_PATHS.lock} size="xl" className="mx-auto text-text-secondary mb-4" />
        <h1 className="text-xl font-bold text-text-primary mb-2">Earnings analytics</h1>
        <p className="text-text-secondary mb-6">Sign in to view income trends and breakdowns.</p>
        <Link
          href="/login?redirect=/app/analytics/earnings"
          className={cn(
            "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium",
            "bg-primary text-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
          )}
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (isLoading || !data) {
    return <EarningsPageSkeleton />;
  }

  const curTotal = parseMoney(data.currentPeriod.totalEarnings);
  const prevTotal = parseMoney(data.previousPeriod.totalEarnings);
  const totalDelta = pctChange(curTotal, prevTotal);

  const curAov = parseMoney(data.currentPeriod.averageOrderValue);
  const prevAov = parseMoney(data.previousPeriod.averageOrderValue);
  const aovDelta = pctChange(curAov, prevAov);

  const goal = data.monthlyGoal ? parseMoney(data.monthlyGoal) : 0;
  const thisMonthNum = parseMoney(data.totals.thisMonth);
  const goalPct = goal > 0 ? Math.min(100, Math.round((thisMonthNum / goal) * 100)) : null;

  const fmt = (amount: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data.currency,
    }).format(parseMoney(amount));

  const presets: { id: Exclude<PresetId, "custom">; label: string }[] = [
    { id: "30d", label: "30 days" },
    { id: "90d", label: "90 days" },
    { id: "12m", label: "12 months" },
    { id: "ytd", label: "Year to date" },
    { id: "all", label: "All time" },
  ];

  return (
    <div className="page-full-height max-w-6xl mx-auto pb-10">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Earnings analytics</h1>
          <p className="text-sm text-text-secondary mt-1">
            Track income, compare periods, and spot trends
            {isDemo ? " · sample data until the API responds" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => refresh()}
            disabled={isRefreshing}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
              "bg-white text-text-primary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "disabled:opacity-60"
            )}
          >
            <Icon path={ICON_PATHS.refresh} size="sm" className={cn(isRefreshing && "animate-spin")} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => exportCsv()}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
              "bg-background text-text-primary",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
            )}
          >
            <Icon path={ICON_PATHS.document} size="sm" />
            Export CSV
          </button>
        </div>
      </div>

      <div className={cn(CARD, "p-5 sm:p-6 mb-6")}>
        <p className="text-sm font-semibold text-text-primary mb-3">Date range</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                activePreset === p.id
                  ? "bg-primary text-white border-primary"
                  : "border-border-light bg-white text-text-secondary hover:text-text-primary"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-text-secondary">Start</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onCustomStart(e.target.value)}
              className={cn(
                "rounded-xl border border-border-light px-3 py-2.5",
                "text-text-primary bg-white",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              )}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-text-secondary">End</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => onCustomEnd(e.target.value)}
              className={cn(
                "rounded-xl border border-border-light px-3 py-2.5",
                "text-text-primary bg-white",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              )}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className={CARD}>
          <p className="text-sm font-medium text-text-secondary mb-1">This month</p>
          <p className="text-2xl font-bold text-text-primary tabular-nums">{fmt(data.totals.thisMonth)}</p>
        </div>
        <div className={CARD}>
          <p className="text-sm font-medium text-text-secondary mb-1">This year</p>
          <p className="text-2xl font-bold text-text-primary tabular-nums">{fmt(data.totals.thisYear)}</p>
        </div>
        <div className={CARD}>
          <p className="text-sm font-medium text-text-secondary mb-1">All time</p>
          <p className="text-2xl font-bold text-text-primary tabular-nums">{fmt(data.totals.allTime)}</p>
        </div>
        <div className={CARD}>
          <p className="text-sm font-medium text-text-secondary mb-1">Avg. order value</p>
          <p className="text-2xl font-bold text-text-primary tabular-nums">
            {fmt(data.currentPeriod.averageOrderValue)}
          </p>
          <p className="text-xs text-text-secondary mt-1">In selected range</p>
        </div>
      </div>

      <div className={cn(CARD, "mb-6")}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-text-secondary">Selected range total</p>
            <p className="text-3xl font-bold text-text-primary tabular-nums mt-1">
              {fmt(data.currentPeriod.totalEarnings)}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {data.currentPeriod.orderCount}{" "}
              {data.currentPeriod.orderCount === 1 ? "completed order" : "completed orders"} ·{" "}
              {data.currentPeriod.start} to {data.currentPeriod.end}
            </p>
          </div>
          <div className="rounded-2xl bg-background px-4 py-3 min-w-[200px]">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">vs previous period</p>
            {totalDelta !== null ? (
              <p
                className={cn(
                  "text-lg font-bold mt-1 tabular-nums",
                  totalDelta >= 0 ? "text-success" : "text-error"
                )}
              >
                {formatPct(totalDelta)} revenue
              </p>
            ) : (
              <p className="text-sm text-text-secondary mt-1">No prior period to compare</p>
            )}
            {aovDelta !== null ? (
              <p className={cn("text-sm mt-2", aovDelta >= 0 ? "text-success" : "text-error")}>
                AOV {formatPct(aovDelta)}
              </p>
            ) : null}
            <p className="text-xs text-text-secondary mt-2">
              Previous: {fmt(data.previousPeriod.totalEarnings)} · {data.previousPeriod.start} –{" "}
              {data.previousPeriod.end}
            </p>
          </div>
        </div>
      </div>

      {goal > 0 ? (
        <div className={cn(CARD, "mb-6")}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">Monthly goal</p>
              <p className="text-sm text-text-secondary mt-1">
                {fmt(data.monthlyGoal!)} target · this month {fmt(data.totals.thisMonth)}
              </p>
            </div>
            {goalPct !== null ? (
              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>Progress</span>
                  <span>{goalPct}%</span>
                </div>
                <div
                  className={cn(
                    "h-3 rounded-full overflow-hidden",
                    "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                  )}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${goalPct}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={cn("mb-6", isRefreshing && "opacity-70 pointer-events-none transition-opacity")}>
        <EarningsChart
          data={data.monthly}
          currency={data.currency}
          monthlyGoal={data.monthlyGoal}
        />
      </div>

      <EarningsBreakdown
        byClient={data.byClient}
        byCategory={data.byCategory}
        currency={data.currency}
        className="mb-6"
      />

      <p className="text-xs text-text-secondary text-center">
        Amounts in {data.currency}. Export includes totals, monthly buckets, clients, and categories for the
        current view.
      </p>
    </div>
  );
}

"use client";

import { MapStats as MapStatsType } from "./types";

interface MapStatsProps {
  stats: MapStatsType;
}

export function MapStats({ stats }: MapStatsProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-3xl bg-white p-6 md:p-8 shadow-[var(--shadow-neumorphic-light)]">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <StatItem
            value={stats.totalMembers}
            label="Members"
            highlight
          />
          <StatDivider />
          <StatItem
            value={stats.totalCountries}
            label="Countries"
          />
          <StatDivider />
          <StatItem
            value={stats.freelancersCount}
            label="Freelancers"
            color="primary"
          />
          <StatDivider />
          <StatItem
            value={stats.clientsCount}
            label="Clients"
            color="primary"
          />
        </div>
      </div>
    </div>
  );
}

interface StatItemProps {
  value: number;
  label: string;
  highlight?: boolean;
  color?: "primary";
}

function StatItem({ value, label, highlight, color }: StatItemProps) {
  const valueClasses = highlight
    ? "text-text-primary"
    : color === "primary"
    ? "text-primary"
    : "text-text-secondary";

  return (
    <div className="text-center">
      <p className={`text-2xl md:text-3xl font-bold ${valueClasses}`}>
        {value.toLocaleString()}
      </p>
      <p className="text-sm text-text-secondary mt-1">{label}</p>
    </div>
  );
}

function StatDivider() {
  return (
    <div className="hidden md:block w-px h-10 bg-border-light" />
  );
}

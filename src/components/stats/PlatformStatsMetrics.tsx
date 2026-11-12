import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { PlatformStatsSummary } from "@/types/stats.types";

interface PlatformStatsMetricsProps {
  summary: PlatformStatsSummary;
}

const METRICS = [
  {
    key: "users",
    label: "Registered Users",
    icon: ICON_PATHS.users,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    key: "wallets",
    label: "Stellar Wallets",
    icon: ICON_PATHS.creditCard,
    iconClass: "bg-success/10 text-success",
  },
  {
    key: "escrows",
    label: "Escrows Created",
    icon: ICON_PATHS.lock,
    iconClass: "bg-warning/10 text-warning",
  },
  {
    key: "transactions",
    label: "On-chain Transactions",
    icon: ICON_PATHS.refresh,
    iconClass: "bg-accent/10 text-accent",
  },
] as const;

export function PlatformStatsMetrics({ summary }: PlatformStatsMetricsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {METRICS.map(({ key, label, icon, iconClass }) => (
        <div
          key={key}
          className="flex flex-col items-center rounded-3xl bg-white p-6 text-center shadow-[var(--shadow-neumorphic-light)] transition-transform duration-300 hover:-translate-y-1"
        >
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}>
            <Icon path={icon} size="lg" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-text-primary">
            {summary[key].toLocaleString()}
          </span>
          <span className="mt-1 text-sm font-semibold text-text-secondary">{label}</span>
        </div>
      ))}
    </div>
  );
}

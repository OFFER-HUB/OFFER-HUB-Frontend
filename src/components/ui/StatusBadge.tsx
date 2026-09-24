import { cn } from "@/lib/cn";
import { STATUS_CONFIG, type OfferStatus } from "@/types/client-offer.types";

interface StatusBadgeProps {
  status: OfferStatus;
}

export function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium",
        config.color,
        config.bg
      )}
    >
      {config.label}
    </span>
  );
}

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";

/** Suspense fallback for the client and freelancer dispute list pages. */
export function DisputesListLoadingFallback(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-background rounded animate-pulse" />
          <div className="h-5 w-48 bg-background rounded animate-pulse" />
        </div>
      </div>
      <div className={cn(NEUMORPHIC_CARD, "h-14 animate-pulse")} />
      <div className={cn(NEUMORPHIC_CARD, "h-32 animate-pulse")} />
      <div className={cn(NEUMORPHIC_CARD, "h-32 animate-pulse")} />
    </div>
  );
}
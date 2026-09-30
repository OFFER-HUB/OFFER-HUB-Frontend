import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";

/** Suspense fallback for the client and freelancer open-dispute pages. */
export function DisputeFormLoadingFallback(): React.JSX.Element {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-background animate-pulse" />
        <div className="space-y-2">
          <div className="h-7 w-48 bg-background rounded animate-pulse" />
          <div className="h-5 w-64 bg-background rounded animate-pulse" />
        </div>
      </div>
      <div className={cn(NEUMORPHIC_CARD, "h-48 animate-pulse")} />
      <div className={cn(NEUMORPHIC_CARD, "h-64 animate-pulse")} />
    </div>
  );
}
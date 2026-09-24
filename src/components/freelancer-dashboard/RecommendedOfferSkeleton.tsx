import { cn } from "@/lib/cn";
import { NEUMORPHIC_INSET } from "@/lib/styles";

export function RecommendedOfferSkeleton(): React.JSX.Element {
  return (
    <div className={cn(NEUMORPHIC_INSET, "p-4 rounded-xl animate-pulse")}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-2/5" />
        <div className="h-6 bg-gray-200 rounded-lg w-20" />
      </div>
    </div>
  );
}

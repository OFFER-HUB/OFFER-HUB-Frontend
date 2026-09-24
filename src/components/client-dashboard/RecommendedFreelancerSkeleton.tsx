import { cn } from "@/lib/cn";
import { NEUMORPHIC_INSET } from "@/lib/styles";

export function RecommendedFreelancerSkeleton(): React.JSX.Element {
  return (
    <div className={cn(NEUMORPHIC_INSET, "p-4 rounded-xl animate-pulse")}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-6 bg-gray-200 rounded-lg w-20" />
    </div>
  );
}

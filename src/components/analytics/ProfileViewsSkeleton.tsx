import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";

export function ProfileViewsSkeleton(): React.JSX.Element {
  return (
    <div className={cn(NEUMORPHIC_CARD, "animate-pulse space-y-6")}>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-44 rounded bg-gray-200" />
          <div className="h-4 w-60 rounded bg-gray-200" />
        </div>
        <div className="h-12 w-32 rounded-2xl bg-gray-200" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl bg-gray-200 p-5 h-28" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="h-72 rounded-2xl bg-gray-200" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 rounded-2xl bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

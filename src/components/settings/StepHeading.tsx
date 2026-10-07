import { cn } from "@/lib/cn";

export interface StepHeadingProps {
  n: number;
  title: string;
}

export function StepHeading({ n, title }: StepHeadingProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2.5 mb-1.5">
      <span
        className={cn(
          "w-6 h-6 rounded-lg shrink-0 flex items-center justify-center",
          "bg-primary/10 text-primary text-xs font-bold"
        )}
      >
        {n}
      </span>
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
    </div>
  );
}

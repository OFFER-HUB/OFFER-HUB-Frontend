import { cn } from "@/lib/cn";
import { LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD } from "@/lib/styles";

interface LoadingStateProps {
  message?: string;
  variant?: "default" | "card" | "inline" | "fullscreen";
}

export function LoadingState({
  message = "Loading...",
  variant = "default",
}: LoadingStateProps): React.JSX.Element {
  if (variant === "inline") {
    return (
      <div className="flex items-center gap-3 p-4" role="status">
        <LoadingSpinner size="md" className="text-primary" />
        <p className="text-text-secondary">{message}</p>
      </div>
    );
  }

  if (variant === "fullscreen") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        role="status"
      >
        <div className="text-center">
          <LoadingSpinner size="xl" className="text-primary mx-auto mb-4" />
          <p className="text-text-secondary">{message}</p>
        </div>
      </div>
    );
  }

  const content = (
    <>
      <LoadingSpinner size="xl" className="text-primary mx-auto mb-4" />
      <p className="text-text-secondary">{message}</p>
    </>
  );

  if (variant === "card") {
    return (
      <div className={cn(NEUMORPHIC_CARD, "text-center py-12")} role="status">
        {content}
      </div>
    );
  }

  return (
    <div className="text-center py-12" role="status">
      {content}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string;
  height?: string;
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
}: SkeletonProps): React.JSX.Element {
  const baseStyles = "animate-pulse bg-gray-200 rounded";

  const variantStyles = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton(): React.JSX.Element {
  return (
    <div className={cn(NEUMORPHIC_CARD, "space-y-4")} aria-hidden="true">
      <Skeleton variant="text" className="w-1/3 h-6" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-2/3" />
    </div>
  );
}

export function ListItemSkeleton(): React.JSX.Element {
  return (
    <div className="flex items-center gap-4 p-4" aria-hidden="true">
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-1/4 h-4" />
        <Skeleton variant="text" className="w-1/2 h-3" />
      </div>
    </div>
  );
}

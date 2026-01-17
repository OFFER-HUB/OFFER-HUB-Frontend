"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, PRIMARY_BUTTON } from "@/lib/styles";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: "default" | "card" | "inline";
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading the content. Please try again.",
  onRetry,
  retryLabel = "Try Again",
  variant = "default",
}: ErrorStateProps): React.JSX.Element {
  const content = (
    <>
      <div
        className={cn(
          "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
          "bg-error/10"
        )}
      >
        <Icon
          path={ICON_PATHS.alertCircle}
          size="xl"
          className="text-error"
          ariaHidden
        />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary mb-4 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={cn(PRIMARY_BUTTON, "inline-flex items-center gap-2")}
        >
          <Icon path={ICON_PATHS.refresh} size="sm" ariaHidden />
          {retryLabel}
        </button>
      )}
    </>
  );

  if (variant === "inline") {
    return (
      <div
        className="flex items-center gap-3 p-4 rounded-xl bg-error/10 text-error"
        role="alert"
      >
        <Icon path={ICON_PATHS.alertCircle} size="md" ariaHidden />
        <p className="flex-1">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1 text-sm font-medium hover:underline"
          >
            <Icon path={ICON_PATHS.refresh} size="sm" ariaHidden />
            {retryLabel}
          </button>
        )}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn(NEUMORPHIC_CARD, "text-center py-8")} role="alert">
        {content}
      </div>
    );
  }

  return (
    <div className="text-center py-12" role="alert">
      {content}
    </div>
  );
}

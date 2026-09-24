import { cn } from "@/lib/cn";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { ReviewResponse as ReviewResponseType } from "@/types/review.types";

interface ReviewResponseProps {
  response: ReviewResponseType;
  responderName: string;
}

export function ReviewResponse({
  response,
  responderName,
}: ReviewResponseProps): React.JSX.Element {
  return (
    <div className={cn("mt-4 rounded-2xl p-4", NEUMORPHIC_INSET)}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon path={ICON_PATHS.chat} size="sm" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-text-primary">{responderName} responded</p>
            <p className="text-sm text-text-secondary">
              {new Date(response.createdAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
            {response.content}
          </p>
        </div>
      </div>
    </div>
  );
}

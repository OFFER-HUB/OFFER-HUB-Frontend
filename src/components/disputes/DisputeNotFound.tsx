"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD } from "@/lib/styles";

interface DisputeNotFoundProps {
  backHref: string;
  backLabel?: string;
}

/** Full-width "Dispute not found" panel shared by the client and freelancer detail pages. */
export function DisputeNotFound({ backHref, backLabel = "Back to Disputes" }: DisputeNotFoundProps): React.JSX.Element {
  const filledPrimaryButton = cn(
    "px-5 py-2.5 rounded-xl font-medium cursor-pointer",
    "bg-primary text-white",
    "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
    "hover:bg-primary-hover",
    "transition-all duration-200"
  );

  return (
    <div className="flex items-center justify-center py-12">
      <div className={cn(NEUMORPHIC_CARD, "text-center max-w-md")}>
        <div
          className={cn(
            "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center",
            "bg-background",
            "shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
          )}
        >
          <Icon path={ICON_PATHS.flag} size="xl" className="text-text-secondary" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Dispute not found</h2>
        <p className="text-text-secondary mb-4">
          The dispute you are looking for does not exist or has been removed.
        </p>
        <Link href={backHref} className={filledPrimaryButton}>
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

const EMPTY_DESCRIPTION_LABEL = "No project brief was provided for this order.";

interface OrderDescriptionCardProps {
  description: string | null | undefined;
}

export function OrderDescriptionCard({
  description,
}: OrderDescriptionCardProps): React.JSX.Element {
  return (
    <div className={cn(NEUMORPHIC_CARD, "p-6 sm:p-7")}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-black/5">
        <Icon path={ICON_PATHS.document} size="sm" className="text-primary" />
        <h2 className="text-base font-bold text-[#111827]">
          Project Brief & Instructions
        </h2>
      </div>

      <div className="p-4 rounded-2xl bg-white/60 shadow-[inset_2px_2px_4px_#e2e8f0,inset_-2px_-2px_4px_#ffffff] border border-white/80">
        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap break-words font-normal">
          {description?.trim() || EMPTY_DESCRIPTION_LABEL}
        </p>
      </div>

      <p className="text-[11px] text-text-secondary mt-3 flex items-center gap-1.5">
        <Icon path={ICON_PATHS.infoCircle} size="sm" className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span>Use the order workspace chat to send additional files or clarifications.</span>
      </p>
    </div>
  );
}

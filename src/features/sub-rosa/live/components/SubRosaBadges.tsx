"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { POWERED_BY, SEALED_BADGE, SUBROSA_LINKS } from "../live.constants";

/**
 * "Powered by Sub Rosa" attribution. Small, unobtrusive, links to the repo.
 * Placed next to the sealed-proposals toggle and controls.
 */
export function PoweredBySubRosa({ className }: { className?: string }): React.JSX.Element {
  return (
    <a
      href={SUBROSA_LINKS.repo}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary",
        "hover:text-primary transition-colors",
        className,
      )}
    >
      <Icon path={ICON_PATHS.lock} size="sm" className="w-3 h-3" />
      {POWERED_BY}
    </a>
  );
}

/**
 * "Sealed with Sub Rosa" pill, shown on offers / proposals that carry a live
 * sealed round.
 */
export function SealedBadge({ className }: { className?: string }): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold",
        "bg-primary/15 text-primary border border-primary/30",
        className,
      )}
    >
      <Icon path={ICON_PATHS.shield} size="sm" className="w-3.5 h-3.5" />
      {SEALED_BADGE}
    </span>
  );
}

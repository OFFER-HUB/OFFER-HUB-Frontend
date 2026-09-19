"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_INPUT } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { DEADLINE_PRESETS, MIN_LEAD_SECS, presetToDate } from "../deadline";
import { SEALED_TOGGLE_HINT, SEALED_TOGGLE_LABEL } from "../live.constants";
import { PoweredBySubRosa } from "./SubRosaBadges";

export interface SealedProposalsToggleProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  /** Chosen proposal deadline, or null if none selected yet. */
  deadline: Date | null;
  onDeadlineChange: (deadline: Date | null) => void;
  /** Shown when the client isn't wallet-connected (opening a round needs it). */
  walletConnected: boolean;
  disabled?: boolean;
}

/** Format a Date for a <input type="datetime-local"> value (local time). */
function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/**
 * The client-facing control for turning an offer into a sealed-proposal round.
 * The client chooses *when proposals close* as a real date/time (or a quick
 * preset); the Drand round math is derived downstream — the client never sees
 * a round number.
 */
export function SealedProposalsToggle({
  enabled,
  onEnabledChange,
  deadline,
  onDeadlineChange,
  walletConnected,
  disabled = false,
}: SealedProposalsToggleProps): React.JSX.Element {
  // Computed once at mount (reading the clock in render breaks purity rules).
  const [minValue] = useState(() =>
    toLocalInputValue(new Date(Date.now() + MIN_LEAD_SECS * 1000)),
  );

  return (
    <div className="space-y-4 pt-2 border-t border-border-light/60 dark:border-border-light/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon path={ICON_PATHS.lock} size="sm" className="text-primary shrink-0" />
            <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              {SEALED_TOGGLE_LABEL}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-secondary">{SEALED_TOGGLE_HINT}</p>
          <PoweredBySubRosa className="mt-1.5" />
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={SEALED_TOGGLE_LABEL}
          disabled={disabled}
          onClick={() => onEnabledChange(!enabled)}
          className={cn(
            "relative w-12 h-7 rounded-full shrink-0 transition-colors duration-200",
            enabled ? "bg-primary" : "bg-background",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          )}
        >
          <span
            className={cn(
              "absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
              enabled && "translate-x-5",
            )}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-3">
          {!walletConnected && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-warning/10 border border-warning/30 text-warning text-xs font-medium">
              <Icon path={ICON_PATHS.alertTriangle} size="sm" className="shrink-0 mt-0.5" />
              <span>Connect your Stellar wallet — opening a sealed round needs one signature.</span>
            </div>
          )}

          <div>
            <label
              htmlFor="sealed-deadline"
              className="block text-[11px] font-semibold text-text-primary uppercase tracking-wider mb-1.5"
            >
              Proposals close at
            </label>
            <input
              id="sealed-deadline"
              type="datetime-local"
              min={minValue}
              value={deadline ? toLocalInputValue(deadline) : ""}
              onChange={(e) => {
                const v = e.target.value;
                onDeadlineChange(v ? new Date(v) : null);
              }}
              className={cn(NEUMORPHIC_INPUT, "text-sm")}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {DEADLINE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onDeadlineChange(presetToDate(preset.seconds))}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  "bg-background text-text-secondary hover:text-primary hover:bg-white",
                  "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] dark:shadow-[2px_2px_4px_#0a0f1a,-2px_-2px_4px_#1e2a4a]",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {deadline && (
            <p className="text-[11px] text-text-secondary flex items-center gap-1">
              <Icon path={ICON_PATHS.clock} size="sm" className="w-3 h-3" />
              Proposals reveal together after{" "}
              <span className="font-semibold text-text-primary">{deadline.toLocaleString()}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

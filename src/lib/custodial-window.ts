import type { CustodialReadOnlyWindow } from "@/types/wallet.types";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface CustodialWindowNotice {
  /** `open` while the user can still claim; `closed` once the remaining keys are destroyed. */
  state: "open" | "closed";
  expiresOn: string;
  cutoverOn: string;
  daysLeft: number;
}

function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** The sandbox read-only window as the banner states it. Whole days, rounded up, never negative. */
export function describeCustodialWindow(
  window: CustodialReadOnlyWindow,
  now: number = Date.now()
): CustodialWindowNotice {
  const expiresAt = Date.parse(window.expiresAt);
  const remaining = expiresAt - now;
  return {
    state: remaining > 0 ? "open" : "closed",
    expiresOn: formatDay(window.expiresAt),
    cutoverOn: formatDay(window.cutoverAt),
    daysLeft: Math.max(0, Math.ceil(remaining / DAY_MS)),
  };
}

/**
 * Turns a client-chosen proposal deadline (a real date/time) into the Drand
 * round coordinates the Round contract needs. The client never sees or enters
 * a Drand round — they pick "when do proposals close" and this derives the
 * rest.
 *
 * Contract invariants enforced here so create_round_v2 can't revert
 * (see contracts/round/src/lib.rs:84-91):
 *   commit_deadline < time(reveal_round) < reveal_deadline
 *   commit_deadline > now
 *   reveal_deadline - now <= 30 days
 */

import { chainInfo, drandRoundTime, quicknet, roundInSeconds } from "@sub-rosa/sdk";

/** How long after the reveal round publishes that reveals stay accepted. */
export const REVEAL_WINDOW_SECS = 24 * 60 * 60;

/** Contract's MAX_ROUND_DURATION_SECS. reveal_deadline - now must be under this. */
export const MAX_ROUND_DURATION_SECS = 30 * 24 * 60 * 60;

/** Smallest deadline we allow in the future, so commit_deadline > now holds
 *  with margin for clock skew and the round-creation transaction itself. */
// Quicknet publishes every few seconds. One minute is enough margin for the
// create transaction while still allowing short end-to-end demo rounds.
export const MIN_LEAD_SECS = 60;

/** Quick-select presets, in seconds from "now". The client can also pick a
 *  custom date/time. Labels are what the UI shows. */
export const DEADLINE_PRESETS: ReadonlyArray<{ label: string; seconds: number }> = [
  { label: "1 hour", seconds: 60 * 60 },
  { label: "6 hours", seconds: 6 * 60 * 60 },
  { label: "24 hours", seconds: 24 * 60 * 60 },
  { label: "3 days", seconds: 3 * 24 * 60 * 60 },
  { label: "7 days", seconds: 7 * 24 * 60 * 60 },
];

export interface DrandDeadline {
  /** Drand round R whose signature unseals proposals. */
  revealRound: number;
  /** Unix seconds — submissions close here (the client's chosen deadline). */
  commitDeadline: number;
  /** Unix seconds — reveal transactions accepted until here. */
  revealDeadline: number;
  /** Unix seconds time(R) is scheduled to publish. For display/countdown. */
  revealRoundAt: number;
}

export class DeadlineError extends Error {}

/**
 * Derive Drand coordinates for a chosen proposal deadline.
 *
 * @param deadline When proposals should close. Must be at least MIN_LEAD_SECS
 *   in the future and within (30 days - reveal window) so the reveal deadline
 *   stays under the contract cap.
 */
export async function deriveDrandDeadline(deadline: Date): Promise<DrandDeadline> {
  const nowMs = Date.now();
  const commitMs = deadline.getTime();
  if (!Number.isFinite(commitMs)) {
    throw new DeadlineError("Invalid deadline date.");
  }
  const leadSecs = (commitMs - nowMs) / 1000;
  if (leadSecs < MIN_LEAD_SECS) {
    throw new DeadlineError(
      "Deadline must be at least one minute in the future so the round can open in time.",
    );
  }
  if (leadSecs + REVEAL_WINDOW_SECS > MAX_ROUND_DURATION_SECS) {
    throw new DeadlineError(
      "Deadline is too far out. Sealed proposals support up to ~29 days ahead.",
    );
  }

  const commitDeadline = Math.floor(commitMs / 1000);

  const drand = quicknet();
  const info = await chainInfo(drand);

  // First Drand round scheduled at or after the deadline, plus one period of
  // margin, so time(reveal_round) is strictly after commit_deadline even at a
  // period boundary or under small clock skew.
  const secondsUntilReveal = leadSecs + info.period;
  const revealRound = await roundInSeconds(drand, Math.max(0, secondsUntilReveal));

  let revealRoundAt = drandRoundTime(revealRound, info);
  let round = revealRound;
  // Defensive: guarantee the strict inequality the contract checks.
  while (revealRoundAt <= commitDeadline) {
    round += 1;
    revealRoundAt = drandRoundTime(round, info);
  }

  const revealDeadline = revealRoundAt + REVEAL_WINDOW_SECS;

  return {
    revealRound: round,
    commitDeadline,
    revealDeadline,
    revealRoundAt,
  };
}

/** Resolve a preset (seconds-from-now) to a concrete Date. */
export function presetToDate(seconds: number, from: Date = new Date()): Date {
  return new Date(from.getTime() + seconds * 1000);
}

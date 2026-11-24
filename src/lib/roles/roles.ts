import type { UserMode } from "@/stores/mode-store";
import type { User } from "@/types/user.types";

export type AccountType = NonNullable<User["type"]>;

/**
 * Area of the app an account type can use.
 * `BOTH` and accounts without a type (older accounts) can use both areas.
 */
export function canUseMode(type: AccountType | undefined, mode: UserMode): boolean {
  if (type === "BUYER") return mode === "client";
  if (type === "SELLER") return mode === "freelancer";
  return true;
}

/** Mode a user should land in right after choosing an account type. */
export function initialModeForType(type: AccountType): UserMode {
  return type === "BUYER" ? "client" : "freelancer";
}

export function dashboardForMode(mode: UserMode): string {
  return mode === "client" ? "/app/client/dashboard" : "/app/freelancer/dashboard";
}

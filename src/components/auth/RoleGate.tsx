"use client";

import Link from "next/link";
import { canUseMode, dashboardForMode } from "@/lib/roles/roles";
import { useAuthStore } from "@/stores/auth-store";
import type { UserMode } from "@/stores/mode-store";

interface RoleGateProps {
  /** Area of the app the wrapped pages belong to. */
  mode: UserMode;
  children: React.ReactNode;
}

const COPY: Record<UserMode, { title: string; body: string; link: string; target: UserMode }> = {
  client: {
    title: "This area is for clients",
    body: "Your account is registered as a freelancer, so you cannot publish offers or hire from here.",
    link: "Go to my freelancer dashboard",
    target: "freelancer",
  },
  freelancer: {
    title: "This area is for freelancers",
    body: "Your account is registered as a client, so you cannot create services or apply to offers from here.",
    link: "Go to my client dashboard",
    target: "client",
  },
};

/**
 * Shows the wrapped pages only when the signed-in account may use this area.
 * Accounts of type BOTH, and accounts with no type, can use both areas.
 * While the session is not loaded yet the children render, so a hard reload
 * never flashes the message.
 */
export function RoleGate({ mode, children }: RoleGateProps): React.JSX.Element {
  const user = useAuthStore((state) => state.user);

  if (!user || canUseMode(user.type, mode)) {
    return <>{children}</>;
  }

  const copy = COPY[mode];

  return (
    <div role="alert" className="mx-auto max-w-lg p-8 text-center">
      <h1 className="text-2xl font-bold text-text-primary">{copy.title}</h1>
      <p className="mt-2 text-text-secondary">{copy.body}</p>
      <Link
        href={dashboardForMode(copy.target)}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-medium text-white"
      >
        {copy.link}
      </Link>
    </div>
  );
}

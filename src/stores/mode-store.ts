import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserMode = "freelancer" | "client";

interface ModeState {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
  toggleMode: () => void;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set, get) => ({
      mode: "freelancer",
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set({ mode: get().mode === "freelancer" ? "client" : "freelancer" }),
    }),
    {
      name: "mode-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export interface NavigationItem {
  href: string;
  label: string;
  icon: string;
}

const DASHBOARD_ITEM: NavigationItem = {
  href: "/app/dashboard",
  label: "Dashboard",
  icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
};

const MESSAGES_ITEM: NavigationItem = {
  href: "/app/messages",
  label: "Messages",
  icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
};

const PROFILE_ITEM: NavigationItem = {
  href: "/app/profile",
  label: "Profile",
  icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
};

const FREELANCER_ITEMS: NavigationItem[] = [
  {
    href: "/app/projects",
    label: "Find Projects",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    href: "/app/proposals",
    label: "My Proposals",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    href: "/app/earnings",
    label: "Earnings",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

const CLIENT_ITEMS: NavigationItem[] = [
  {
    href: "/app/my-projects",
    label: "My Projects",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
  {
    href: "/app/post-project",
    label: "Post Project",
    icon: "M12 4v16m8-8H4",
  },
  {
    href: "/app/freelancers",
    label: "Find Freelancers",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    href: "/app/payments",
    label: "Payments",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
];

export function getNavigationItems(mode: UserMode): NavigationItem[] {
  const modeSpecificItems = mode === "freelancer" ? FREELANCER_ITEMS : CLIENT_ITEMS;
  return [DASHBOARD_ITEM, ...modeSpecificItems, MESSAGES_ITEM, PROFILE_ITEM];
}

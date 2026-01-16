import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ICON_PATHS } from "@/components/ui/Icon";

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

const FREELANCER_NAV_ITEMS: NavigationItem[] = [
  { href: "/app/freelancer/dashboard", label: "Dashboard", icon: ICON_PATHS.home },
  { href: "/app/freelancer/services", label: "My Services", icon: ICON_PATHS.briefcase },
  { href: "/app/projects", label: "Find Projects", icon: ICON_PATHS.search },
  { href: "/app/proposals", label: "My Proposals", icon: ICON_PATHS.document },
  { href: "/app/earnings", label: "Earnings", icon: ICON_PATHS.currency },
  { href: "/app/freelancer/disputes", label: "Disputes", icon: ICON_PATHS.flag },
  { href: "/app/chat", label: "Messages", icon: ICON_PATHS.chat },
  { href: "/app/freelancer/profile", label: "Profile", icon: ICON_PATHS.user },
  { href: "/app/freelancer/portfolio", label: "Portfolio", icon: ICON_PATHS.image },
];

const CLIENT_NAV_ITEMS: NavigationItem[] = [
  { href: "/app/client/dashboard", label: "Client Dashboard", icon: ICON_PATHS.home },
  { href: "/app/client/offers", label: "Manage Offers", icon: ICON_PATHS.briefcase },
  { href: "/app/client/offers/new", label: "Create Offer", icon: ICON_PATHS.plus },
  { href: "/app/freelancers", label: "Find Freelancers", icon: ICON_PATHS.users },
  { href: "/app/payments", label: "Payments", icon: ICON_PATHS.creditCard },
  { href: "/app/disputes", label: "Disputes", icon: ICON_PATHS.flag },
  { href: "/app/chat", label: "Messages", icon: ICON_PATHS.chat },
  { href: "/app/profile", label: "Profile", icon: ICON_PATHS.user },
];

export function getNavigationItems(mode: UserMode): NavigationItem[] {
  return mode === "client" ? CLIENT_NAV_ITEMS : FREELANCER_NAV_ITEMS;
}
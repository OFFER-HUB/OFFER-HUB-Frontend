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

const SHARED_ITEMS: NavigationItem[] = [
  { href: "/app/chat", label: "Messages", icon: ICON_PATHS.chat },
  { href: "/app/profile", label: "Profile", icon: ICON_PATHS.user },
];

const FREELANCER_NAV_ITEMS: NavigationItem[] = [
  { href: "/app/dashboard", label: "Dashboard", icon: ICON_PATHS.home },
  { href: "/app/projects", label: "Find Projects", icon: ICON_PATHS.search },
  { href: "/app/proposals", label: "My Proposals", icon: ICON_PATHS.document },
  { href: "/app/earnings", label: "Earnings", icon: ICON_PATHS.currency },
];

const CLIENT_NAV_ITEMS: NavigationItem[] = [
  { href: "/app/client/dashboard", label: "Client Dashboard", icon: ICON_PATHS.home },
  { href: "/app/client/offers", label: "Manage Offers", icon: ICON_PATHS.briefcase },
  { href: "/app/client/offers/new", label: "Create Offer", icon: ICON_PATHS.plus },
  { href: "/app/freelancers", label: "Find Freelancers", icon: ICON_PATHS.users },
  { href: "/app/payments", label: "Payments", icon: ICON_PATHS.creditCard },
  { href: "/app/disputes", label: "Disputes", icon: ICON_PATHS.flag },
];

export function getNavigationItems(mode: UserMode): NavigationItem[] {
  const modeItems = mode === "client" ? CLIENT_NAV_ITEMS : FREELANCER_NAV_ITEMS;
  return [...modeItems, ...SHARED_ITEMS];
}

import { createJSONStorage, persist } from "zustand/middleware";

import { ICON_PATHS } from "@/components/ui/Icon";
import { create } from "zustand";

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
  { href: "/app/analytics/earnings", label: "Earnings", icon: ICON_PATHS.chartBar },
  { href: "/app/wallet", label: "Wallet", icon: ICON_PATHS.creditCard },
  { href: "/app/orders", label: "Orders", icon: ICON_PATHS.shoppingCart },
  { href: "/app/freelancer/services", label: "My Services", icon: ICON_PATHS.briefcase },
  { href: "/app/freelancer/disputes", label: "Disputes", icon: ICON_PATHS.flag },
  { href: "/app/messages", label: "Messages", icon: ICON_PATHS.chat },
  { href: "/app/profile", label: "Profile", icon: ICON_PATHS.user },
  { href: "/app/freelancer/portfolio", label: "Portfolio", icon: ICON_PATHS.image },
];

const CLIENT_NAV_ITEMS: NavigationItem[] = [
  { href: "/app/client/dashboard", label: "Dashboard", icon: ICON_PATHS.home },
  { href: "/app/wallet", label: "Wallet", icon: ICON_PATHS.creditCard },
  { href: "/app/orders", label: "Orders", icon: ICON_PATHS.shoppingCart },
  { href: "/app/client/offers", label: "Manage Offers", icon: ICON_PATHS.briefcase },
  { href: "/app/client/offers/new", label: "Create Offer", icon: ICON_PATHS.plus },
  { href: "/app/client/purchases", label: "My Purchases", icon: ICON_PATHS.currency },
  { href: "/app/disputes", label: "Disputes", icon: ICON_PATHS.flag },
  { href: "/app/messages", label: "Messages", icon: ICON_PATHS.chat },
  { href: "/app/profile", label: "Profile", icon: ICON_PATHS.user },
];

export function getNavigationItems (mode: UserMode): NavigationItem[] {
  return mode === "client" ? CLIENT_NAV_ITEMS : FREELANCER_NAV_ITEMS;
}
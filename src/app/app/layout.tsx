import type { Metadata } from "next";
import { AppLayoutClient } from "@/components/app-shell/AppLayoutClient";

// All app pages should not be indexed by search engines
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps): React.JSX.Element {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}

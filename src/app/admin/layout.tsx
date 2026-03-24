import type { Metadata } from "next";
import { AppLayoutClient } from "@/components/app-shell/AppLayoutClient";

// Admin routes must not be indexed by search engines
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps): React.JSX.Element {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}

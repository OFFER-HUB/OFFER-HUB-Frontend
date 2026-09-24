import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Earnings analytics",
  description: "Track freelancer income, trends, and breakdowns on OFFER HUB.",
  path: "/app/analytics/earnings",
});

export default function EarningsAnalyticsLayout({ children }: { children: ReactNode }) {
  return children;
}

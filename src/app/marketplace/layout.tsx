import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Marketplace",
  description:
    "Browse thousands of skilled freelancers and services on OFFER HUB Marketplace. Find the perfect match for your project needs.",
  path: "/marketplace",
});

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

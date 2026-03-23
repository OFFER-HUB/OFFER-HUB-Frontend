import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Search",
  description:
    "Search offers, services, and freelancers on OFFER HUB with advanced filters, sorting, and saved recent queries.",
  path: "/search",
});

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <>{children}</>;
}

import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Help Center",
  description:
    "Get help with OFFER HUB. Find guides, tutorials, and support resources to make the most of our freelance marketplace.",
  path: "/help",
});

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

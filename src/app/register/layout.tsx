import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Create Account",
  description:
    "Join OFFER HUB today and start your freelancing journey or find the perfect talent for your projects. Free to sign up.",
  path: "/register",
  noIndex: true, // Auth pages should not be indexed
});

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

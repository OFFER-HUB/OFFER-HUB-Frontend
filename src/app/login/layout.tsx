import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Login",
  description:
    "Sign in to your OFFER HUB account to access your dashboard, manage projects, and connect with clients or freelancers.",
  path: "/login",
  noIndex: true, // Auth pages should not be indexed
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

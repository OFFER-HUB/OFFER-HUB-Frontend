import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";

export const metadata: Metadata = generatePageMetadata({
  title: "Complete your profile",
  description: "Finish setting up your OfferHub account to start using the marketplace.",
  path: "/onboarding",
  noIndex: true,
});

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingGuard>{children}</OnboardingGuard>;
}

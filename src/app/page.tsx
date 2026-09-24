import type { Metadata } from "next";
import dynamic from "next/dynamic";
import {
  Footer,
  HeroSection,
  Navbar,
  TrustedBy,
} from "@/components/landing";
import { generatePageMetadata } from "@/lib/seo";

// Lazy load below-the-fold sections for better initial page load
const ExperienceSection = dynamic(
  () => import("@/components/landing").then((mod) => mod.ExperienceSection),
  { loading: () => <SectionSkeleton /> }
);

const FeaturesSection = dynamic(
  () => import("@/components/landing").then((mod) => mod.FeaturesSection),
  { loading: () => <SectionSkeleton /> }
);

const HowItWorks = dynamic(
  () => import("@/components/landing").then((mod) => mod.HowItWorks),
  { loading: () => <SectionSkeleton /> }
);

const CTASection = dynamic(
  () => import("@/components/landing").then((mod) => mod.CTASection),
  { loading: () => <SectionSkeleton /> }
);

function SectionSkeleton() {
  return (
    <div className="py-16 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export const metadata: Metadata = generatePageMetadata({
  title: "OFFER HUB",
  description:
    "Connect with top freelancers and clients on OFFER HUB. Find talented professionals, post projects, and grow your business with our trusted marketplace platform.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TrustedBy />
        <ExperienceSection />
        <FeaturesSection />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

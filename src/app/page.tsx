import {
  CTASection,
  ExperienceSection,
  FeaturesSection,
  Footer,
  HeroSection,
  HowItWorks,
  Navbar,
  TrustedBy,
} from "@/components/landing";

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

"use client";

import { AnimatedSection, Container, StaggeredChildren } from "@/components/ui";
import { BentoCard, BentoGrid } from "@/components/bento";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  size?: "small" | "medium" | "large" | "wide" | "tall";
}

const features: Feature[] = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "Find Top Talent",
    description: "Browse through thousands of skilled freelancers. Filter by skills, ratings, and experience to find your perfect match.",
    size: "medium",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Secure Payments",
    description: "Protected transactions with escrow. Pay only when you're satisfied with the delivered work.",
    size: "medium",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Direct Communication",
    description: "Chat directly with freelancers. Share files, discuss requirements, and collaborate seamlessly.",
    size: "medium",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Track Progress",
    description: "Monitor project milestones, manage deadlines, and stay updated on deliverables in real-time.",
    size: "medium",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-12 lg:py-16 bg-background">
      <Container>
        <AnimatedSection animation="fade-up" duration={700}>
          <div className="text-center mb-8 lg:mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
              Everything you need to{" "}
              <span className="text-primary">succeed</span>
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Powerful features to help you hire faster, work smarter, and grow your business.
            </p>
          </div>
        </AnimatedSection>

        <StaggeredChildren staggerDelay={120} duration={600}>
          <BentoGrid columns={4}>
            {features.map((feature, index) => (
              <BentoCard
                key={index}
                size={feature.size}
                className="group hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm">
                  {feature.description}
                </p>
              </BentoCard>
            ))}
          </BentoGrid>
        </StaggeredChildren>
      </Container>
    </section>
  );
}

"use client";

import { AnimatedSection, Container, StaggeredChildren } from "@/components/ui";

const features = [
  {
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    title: "Free Transfers",
    description: "Send payments to freelancers worldwide with zero transfer fees and competitive exchange rates.",
  },
  {
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    title: "Escrow Protection",
    description: "Your funds are held securely until work is approved. Release payment only when you're satisfied.",
  },
  {
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Unmatched Security",
    description: "Enterprise-grade security with two-factor authentication, encryption, and fraud protection.",
  },
];

export function ExperienceSection() {
  return (
    <section className="relative pb-12 lg:pb-16 bg-transparent pt-6 lg:pt-8">
      <Container>
        <AnimatedSection animation="scale" duration={800}>
          <div className="rounded-2xl bg-white p-6 lg:p-10 shadow-[var(--shadow-neumorphic-light)]">
            {/* Header */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8 lg:mb-10">
              <AnimatedSection animation="fade-right" delay={200}>
                <div>
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 block">
                    Why OFFER-HUB
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-bold text-text-primary leading-tight">
                    Experience that grows with your scale.
                  </h2>
                </div>
              </AnimatedSection>
              <AnimatedSection animation="fade-left" delay={300}>
                <div className="flex items-center">
                  <p className="text-text-secondary lg:text-lg">
                    Build your freelance business or find the perfect talent with a platform designed for growth, security, and seamless collaboration.
                  </p>
                </div>
              </AnimatedSection>
            </div>

            {/* Features Grid */}
            <StaggeredChildren
              className="grid md:grid-cols-3 gap-8 lg:gap-12"
              staggerDelay={150}
              duration={700}
            >
              {features.map((feature, index) => (
                <div key={index} className="space-y-4">
                  <div className="text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              ))}
            </StaggeredChildren>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

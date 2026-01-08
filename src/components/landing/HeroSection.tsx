"use client";

import { AnimatedSection, Button, Container, Input } from "@/components/ui";
import { HeroShowcase } from "./HeroShowcase";

export function HeroSection() {
  return (
    <section className="pt-16 lg:pt-24 pb-[18rem] lg:pb-[26rem] bg-background">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <AnimatedSection animation="fade-up" duration={800}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
                Find talent,{" "}
                <span className="text-primary">hire smart</span>{" "}
                grow your business.
              </h1>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={150} duration={800}>
              <p className="text-lg text-text-secondary max-w-lg">
                Connect with skilled freelancers worldwide. Simple hiring,
                secure payments, and powerful tools to manage your projects.
              </p>
            </AnimatedSection>

            {/* CTA Form */}
            <AnimatedSection animation="fade-up" delay={300} duration={800}>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Your business email"
                  />
                </div>
                <Button
                  variant="primary"
                  size="md"
                  icon={
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  }
                >
                  Get Started
                </Button>
              </div>
            </AnimatedSection>
          </div>

          {/* Right Content - Showcase */}
          <AnimatedSection animation="fade-left" delay={200} duration={900}>
            <div className="flex justify-center lg:justify-end">
              <HeroShowcase />
            </div>
          </AnimatedSection>
        </div>
      </Container>
    </section>
  );
}

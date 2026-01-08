"use client";

import Link from "next/link";
import { AnimatedSection, Button, Container } from "@/components/ui";

export function CTASection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Top fade - blends with section above */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent z-10" />

      {/* Bottom fade - blends with footer below */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />

      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10" />

      {/* Animated decorative blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-accent/15 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-primary/15 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />

      <Container>
        <div className="relative text-center max-w-2xl mx-auto">
          <AnimatedSection animation="scale" duration={600}>
            <span className="inline-block px-4 py-1.5 rounded-xl bg-white text-primary text-sm font-medium mb-6 shadow-[var(--shadow-neumorphic-light)]">
              Simplify Your Workflow
            </span>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={100} duration={700}>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
              Want to know more about{" "}
              <span className="text-primary">OFFER-HUB</span>?
            </h2>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200} duration={700}>
            <p className="text-text-secondary mb-8 leading-relaxed text-lg">
              Book a free demo and learn more about OFFER-HUB, its offerings and use-cases.
              We would love to help you with all your queries.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={300} duration={700}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register">
                <Button variant="primary" size="lg">
                  Book a demo
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="lg">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </Container>
    </section>
  );
}

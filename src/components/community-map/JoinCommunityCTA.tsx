"use client";

import Link from "next/link";
import { AnimatedSection, Button, Container } from "@/components/ui";

export function JoinCommunityCTA() {
  return (
    <section className="relative py-16 lg:py-20 overflow-hidden">
      {/* Top fade transition */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent z-10" />

      {/* Gradient background - similar to CTASection but light mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10" />

      {/* Animated blobs (subtle) */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />

      <Container>
        <div className="relative">
          <AnimatedSection animation="fade-up" duration={700}>
            <div className="max-w-3xl mx-auto text-center rounded-3xl bg-white p-8 lg:p-12 shadow-[var(--shadow-neumorphic-light)]">
              <span className="inline-block px-4 py-1.5 rounded-xl bg-primary/10 text-primary text-sm font-medium mb-4">
                Join Our Community
              </span>

              <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                Want to appear on the map?
              </h2>

              <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                Showcase your location to potential clients and fellow freelancers.
                Update your profile settings to join our global community map.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/app/profile">
                  <Button variant="primary" size="lg">
                    Update Profile
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg">
                    Sign Up Now
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </Container>
    </section>
  );
}

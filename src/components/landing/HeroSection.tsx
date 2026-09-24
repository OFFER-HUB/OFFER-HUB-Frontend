"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedSection, Button, Container, Input } from "@/components/ui";
import { HeroShowcase } from "./HeroShowcase";

export function HeroSection() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    router.push(`/register?email=${encodeURIComponent(email)}`);
  };

  return (
    <section className="pt-16 lg:pt-24 pb-[18rem] lg:pb-[26rem] bg-background">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <AnimatedSection animation="fade-up" duration={800}>
              {/* Headline with balanced, rhythmic line breaks */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
                Find talent,<br />
                <span className="text-primary">hire smart</span>,<br />
                grow your business.
              </h1>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={150} duration={800}>
              <p className="text-lg text-text-secondary max-w-lg leading-relaxed">
                Connect with skilled freelancers worldwide. Simple hiring,
                secure payments, and powerful tools to manage your projects.
              </p>
            </AnimatedSection>

            {/* Neumorphic CTA Form */}
            <AnimatedSection animation="fade-up" delay={300} duration={800}>
              <div className="space-y-5">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Your business email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
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
                </form>

                {/* Neumorphic Trust Micro-Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-medium text-text-secondary">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]">
                    <svg
                      className="h-3.5 w-3.5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Stellar Smart Escrow</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]">
                    <svg
                      className="h-3.5 w-3.5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Vetted Talent</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]">
                    <svg
                      className="h-3.5 w-3.5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Zero Hidden Fees</span>
                  </div>
                </div>
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

"use client";

import { AnimatedSection, Container, StaggeredChildren } from "@/components/ui";

const steps = [
  {
    number: 1,
    title: "Post a Project",
    description:
      "Describe your project and the skills you're looking for to find the perfect match.",
  },
  {
    number: 2,
    title: "Review Proposals",
    description:
      "Browse through proposals from talented freelancers and select the best fit.",
  },
  {
    number: 3,
    title: "Collaborate & Pay",
    description:
      "Work together seamlessly and release payment when you're satisfied with the results.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-20 bg-background">
      <Container>
        <AnimatedSection animation="fade-up" duration={700}>
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-3">
              How OFFER-HUB Works
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Simple steps to find the perfect freelancer or get hired for your skills
            </p>
          </div>
        </AnimatedSection>

        <StaggeredChildren
          className="grid md:grid-cols-3 gap-8 lg:gap-12"
          staggerDelay={200}
          duration={700}
        >
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white text-xl font-bold mb-5">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </StaggeredChildren>
      </Container>
    </section>
  );
}

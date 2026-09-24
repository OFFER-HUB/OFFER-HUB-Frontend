"use client";

import Link from "next/link";
import { Navbar } from "@/components/landing";
import { ContactForm, SupportResources, ContactMethods } from "@/components/help";
import { cn } from "@/lib/cn";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1
              className={cn(
                "text-3xl sm:text-4xl font-bold text-text-primary mb-4",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationFillMode: "forwards" }}
            >
              How can we help you?
            </h1>
            <p
              className={cn(
                "text-text-secondary max-w-2xl mx-auto mb-6",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
            >
              Get the support you need. Browse our resources or reach out to our team.
            </p>
            <Link
              href="/faq"
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium",
                "bg-primary/10 text-primary",
                "hover:bg-primary hover:text-white",
                "transition-all duration-200",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Browse FAQ
            </Link>
          </div>

          {/* Support Resources */}
          <section className="mb-12">
            <h2
              className={cn(
                "text-lg font-bold text-text-primary mb-6",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
            >
              Resources
            </h2>
            <SupportResources />
          </section>

          {/* Contact Section */}
          <section>
            <h2
              className={cn(
                "text-lg font-bold text-text-primary mb-6",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
            >
              Contact Us
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
              >
                <ContactForm />
              </div>
              <div
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
              >
                <ContactMethods />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

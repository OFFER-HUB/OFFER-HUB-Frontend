"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing";
import { FAQCategoryTabs, FAQAccordion } from "@/components/faq";
import { faqCategories } from "@/data/faq.data";
import { cn } from "@/lib/cn";

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(faqCategories[0].id);

  const activeCategoryData = faqCategories.find(
    (cat) => cat.id === activeCategory
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1
              className={cn(
                "text-3xl sm:text-4xl font-bold text-text-primary mb-4",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationFillMode: "forwards" }}
            >
              Frequently Asked Questions
            </h1>
            <p
              className={cn(
                "text-text-secondary max-w-2xl mx-auto",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
            >
              Find answers to common questions about OFFER HUB. Can&apos;t find
              what you&apos;re looking for? Contact our support team.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="mb-10">
            <FAQCategoryTabs
              categories={faqCategories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </div>

          {/* FAQ Items */}
          {activeCategoryData && (
            <div key={activeCategory}>
              <FAQAccordion items={activeCategoryData.items} />
            </div>
          )}

          {/* Contact Support Section */}
          <div
            className={cn(
              "mt-12 p-8 rounded-3xl bg-white text-center",
              "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
              "opacity-0 animate-fade-in-up"
            )}
            style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
          >
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Still have questions?
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Our support team is here to help you with any questions or
              concerns.
            </p>
            <button
              className={cn(
                "px-6 py-3 rounded-xl font-medium",
                "bg-primary text-white",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "hover:bg-primary-hover hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]",
                "transition-all duration-200"
              )}
            >
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

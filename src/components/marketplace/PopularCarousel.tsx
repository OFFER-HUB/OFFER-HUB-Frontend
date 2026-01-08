"use client";

import { useRef, useState, useEffect } from "react";
import type { Offer } from "@/types/marketplace.types";
import { PopularOfferCard } from "./PopularOfferCard";
import { cn } from "@/lib/cn";

interface PopularCarouselProps {
  offers: Offer[];
}

export function PopularCarousel({ offers }: PopularCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      // Calculate active index based on scroll position
      const cardWidth = 280 + 20; // card width + gap
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(newIndex, offers.length - 1));
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 280 + 20;
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  // Check scroll on mount
  useEffect(() => {
    checkScrollButtons();
  }, []);

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">Popular</h2>
        <div className="flex items-center gap-3">
          {/* Dot indicators */}
          <div className="hidden sm:flex items-center gap-1.5">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  activeIndex === index
                    ? "w-6 h-2 bg-primary"
                    : "w-2 h-2 bg-border hover:bg-text-secondary/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Arrow buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={cn(
                "p-2 rounded-xl transition-all duration-200",
                "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                canScrollLeft
                  ? "text-text-primary hover:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff] active:scale-95"
                  : "text-text-secondary/30 cursor-not-allowed"
              )}
              aria-label="Scroll left"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={cn(
                "p-2 rounded-xl transition-all duration-200",
                "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                canScrollRight
                  ? "text-text-primary hover:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff] active:scale-95"
                  : "text-text-secondary/30 cursor-not-allowed"
              )}
              aria-label="Scroll right"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        onScroll={checkScrollButtons}
        className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2"
      >
        {offers.map((offer, index) => (
          <div
            key={offer.id}
            className={cn(
              "flex-shrink-0 w-[280px]",
              "opacity-0 animate-scale-in"
            )}
            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
          >
            <PopularOfferCard
              offer={offer}
              onClick={() => {
                console.log("Clicked offer:", offer.id);
              }}
            />
          </div>
        ))}
      </div>

      {/* Gradient fade edges */}
      <div className="hidden lg:block absolute left-0 top-12 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="hidden lg:block absolute right-0 top-12 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}

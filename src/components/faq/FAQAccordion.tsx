"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { FAQItem } from "@/types/faq.types";

interface FAQAccordionProps {
  items: FAQItem[];
}

interface FAQAccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function FAQAccordionItem({ item, isOpen, onToggle, index }: FAQAccordionItemProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white transition-all duration-300",
        "opacity-0 animate-fade-in-up",
        isOpen
          ? "shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
          : "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]"
      )}
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            isOpen ? "text-primary" : "text-text-primary"
          )}
        >
          {item.question}
        </span>
        <div
          className={cn(
            "p-2 rounded-xl transition-all duration-200 flex-shrink-0 ml-4",
            isOpen
              ? "bg-primary text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]"
              : "bg-background text-text-secondary shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]"
          )}
        >
          <svg
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              isOpen && "rotate-180"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-5 pb-5 pt-0">
          <div className="border-t border-border-light pt-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <FAQAccordionItem
          key={item.id}
          item={item}
          isOpen={openId === item.id}
          onToggle={() => handleToggle(item.id)}
          index={index}
        />
      ))}
    </div>
  );
}

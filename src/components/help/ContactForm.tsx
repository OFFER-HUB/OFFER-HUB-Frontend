"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";
import { subjectOptions } from "@/data/help.data";
import type { ContactFormData } from "@/types/help.types";

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI only - no backend
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectedSubjectLabel =
    subjectOptions.find((opt) => opt.value === formData.subject)?.label ||
    "Select a subject";

  return (
    <div
      className={cn(
        "p-6 sm:p-8 rounded-3xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
      )}
    >
      <h2 className="text-xl font-bold text-text-primary mb-2">Send us a message</h2>
      <p className="text-sm text-text-secondary mb-6">
        Fill out the form below and we&apos;ll get back to you as soon as possible.
      </p>

      {isSubmitted ? (
        <div
          className={cn(
            "p-6 rounded-2xl text-center",
            "bg-success/10 border border-success/20",
            "animate-scale-in"
          )}
        >
          <svg
            className="w-12 h-12 mx-auto text-success mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-success mb-1">Message Sent!</h3>
          <p className="text-sm text-text-secondary">
            We&apos;ll respond to your inquiry within 24-48 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm",
                "bg-background text-text-primary placeholder-text-secondary/50",
                "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                "focus:outline-none focus:ring-2 focus:ring-primary/30",
                "transition-all duration-200"
              )}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm",
                "bg-background text-text-primary placeholder-text-secondary/50",
                "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                "focus:outline-none focus:ring-2 focus:ring-primary/30",
                "transition-all duration-200"
              )}
            />
          </div>

          {/* Subject - Custom Dropdown */}
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Subject
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm",
                  "bg-background",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "hover:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]",
                  "transition-all duration-200",
                  formData.subject ? "text-text-primary" : "text-text-secondary/50"
                )}
              >
                <span>{selectedSubjectLabel}</span>
                <svg
                  className={cn(
                    "h-4 w-4 text-text-secondary transition-transform duration-200",
                    isDropdownOpen && "rotate-180"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div
                  className={cn(
                    "absolute top-full left-0 right-0 mt-2 py-2 rounded-2xl bg-white z-50",
                    "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                    "border border-border-light/50",
                    "animate-fade-in"
                  )}
                >
                  {subjectOptions.map((option, index) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, subject: option.value }));
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2.5 text-left text-sm transition-all duration-150",
                        "opacity-0 animate-slide-in-right",
                        formData.subject === option.value
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-text-secondary hover:bg-background hover:text-text-primary hover:pl-5"
                      )}
                      style={{ animationDelay: `${index * 0.03}s`, animationFillMode: "forwards" }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder="How can we help you?"
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm resize-none",
                "bg-background text-text-primary placeholder-text-secondary/50",
                "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                "focus:outline-none focus:ring-2 focus:ring-primary/30",
                "transition-all duration-200"
              )}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={cn(
              "w-full px-6 py-3 rounded-xl font-medium",
              "bg-primary text-white",
              "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "hover:bg-primary-hover hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
              "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]",
              "transition-all duration-200"
            )}
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";

const locationOptions = [
  { value: "Worldwide", label: "Worldwide" },
  { value: "United States", label: "United States" },
  { value: "Europe", label: "Europe" },
  { value: "Asia", label: "Asia" },
  { value: "Remote", label: "Remote Only" },
];

export function SearchBar() {
  const [location, setLocation] = useState("Worldwide");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = (value: string) => {
    setLocation(value);
    setIsDropdownOpen(false);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-3xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
      )}
    >
      {/* Location Selector - Custom Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl",
            "bg-background",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
            "hover:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]",
            "transition-all duration-200"
          )}
        >
          <svg className="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium text-text-primary">{location}</span>
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

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            className={cn(
              "absolute top-full left-0 mt-2 min-w-[180px] py-2 rounded-2xl bg-white z-50",
              "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
              "border border-border-light/50",
              "animate-fade-in"
            )}
          >
            {locationOptions.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectLocation(option.value)}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm transition-all duration-150",
                  "opacity-0 animate-slide-in-right",
                  location === option.value
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

      {/* Search Input */}
      <div
        className={cn(
          "flex-1 flex items-center gap-2 px-4 py-2 rounded-xl",
          "bg-background",
          "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
        )}
      >
        <svg className="h-5 w-5 text-text-secondary/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search for jobs, skills, or companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "flex-1 py-0.5 text-sm text-text-primary placeholder-text-secondary/50",
            "bg-transparent focus:outline-none"
          )}
        />
      </div>

      {/* Search Button */}
      <button
        className={cn(
          "p-2.5 rounded-xl flex-shrink-0",
          "bg-primary text-white",
          "hover:bg-primary-hover transition-all duration-200",
          "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
          "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
          "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]"
        )}
        aria-label="Search"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  );
}

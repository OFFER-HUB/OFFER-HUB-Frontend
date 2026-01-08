"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function SearchBar() {
  const [location, setLocation] = useState("Worldwide");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-3xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
      )}
    >
      {/* Location Selector */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background">
        <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="bg-transparent text-sm font-medium text-text-primary focus:outline-none cursor-pointer"
        >
          <option value="Worldwide">Worldwide</option>
          <option value="United States">United States</option>
          <option value="Europe">Europe</option>
          <option value="Asia">Asia</option>
          <option value="Remote">Remote Only</option>
        </select>
      </div>

      {/* Search Input */}
      <div className="flex-1 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search for jobs, skills, or companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "flex-1 px-3 py-2 text-sm text-text-primary placeholder-text-secondary/50",
            "bg-transparent focus:outline-none"
          )}
        />
        <button
          className={cn(
            "p-2.5 rounded-xl",
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
    </div>
  );
}

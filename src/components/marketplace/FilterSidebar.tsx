"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { experienceOptions, availabilityOptions } from "@/data/marketplace.data";

export function FilterSidebar() {
  const [salaryRange, setSalaryRange] = useState({ min: 300, max: 4600 });
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(["Full-Time"]);
  const [rating, setRating] = useState(4.0);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([
    "UX Designer",
    "UX Writer",
    "Data Analyst",
  ]);

  const toggleAvailability = (option: string) => {
    setSelectedAvailability((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const toggleExperience = (option: string) => {
    setSelectedExperience((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  return (
    <aside
      className={cn(
        "w-full p-6 rounded-3xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
      )}
    >
      <h2 className="text-lg font-bold text-text-primary mb-6">Filter</h2>

      {/* Salary Range */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-text-primary">Salary</label>
          <span className="px-3 py-1.5 text-xs font-medium bg-secondary text-white rounded-xl shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]">
            ${salaryRange.max.toLocaleString()}
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={300}
            max={5000}
            value={salaryRange.max}
            onChange={(e) => setSalaryRange((prev) => ({ ...prev, max: Number(e.target.value) }))}
            className="w-full h-2 bg-border-light rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between mt-2 text-xs text-text-secondary">
            <span>${salaryRange.min}</span>
            <span>$5k</span>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <label className="text-sm font-medium text-text-primary mb-3 block">Availability</label>
        <div className="space-y-2">
          {availabilityOptions.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleAvailability(option)}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200",
                  selectedAvailability.includes(option)
                    ? "bg-primary shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] scale-110"
                    : "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] group-hover:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]"
                )}
              >
                {selectedAvailability.includes(option) && (
                  <svg className="w-3 h-3 text-white animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={cn(
                "text-sm transition-colors duration-200",
                selectedAvailability.includes(option)
                  ? "text-text-primary font-medium"
                  : "text-text-secondary group-hover:text-text-primary"
              )}>
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <label className="text-sm font-medium text-text-primary mb-3 block">Rating</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            min={0}
            max={5}
            step={0.1}
            className={cn(
              "w-14 px-2 py-1.5 text-sm text-center rounded-xl",
              "bg-background border-none",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              "focus:outline-none focus:ring-2 focus:ring-primary/30"
            )}
          />
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={cn(
                  "h-5 w-5 cursor-pointer transition-all duration-200",
                  star <= Math.round(rating)
                    ? "text-yellow-500 scale-110"
                    : "text-border-light hover:text-yellow-300 hover:scale-125"
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
                onClick={() => setRating(star)}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="text-sm font-medium text-text-primary mb-3 block">Experience</label>
        <div className="space-y-2">
          {experienceOptions.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleExperience(option)}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200",
                  selectedExperience.includes(option)
                    ? "bg-primary shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] scale-110"
                    : "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] group-hover:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]"
                )}
              >
                {selectedExperience.includes(option) && (
                  <svg className="w-3 h-3 text-white animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={cn(
                "text-sm transition-colors duration-200",
                selectedExperience.includes(option)
                  ? "text-text-primary font-medium"
                  : "text-text-secondary group-hover:text-text-primary"
              )}>
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

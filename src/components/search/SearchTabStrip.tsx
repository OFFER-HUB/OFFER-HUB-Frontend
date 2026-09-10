"use client";

import { cn } from "@/lib/cn";
import type { SearchTab } from "@/lib/api/search";

interface Tab {
  id: SearchTab;
  label: string;
  count: number;
}

interface SearchTabStripProps {
  activeTab: SearchTab;
  counts: { offers: number; services: number; freelancers: number };
  onTabChange: (tab: SearchTab) => void;
}

export function SearchTabStrip({
  activeTab,
  counts,
  onTabChange,
}: SearchTabStripProps): React.JSX.Element {
  const tabs: Tab[] = [
    { id: "offers", label: "Offers", count: counts.offers },
    { id: "services", label: "Services", count: counts.services },
    { id: "freelancers", label: "Freelancers", count: counts.freelancers },
  ];

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 p-1 rounded-2xl bg-background",
        "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
      )}
      role="tablist"
      aria-label="Search categories"
    >
      {tabs.map(({ id, label, count }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex-1 min-w-[7rem] px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              active
                ? "bg-primary text-white shadow-[2px_2px_6px_#d1d5db]"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {label}
            <span
              className={cn(
                "ml-1.5 tabular-nums text-xs",
                active ? "text-white/90" : "text-text-secondary"
              )}
            >
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
}

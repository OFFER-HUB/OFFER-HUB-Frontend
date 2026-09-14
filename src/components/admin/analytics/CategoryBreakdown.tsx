"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import type { CategoryBreakdown as CategoryBreakdownType } from "@/types/admin-analytics.types";

interface CategoryBreakdownProps {
  data: CategoryBreakdownType[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps): React.JSX.Element {
  return (
    <div className={cn(NEUMORPHIC_CARD, "p-6")}>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Services by Category</h3>

      {data.length === 0 ? (
        <p className="text-sm text-text-secondary">No active services yet.</p>
      ) : (
        <div className="space-y-4">
          {data.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">{category.category}</span>
                <span className="text-sm font-semibold text-text-primary">
                  {category.services} {category.services === 1 ? "service" : "services"}
                </span>
              </div>

              {/* Progress bar track with sunken neumorphic depth */}
              <div className={cn("w-full rounded-full h-2.5 overflow-hidden", NEUMORPHIC_INSET)}>
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.min(category.percentage, 100)}%` }}
                />
              </div>

              <div className="text-xs text-text-secondary">{category.percentage.toFixed(1)}% of active services</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


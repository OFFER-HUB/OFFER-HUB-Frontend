"use client";

import { Card } from "@/components/ui/Card";
import type { CategoryBreakdown as CategoryBreakdownType } from "@/types/admin-analytics.types";

interface CategoryBreakdownProps {
  data: CategoryBreakdownType[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps): React.JSX.Element {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Services by Category</h3>

      {data.length === 0 ? (
        <p className="text-sm text-text-secondary">No active services yet.</p>
      ) : (
        <div className="space-y-4">
          {data.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">{category.category}</span>
                <span className="text-sm font-medium text-text-primary">
                  {category.services} {category.services === 1 ? "service" : "services"}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-background-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${category.percentage}%` }}
                />
              </div>

              <div className="text-xs text-text-secondary">{category.percentage.toFixed(1)}% of active services</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

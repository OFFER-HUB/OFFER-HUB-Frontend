"use client";

import { Card } from "@/components/ui/Card";
import type { CategoryBreakdown as CategoryBreakdownType } from "@/types/admin-analytics.types";

interface CategoryBreakdownProps {
  data: CategoryBreakdownType[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps): React.JSX.Element {
  // Sort by revenue descending
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Category Breakdown
      </h3>

      <div className="space-y-4">
        {sortedData.map((category) => (
          <div key={category.category} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">
                {category.category}
              </span>
              <div className="text-right">
                <div className="text-sm font-medium text-text-primary">
                  {category.orders} orders
                </div>
                <div className="text-sm text-text-secondary">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(category.revenue)}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-background-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${category.percentage}%` }}
              />
            </div>

            <div className="text-xs text-text-secondary">
              {category.percentage.toFixed(1)}% of total
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
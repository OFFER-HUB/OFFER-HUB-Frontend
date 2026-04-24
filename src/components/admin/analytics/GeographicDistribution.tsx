"use client";

import { Card } from "@/components/ui/Card";
import type { GeographicData } from "@/types/admin-analytics.types";

interface GeographicDistributionProps {
  data: GeographicData[];
}

export function GeographicDistribution({ data }: GeographicDistributionProps): React.JSX.Element {
  // Sort by revenue descending
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Geographic Distribution
      </h3>

      <div className="space-y-4">
        {sortedData.map((country) => (
          <div key={country.country} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-text-primary">
                {country.country}
              </div>
              <div className="text-xs text-text-secondary">
                {country.users} users • {country.orders} orders
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-text-primary">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                }).format(country.revenue)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-sm text-text-secondary">
          Total countries: {data.length}
        </div>
      </div>
    </Card>
  );
}
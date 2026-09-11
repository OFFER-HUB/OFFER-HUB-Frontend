"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useModeStore } from "@/stores/mode-store";
import { useAuthStore } from "@/stores/auth-store";
import { getMyPurchases } from "@/lib/api/orders";
import type { Order } from "@/types/order.types";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  ORDER_CREATED: { label: "Created", color: "text-blue-600", bgColor: "bg-blue-100" },
  FUNDS_RESERVED: { label: "Funds Reserved", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  ESCROW_CREATING: { label: "Creating Escrow", color: "text-orange-600", bgColor: "bg-orange-100" },
  ESCROW_FUNDING: { label: "Funding Escrow", color: "text-orange-600", bgColor: "bg-orange-100" },
  IN_PROGRESS: { label: "In Progress", color: "text-primary", bgColor: "bg-primary/10" },
  DELIVERED: { label: "Delivered", color: "text-warning", bgColor: "bg-warning/10" },
  COMPLETED: { label: "Completed", color: "text-success", bgColor: "bg-success/10" },
  RELEASED: { label: "Released", color: "text-success", bgColor: "bg-success/10" },
  REFUNDED: { label: "Refunded", color: "text-warning", bgColor: "bg-warning/10" },
  CLOSED: { label: "Closed", color: "text-text-secondary", bgColor: "bg-gray-100" },
  DISPUTED: { label: "Disputed", color: "text-error", bgColor: "bg-error/10" },
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "ORDER_CREATED", label: "Created" },
  { value: "FUNDS_RESERVED", label: "Funds Reserved" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "COMPLETED", label: "Completed" },
  { value: "RELEASED", label: "Released" },
  { value: "CLOSED", label: "Closed" },
];

export default function ClientPurchasesPage() {
  const { setMode } = useModeStore();
  const { token } = useAuthStore();

  const [purchases, setPurchases] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setMode("client");
  }, [setMode]);

  useEffect(() => {
    async function fetchPurchases() {
      if (!token) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await getMyPurchases(token, {
          status: statusFilter || undefined,
          limit: 50,
        });
        setPurchases(response.data);
      } catch (err) {
        console.error("Failed to fetch purchases:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch purchases");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPurchases();
  }, [token, statusFilter]);

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getStatusConfig(status: string) {
    return STATUS_CONFIG[status] || { label: status, color: "text-text-secondary", bgColor: "bg-gray-100" };
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">My Purchases</h1>
          <p className="text-text-secondary mt-1">Services you've hired from freelancers</p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              "px-4 py-2 rounded-xl bg-background text-text-primary text-sm",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              "focus:outline-none"
            )}
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner className="text-primary" />
        </div>
      ) : error ? (
        <EmptyState
          icon={ICON_PATHS.alertCircle}
          message={error}
        />
      ) : purchases.length === 0 ? (
        <EmptyState
          icon={ICON_PATHS.shoppingCart}
          message={statusFilter ? "No purchases match this filter" : "You haven't hired any services yet"}
          linkHref="/marketplace/services"
          linkText="Browse Services"
        />
      ) : (
        <div className="space-y-4">
          {purchases.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const metadata = order.metadata as Record<string, any> | null;
            const serviceTitle = metadata?.serviceTitle || order.title || "Service Order";
            const sellerName = order.seller?.email?.split("@")[0] || "Freelancer";

            return (
              <Link
                key={order.id}
                href={`/app/orders/${order.id}`}
                className={cn(
                  "block p-6 rounded-2xl bg-white transition-all duration-200",
                  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                  "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-text-primary truncate">
                        {serviceTitle}
                      </h3>
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        statusConfig.bgColor,
                        statusConfig.color
                      )}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Icon path={ICON_PATHS.user} size="sm" />
                        <span>{sellerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Icon path={ICON_PATHS.calendar} size="sm" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      {metadata?.deliveryDays && (
                        <div className="flex items-center gap-1.5">
                          <Icon path={ICON_PATHS.clock} size="sm" />
                          <span>{metadata.deliveryDays} days delivery</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Price */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-text-secondary">Amount</p>
                      <p className="text-xl font-bold text-primary">
                        ${parseFloat(order.amount).toLocaleString()}
                      </p>
                    </div>
                    <Icon path={ICON_PATHS.chevronRight} size="md" className="text-text-secondary" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

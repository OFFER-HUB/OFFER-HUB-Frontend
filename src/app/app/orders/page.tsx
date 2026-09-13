"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { listOrders } from "@/lib/api/orders";
import type { Order, OrderStatus } from "@/types/order.types";
import { ORDER_STATUS_CONFIG } from "@/types/order.types";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, NEUMORPHIC_INPUT } from "@/lib/styles";

type OrderTabFilter = "all" | "active" | "purchases" | "sales";

const ACTIVE_STATUSES: Set<OrderStatus> = new Set([
  "ORDER_CREATED",
  "FUNDS_RESERVED",
  "ESCROW_CREATING",
  "ESCROW_FUNDING",
  "ESCROW_FUNDED",
  "IN_PROGRESS",
  "DELIVERED",
  "RELEASE_REQUESTED",
  "REFUND_REQUESTED",
]);

function getCounterpartyName(order: Order, isBuyer: boolean): string {
  const otherUser = isBuyer ? order.seller : order.buyer;
  if (!otherUser) return "Unknown";
  return otherUser.name || otherUser.username || otherUser.email?.split("@")[0] || "Unknown";
}

function OrderCard({
  order,
  currentUserId,
}: {
  order: Order;
  currentUserId?: string;
}): React.JSX.Element {
  const isBuyer = order.buyerId === currentUserId;
  const counterpartyName = getCounterpartyName(order, isBuyer);
  const amount = parseFloat(order.amount);
  const statusConfig = ORDER_STATUS_CONFIG[order.status] ?? {
    label: order.status,
    color: "text-text-secondary",
    bg: "bg-text-secondary/10",
  };
  const isActive = ACTIVE_STATUSES.has(order.status);

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/app/orders/${order.id}`}
      className={cn(
        "group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl transition-all duration-200",
        NEUMORPHIC_INSET,
        "hover:shadow-[inset_3px_3px_6px_#cbd5e1,inset_-3px_-3px_6px_#ffffff]"
      )}
      data-testid={`order-card-${order.id}`}
    >
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-md font-semibold text-[11px]",
              isBuyer
                ? "bg-primary/10 text-primary"
                : "bg-secondary/10 text-secondary"
            )}
          >
            {isBuyer ? "Purchase (Client)" : "Sale (Freelancer)"}
          </span>
          <span className="font-mono text-text-secondary">#{order.id.slice(-8)}</span>
          <span className="text-text-secondary">•</span>
          <span className="text-text-secondary">{formattedDate}</span>
          {order.escrow && (
            <>
              <span className="text-text-secondary">•</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <Icon path={ICON_PATHS.lock} size="sm" className="w-3 h-3" />
                <span>Escrow</span>
              </span>
            </>
          )}
        </div>

        <h3 className="text-base font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
          {order.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span>{isBuyer ? "Freelancer" : "Client"}:</span>
          <span className="font-medium text-text-primary">{counterpartyName}</span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0">
        <div className="text-left sm:text-right">
          <span className="text-xs text-text-secondary block">Amount</span>
          <span className="text-base sm:text-lg font-bold font-mono text-text-primary">
            ${amount.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold shrink-0",
              statusConfig.bg,
              statusConfig.color
            )}
          >
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
            <span>{statusConfig.label}</span>
          </span>

          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] text-text-secondary group-hover:text-primary group-hover:translate-x-0.5 transition-all">
            <Icon path={ICON_PATHS.chevronRight} size="sm" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function OrdersPage(): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [mounted, setMounted] = useState(false);
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState<OrderTabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!token || !user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [buyerOrders, sellerOrders] = await Promise.all([
        listOrders(token, user.id, { role: "buyer" }).catch(() => [] as Order[]),
        listOrders(token, user.id, { role: "seller" }).catch(() => [] as Order[]),
      ]);

      setPurchases(buyerOrders);
      setSales(sellerOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (mounted && token && user?.id) {
      void fetchOrders();
    }
  }, [mounted, token, user?.id, fetchOrders]);

  // Combine and deduplicate orders
  const allOrders = useMemo(() => {
    const map = new Map<string, Order>();
    purchases.forEach((order) => map.set(order.id, order));
    sales.forEach((order) => map.set(order.id, order));
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [purchases, sales]);

  const activeOrders = useMemo(() => {
    return allOrders.filter((order) => ACTIVE_STATUSES.has(order.status));
  }, [allOrders]);

  const activeOrdersCount = activeOrders.length;

  // Filter based on active tab, search, and status
  const displayedOrders = useMemo(() => {
    let result = allOrders;

    // Tab filter
    if (tabFilter === "active") {
      result = activeOrders;
    } else if (tabFilter === "purchases") {
      result = allOrders.filter((order) => order.buyerId === user?.id);
    } else if (tabFilter === "sales") {
      result = allOrders.filter((order) => order.sellerId === user?.id);
    }

    // Specific status dropdown filter
    if (statusFilter !== "ALL") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((order) => {
        const isBuyer = order.buyerId === user?.id;
        const counterparty = getCounterpartyName(order, isBuyer).toLowerCase();
        const title = order.title.toLowerCase();
        const id = order.id.toLowerCase();
        return title.includes(q) || counterparty.includes(q) || id.includes(q);
      });
    }

    return result;
  }, [allOrders, activeOrders, tabFilter, statusFilter, searchQuery, user?.id]);

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            My Orders
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Track and manage your active contracts, purchases, and sales
          </p>
        </div>
      </div>

      {/* Visual Metric Summaries */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          role="button"
          tabIndex={0}
          aria-label="All orders count card"
          onClick={() => {
            setTabFilter("all");
            setStatusFilter("ALL");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setTabFilter("all");
              setStatusFilter("ALL");
            }
          }}
          className={cn(
            "p-4 rounded-2xl text-left transition-all cursor-pointer select-none",
            tabFilter === "all"
              ? "bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
              : "bg-white shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
          )}
        >
          <span className="text-xs font-medium text-text-secondary block">All Orders</span>
          <span className="text-xl sm:text-2xl font-bold text-text-primary mt-1 block">
            {allOrders.length}
          </span>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label="Open orders count card"
          onClick={() => {
            setTabFilter("active");
            setStatusFilter("ALL");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setTabFilter("active");
              setStatusFilter("ALL");
            }
          }}
          className={cn(
            "p-4 rounded-2xl text-left transition-all cursor-pointer select-none",
            tabFilter === "active"
              ? "bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
              : "bg-white shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Open Orders</span>
            {activeOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <span className="text-xl sm:text-2xl font-bold text-primary mt-1 block">
            {activeOrdersCount}
          </span>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label="Purchases count card"
          onClick={() => {
            setTabFilter("purchases");
            setStatusFilter("ALL");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setTabFilter("purchases");
              setStatusFilter("ALL");
            }
          }}
          className={cn(
            "p-4 rounded-2xl text-left transition-all cursor-pointer select-none",
            tabFilter === "purchases"
              ? "bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
              : "bg-white shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
          )}
        >
          <span className="text-xs font-medium text-text-secondary block">My Purchases</span>
          <span className="text-xl sm:text-2xl font-bold text-text-primary mt-1 block">
            {purchases.length}
          </span>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label="Sales count card"
          onClick={() => {
            setTabFilter("sales");
            setStatusFilter("ALL");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setTabFilter("sales");
              setStatusFilter("ALL");
            }
          }}
          className={cn(
            "p-4 rounded-2xl text-left transition-all cursor-pointer select-none",
            tabFilter === "sales"
              ? "bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
              : "bg-white shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
          )}
        >
          <span className="text-xs font-medium text-text-secondary block">My Sales</span>
          <span className="text-xl sm:text-2xl font-bold text-text-primary mt-1 block">
            {sales.length}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className={cn(NEUMORPHIC_CARD, "p-6 sm:p-8 space-y-6")}>
        {/* Active Orders Quick Alert Banner */}
        {!isLoading && activeOrdersCount > 0 && tabFilter !== "active" && (
          <div
            className={cn(
              "p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4",
              NEUMORPHIC_INSET
            )}
          >
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0" />
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  You have {activeOrdersCount} active {activeOrdersCount === 1 ? "order" : "orders"} in progress
                </p>
                <p className="text-xs text-text-secondary">
                  Review deliverables, confirm escrow, or track milestone releases
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setTabFilter("active");
                setStatusFilter("ALL");
              }}
              className={cn(
                "self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0",
                "bg-white text-primary shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                "hover:shadow-[1px_1px_2px_#d1d5db,-1px_-1px_2px_#ffffff]",
                "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
              )}
            >
              View Active Orders
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Tabs */}
          <div
            className={cn(
              "inline-flex flex-wrap p-1.5 rounded-2xl bg-background",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
            )}
          >
            <button
              type="button"
              onClick={() => setTabFilter("all")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                tabFilter === "all"
                  ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              All Orders ({allOrders.length})
            </button>

            <button
              type="button"
              onClick={() => setTabFilter("active")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                tabFilter === "active"
                  ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {activeOrdersCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              )}
              <span>Active ({activeOrdersCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setTabFilter("purchases")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                tabFilter === "purchases"
                  ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              My Purchases ({purchases.length})
            </button>

            <button
              type="button"
              onClick={() => setTabFilter("sales")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                tabFilter === "sales"
                  ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              My Sales ({sales.length})
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(NEUMORPHIC_INPUT, "text-xs py-2 pl-9 pr-3")}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                <Icon path={ICON_PATHS.search} size="sm" className="w-3.5 h-3.5" />
              </span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all",
                "bg-background text-text-primary",
                "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                "outline-none"
              )}
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ESCROW_FUNDED">Escrow Funded</option>
              <option value="DELIVERED">Delivered</option>
              <option value="RELEASED">Released</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* Orders List / States */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner />
            <span className="ml-3 text-text-secondary font-medium">Loading orders...</span>
          </div>
        ) : displayedOrders.length === 0 ? (
          <EmptyState
            icon={ICON_PATHS.briefcase}
            message={
              searchQuery || statusFilter !== "ALL"
                ? "No orders match your search or filter"
                : tabFilter === "active"
                  ? "No active orders in progress right now"
                  : tabFilter === "purchases"
                    ? "No purchases found"
                    : tabFilter === "sales"
                      ? "No sales found"
                      : "No orders found"
            }
            linkHref={
              tabFilter === "sales" ? "/app/freelancer/services/new" : "/marketplace/services"
            }
            linkText={tabFilter === "sales" ? "Create a Service" : "Browse Services"}
          />
        ) : (
          <div className="space-y-3">
            {displayedOrders.map((order) => (
              <OrderCard key={order.id} order={order} currentUserId={user?.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

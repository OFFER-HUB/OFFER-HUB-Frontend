"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { listOrders } from "@/lib/api/orders";
import type { Order } from "@/types/order.types";
import { ORDER_STATUS_CONFIG } from "@/types/order.types";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";

type RoleFilter = 'buyer' | 'seller';

function OrderCard({ order, role }: { order: Order; role: RoleFilter }): React.JSX.Element {
  const otherUser = role === 'buyer' ? order.seller : order.buyer;
  const userName = otherUser?.email?.split('@')[0] || 'Unknown';
  const amount = parseFloat(order.amount);
  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  return (
    <Link
      href={`/app/orders/${order.id}`}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl",
        NEUMORPHIC_INSET,
        "hover:bg-background/50 transition-colors"
      )}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-text-primary truncate">{order.title}</h3>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-sm text-text-secondary">
            {role === 'buyer' ? 'Seller' : 'Buyer'}: {userName}
          </span>
          <span className="text-text-secondary">•</span>
          <span className="text-sm text-text-secondary">${amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={cn("px-2 py-1 rounded-lg text-xs font-medium", statusConfig.bg, statusConfig.color)}>
          {statusConfig.label}
        </span>
        <Icon path={ICON_PATHS.chevronRight} size="sm" className="text-text-secondary" />
      </div>
    </Link>
  );
}

export default function OrdersPage(): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('buyer');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !token || !user?.id) {
      setIsLoading(false);
      return;
    }

    async function fetchOrders() {
      setIsLoading(true);
      try {
        const data = await listOrders(token!, user!.id, { role: roleFilter });
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [mounted, token, user?.id, roleFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Orders</h1>
          <p className="text-text-secondary mt-1">Track your purchases and sales</p>
        </div>
      </div>

      <div className={NEUMORPHIC_CARD}>
        {/* Role Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setRoleFilter('buyer')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
              roleFilter === 'buyer'
                ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                : "text-text-secondary hover:text-text-primary hover:bg-background"
            )}
          >
            My Purchases
          </button>
          <button
            onClick={() => setRoleFilter('seller')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
              roleFilter === 'seller'
                ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                : "text-text-secondary hover:text-text-primary hover:bg-background"
            )}
          >
            My Sales
          </button>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
            <span className="ml-3 text-text-secondary">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ICON_PATHS.briefcase}
            message={`No ${roleFilter === 'buyer' ? 'purchases' : 'sales'} found`}
            linkHref="/marketplace/services"
            linkText="Browse Services"
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} role={roleFilter} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

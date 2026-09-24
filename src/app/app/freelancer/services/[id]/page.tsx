"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, PRIMARY_BUTTON, ICON_BUTTON } from "@/lib/styles";
import { getServiceCategoryLabel } from "@/data/service.data";
import { OrderCard } from "@/components/services/OrderCard";
import { ServiceActions } from "@/components/services/ServiceActions";
import { RateClientModal } from "@/components/rating";
import { Toast } from "@/components/ui/Toast";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { getServiceById, updateServiceStatus, deleteService, getServiceOrders } from "@/lib/api/services";
import { useAuthStore } from "@/stores/auth-store";
import type { Service, ServiceOrder, ServiceStatus } from "@/types/service.types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_STYLES: Record<ServiceStatus, string> = {
  ACTIVE: "bg-success/20 text-success",
  PAUSED: "bg-warning/20 text-warning",
  ARCHIVED: "bg-text-secondary/20 text-text-secondary",
};

const STATUS_LABELS: Record<ServiceStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  ARCHIVED: "Archived",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Order statuses that count as "in flight" for the Active Orders section. */
const ACTIVE_ORDER_STATUSES: ReadonlySet<ServiceOrder["status"]> = new Set([
  "IN_PROGRESS",
  "DELIVERED",
  "ORDER_CREATED",
  "FUNDS_RESERVED",
  "ESCROW_CREATING",
  "ESCROW_FUNDING",
  "ESCROW_FUNDED",
]);

/** Order statuses that count as finished for the Recent Orders section. */
const COMPLETED_ORDER_STATUSES: ReadonlySet<ServiceOrder["status"]> = new Set([
  "RELEASED",
  "CLOSED",
]);

export default function ServiceDetailsPage({ params }: PageProps): React.JSX.Element {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const [service, setService] = useState<Service | null>(null);
  const [isFetchingService, setIsFetchingService] = useState(true);
  const [ratingOrder, setRatingOrder] = useState<ServiceOrder | null>(null);
  const [showRatingSuccessToast, setShowRatingSuccessToast] = useState(false);
  const [showUpdateSuccessToast, setShowUpdateSuccessToast] = useState(
    () => searchParams.get("updated") === "true"
  );
  const [, forceUpdate] = useState(0);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isFetchingOrders, setIsFetchingOrders] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    if (token) {
      getServiceById(token, id)
        .then((data) => {
          setService(data);
        })
        .catch((error) => {
          console.error('Failed to fetch service:', error);
        })
        .finally(() => {
          setIsFetchingService(false);
        });
    } else {
      setIsFetchingService(false);
    }
  }, [hasHydrated, token, id]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (token) {
      getServiceOrders(token, id)
        .then((data) => {
          setOrders(data);
        })
        .catch((error) => {
          console.error('Failed to fetch orders:', error);
          setOrders([]);
        })
        .finally(() => {
          setIsFetchingOrders(false);
        });
    } else {
      setIsFetchingOrders(false);
    }
  }, [hasHydrated, token, id]);

  useEffect(() => {
    if (searchParams.get("updated") === "true") {
      router.replace(`/app/freelancer/services/${id}`);
    }
  }, [id, router, searchParams]);

  async function handleStatusChange(newStatus: ServiceStatus): Promise<void> {
    if (!service || !token) return;

    try {
      const updatedService = await updateServiceStatus(token, id, { status: newStatus });
      setService(updatedService);
    } catch (error) {
      console.error('Failed to update service status:', error);
    }
  }

  function handleDelete(): void {
    if (!service) return;
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!service || !token) return;

    const deletedServiceName = service.title;
    setIsDeleting(true);

    try {
      await deleteService(token, id);
      router.push(`/app/freelancer/services?deleted=${encodeURIComponent(deletedServiceName)}`);
    } catch (error) {
      console.error('Failed to delete service:', error);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  }

  function handleRateClient(order: ServiceOrder): void {
    setRatingOrder(order);
  }

  function handleRatingSuccess(): void {
    setRatingOrder(null);
    setShowRatingSuccessToast(true);
    forceUpdate((n) => n + 1);
  }

  // Show loading state while fetching service
  if (isFetchingService) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <div className={cn(NEUMORPHIC_CARD, "p-6 space-y-4 animate-pulse")}>
              <div className="h-6 bg-gray-200 rounded w-48" />
              <div className="h-20 bg-gray-200 rounded" />
              <div className="grid grid-cols-4 gap-4">
                <div className="h-16 bg-gray-200 rounded" />
                <div className="h-16 bg-gray-200 rounded" />
                <div className="h-16 bg-gray-200 rounded" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show not found if service doesn't exist after loading
  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className={cn(NEUMORPHIC_CARD, "text-center max-w-md")}>
          <div
            className={cn(
              "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center",
              "bg-background",
              "shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
            )}
          >
            <Icon path={ICON_PATHS.briefcase} size="xl" className="text-text-secondary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Service not found</h2>
          <p className="text-text-secondary mb-4">
            The service you are looking for does not exist or has been removed.
          </p>
          <button
            type="button"
            onClick={() => router.push("/app/freelancer/services")}
            className={PRIMARY_BUTTON}
          >
            Back to Services
          </button>
        </div>

      </div>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_ORDER_STATUSES.has(o.status));
  const completedOrders = orders.filter((o) => COMPLETED_ORDER_STATUSES.has(o.status));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/app/freelancer/services" className={ICON_BUTTON}>
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary truncate">{service.title}</h1>
            <span
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium shrink-0",
                STATUS_STYLES[service.status]
              )}
            >
              {STATUS_LABELS[service.status]}
            </span>
          </div>
          <p className="text-text-secondary mt-1">
            {getServiceCategoryLabel(service.category)} • Created {formatDate(service.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Service Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-text-secondary text-sm mb-1">Description</p>
                <p className="text-text-primary whitespace-pre-wrap">{service.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border-light">
                <div>
                  <p className="text-text-secondary text-sm mb-1">Price</p>
                  <p className="text-xl font-bold text-primary">${parseFloat(service.price).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-1">Delivery</p>
                  <p className="text-xl font-bold text-text-primary">
                    {service.deliveryDays} {service.deliveryDays === 1 ? "day" : "days"}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-1">Total Orders</p>
                  <p className="text-xl font-bold text-text-primary">{service.totalOrders}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-1">Rating</p>
                  <p className="text-xl font-bold text-text-primary flex items-center gap-1">
                    <Icon path={ICON_PATHS.star} size="sm" className="text-warning" />
                    {service.averageRating ? parseFloat(service.averageRating).toFixed(1) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isFetchingOrders ? (
            <div className={cn(NEUMORPHIC_CARD, "p-6 space-y-3 animate-pulse")}>
              <div className="h-6 bg-gray-200 rounded w-48" />
              <div className="h-14 bg-gray-200 rounded" />
              <div className="h-14 bg-gray-200 rounded" />
            </div>
          ) : (
            <>
              {activeOrders.length > 0 && (
                <div className={NEUMORPHIC_CARD}>
                  <h2 className="text-lg font-semibold text-text-primary mb-4">
                    Active Orders ({activeOrders.length})
                  </h2>
                  <div className="space-y-3">
                    {activeOrders.map((order) => (
                      <OrderCard key={order.id} order={order} onRateClient={handleRateClient} />
                    ))}
                  </div>
                </div>
              )}

              {completedOrders.length > 0 && (
                <div className={NEUMORPHIC_CARD}>
                  <h2 className="text-lg font-semibold text-text-primary mb-4">
                    Recent Orders ({completedOrders.length})
                  </h2>
                  <div className="space-y-3">
                    {completedOrders.map((order) => (
                      <OrderCard key={order.id} order={order} onRateClient={handleRateClient} />
                    ))}
                  </div>
                </div>
              )}

              {orders.length === 0 && (
                <div className={cn(NEUMORPHIC_CARD, "text-center py-8")}>
                  <Icon path={ICON_PATHS.users} size="xl" className="text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-text-primary mb-1">No orders yet</h3>
                  <p className="text-text-secondary text-sm">
                    Orders from clients will appear here once they start coming in.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-4">
          <ServiceActions
            service={service}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />

          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Service Revenue</span>
                <span className="font-semibold text-text-primary">
                  ${(service.totalOrders * parseFloat(service.price)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Active Orders</span>
                <span className="font-semibold text-text-primary">{activeOrders.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Completed Orders</span>
                <span className="font-semibold text-success">{completedOrders.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {ratingOrder && (
        <RateClientModal
          order={ratingOrder}
          serviceTitle={service.title}
          onClose={() => setRatingOrder(null)}
          onSuccess={handleRatingSuccess}
        />
      )}

      {showRatingSuccessToast && (
        <Toast
          message="Rating submitted successfully!"
          type="success"
          onClose={() => setShowRatingSuccessToast(false)}
        />
      )}

      {showUpdateSuccessToast && (
        <Toast
          message="Service updated successfully!"
          type="success"
          onClose={() => setShowUpdateSuccessToast(false)}
        />
      )}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Service?"
        message={`Are you sure you want to delete "${service.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        icon={ICON_PATHS.trash}
        isLoading={isDeleting}
      />
    </div>
  );
}

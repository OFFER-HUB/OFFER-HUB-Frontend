"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { NEUMORPHIC_CARD, PRIMARY_BUTTON } from "@/lib/styles";
import { SERVICE_CATEGORIES } from "@/data/service.data";
import { getMyServices, deleteService } from "@/lib/api/services";
import { useAuthStore } from "@/stores/auth-store";
import type { Service, ServiceStatus } from "@/types/service.types";

const STATUS_STYLES: Record<ServiceStatus, string> = {
  ACTIVE: "bg-success/15 text-success border border-success/30",
  PAUSED: "bg-warning/15 text-warning border border-warning/30",
  ARCHIVED: "bg-text-secondary/15 text-text-secondary border border-text-secondary/30",
};

const STATUS_LABELS: Record<ServiceStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  ARCHIVED: "Archived",
};

function getCategoryLabel(value: string): string {
  return SERVICE_CATEGORIES.find((c) => c.value === value)?.label || value;
}

interface ServiceCardProps {
  service: Service;
  onDelete: (id: string, name: string) => void;
}

function ServiceCard({ service, onDelete }: ServiceCardProps): React.JSX.Element {
  const priceFormatted = parseFloat(service.price || "0").toFixed(2);
  const rating = service.averageRating ? parseFloat(service.averageRating).toFixed(1) : null;

  return (
    <div
      className={cn(
        NEUMORPHIC_CARD,
        "p-6 flex flex-col justify-between group hover:translate-y-[-2px] transition-all duration-300 min-w-0"
      )}
    >
      <div className="space-y-3">
        {/* Top bar: Category and Status badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary truncate max-w-[170px]">
            {getCategoryLabel(service.category)}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0",
              STATUS_STYLES[service.status]
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                service.status === "ACTIVE"
                  ? "bg-success"
                  : service.status === "PAUSED"
                  ? "bg-warning"
                  : "bg-text-secondary"
              )}
            />
            {STATUS_LABELS[service.status]}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <Link
            href={`/app/freelancer/services/${service.id}`}
            className="font-bold text-base text-text-primary hover:text-primary transition-colors line-clamp-1 block"
            title={service.title}
          >
            {service.title}
          </Link>
          <p className="mt-1 text-xs text-text-secondary line-clamp-2 min-h-[2rem]">
            {service.description}
          </p>
        </div>

        {/* Metrics Box */}
        <div
          className={cn(
            "p-3 rounded-xl bg-background",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
            "grid grid-cols-3 gap-2 text-center"
          )}
        >
          <div>
            <span className="text-[10px] uppercase font-semibold text-text-secondary block">
              Price
            </span>
            <span className="text-sm font-bold text-primary">${priceFormatted}</span>
          </div>
          <div className="border-x border-border-light/60 dark:border-border-light/10">
            <span className="text-[10px] uppercase font-semibold text-text-secondary block">
              Delivery
            </span>
            <span className="text-sm font-semibold text-text-primary flex items-center justify-center gap-1">
              <Icon path={ICON_PATHS.clock} size="sm" className="text-text-secondary" />
              {service.deliveryDays}d
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-text-secondary block">
              Orders
            </span>
            <span className="text-sm font-semibold text-text-primary flex items-center justify-center gap-1">
              {rating ? (
                <>
                  <Icon path={ICON_PATHS.star} size="sm" className="text-warning fill-warning" />
                  {rating}
                </>
              ) : (
                `${service.totalOrders ?? 0}`
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border-light/70 dark:border-border-light/10">
        <span className="text-xs text-text-secondary">
          {service.totalOrders} {service.totalOrders === 1 ? "order completed" : "orders completed"}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/app/freelancer/services/${service.id}`}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center bg-white text-text-secondary hover:text-primary",
              "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#0a0f1a,-3px_-3px_6px_#1e2a4a]",
              "hover:shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff] dark:hover:shadow-[1px_1px_3px_#0a0f1a,-1px_-1px_3px_#1e2a4a]",
              "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
              "transition-all duration-200"
            )}
            title="View Details"
          >
            <Icon path={ICON_PATHS.eye} size="sm" />
          </Link>
          <Link
            href={`/app/freelancer/services/${service.id}/edit`}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center bg-white text-text-secondary hover:text-primary",
              "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#0a0f1a,-3px_-3px_6px_#1e2a4a]",
              "hover:shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff] dark:hover:shadow-[1px_1px_3px_#0a0f1a,-1px_-1px_3px_#1e2a4a]",
              "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
              "transition-all duration-200"
            )}
            title="Edit Service"
          >
            <Icon path={ICON_PATHS.edit} size="sm" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(service.id, service.title)}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center bg-white text-text-secondary hover:text-error",
              "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#0a0f1a,-3px_-3px_6px_#1e2a4a]",
              "hover:shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff] dark:hover:shadow-[1px_1px_3px_#0a0f1a,-1px_-1px_3px_#1e2a4a]",
              "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
              "transition-all duration-200 cursor-pointer"
            )}
            title="Delete Service"
          >
            <Icon path={ICON_PATHS.trash} size="sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

const INITIAL_DELETE_MODAL_STATE = {
  isOpen: false,
  serviceId: null as string | null,
  serviceName: "",
};

type FilterTab = "ALL" | "ACTIVE" | "PAUSED" | "ARCHIVED";

function ServicesPageContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const token = useAuthStore((state) => state.token);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [deleteModalState, setDeleteModalState] = useState(INITIAL_DELETE_MODAL_STATE);
  const [isConfirming, setIsConfirming] = useState(false);
  const [localSuccessToastMessage, setLocalSuccessToastMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (token) {
      getMyServices(token)
        .then((data) => {
          setServices(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error("Failed to fetch services:", error);
          setServices([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [mounted, token]);

  const deletedServiceNameFromQuery = searchParams.get("deleted");
  const querySuccessToastMessage = deletedServiceNameFromQuery
    ? `Service "${deletedServiceNameFromQuery}" deleted successfully.`
    : "";
  const successToastMessage = localSuccessToastMessage || querySuccessToastMessage;

  // KPI Calculations
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.status === "ACTIVE").length;
    const paused = services.filter((s) => s.status === "PAUSED").length;
    const archived = services.filter((s) => s.status === "ARCHIVED").length;
    const totalOrders = services.reduce((acc, s) => acc + (s.totalOrders || 0), 0);

    const ratedServices = services.filter((s) => s.averageRating && parseFloat(s.averageRating) > 0);
    const avgRating =
      ratedServices.length > 0
        ? (
            ratedServices.reduce((acc, s) => acc + parseFloat(s.averageRating || "0"), 0) /
            ratedServices.length
          ).toFixed(1)
        : null;

    return { total, active, paused, archived, totalOrders, avgRating };
  }, [services]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    if (activeFilter === "ALL") return services;
    return services.filter((s) => s.status === activeFilter);
  }, [services, activeFilter]);

  function openDeleteModal(id: string, name: string): void {
    setDeleteModalState({
      isOpen: true,
      serviceId: id,
      serviceName: name,
    });
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!deleteModalState.serviceId || !token) return;

    const deletedServiceName = deleteModalState.serviceName;
    setIsConfirming(true);

    try {
      await deleteService(token, deleteModalState.serviceId);
      setServices((prev) => prev.filter((s) => s.id !== deleteModalState.serviceId));
      setLocalSuccessToastMessage(`Service "${deletedServiceName}" deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete service:", error);
      setLocalSuccessToastMessage("Failed to delete service. Please try again.");
    } finally {
      setIsConfirming(false);
      setDeleteModalState(INITIAL_DELETE_MODAL_STATE);
    }
  }

  function handleToastClose(): void {
    if (localSuccessToastMessage) {
      setLocalSuccessToastMessage("");
      return;
    }

    if (deletedServiceNameFromQuery) {
      router.replace("/app/freelancer/services");
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 transition-all duration-300 ease-in-out">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            My Services
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Create, showcase, and manage your freelance offerings to prospective clients
          </p>
        </div>
        <Link
          href="/app/freelancer/services/new"
          className={cn(PRIMARY_BUTTON, "shrink-0 self-start sm:self-auto")}
        >
          <Icon path={ICON_PATHS.plus} size="sm" />
          Create Service
        </Link>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Services */}
        <div className={cn(NEUMORPHIC_CARD, "p-4 sm:p-5 flex items-center gap-3 sm:gap-4")}>
          <div
            className={cn(
              "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 bg-background text-primary",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
            )}
          >
            <Icon path={ICON_PATHS.briefcase} size="md" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block truncate">
              Total Services
            </span>
            <span className="text-xl sm:text-2xl font-black text-text-primary">
              {isLoading ? "-" : stats.total}
            </span>
          </div>
        </div>

        {/* Active Services */}
        <div className={cn(NEUMORPHIC_CARD, "p-4 sm:p-5 flex items-center gap-3 sm:gap-4")}>
          <div
            className={cn(
              "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 bg-background text-success",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
            )}
          >
            <Icon path={ICON_PATHS.check} size="md" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block truncate">
              Active Listings
            </span>
            <span className="text-xl sm:text-2xl font-black text-text-primary">
              {isLoading ? "-" : stats.active}
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className={cn(NEUMORPHIC_CARD, "p-4 sm:p-5 flex items-center gap-3 sm:gap-4")}>
          <div
            className={cn(
              "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 bg-background text-primary",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
            )}
          >
            <Icon path={ICON_PATHS.shoppingCart} size="md" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block truncate">
              Total Orders
            </span>
            <span className="text-xl sm:text-2xl font-black text-text-primary">
              {isLoading ? "-" : stats.totalOrders}
            </span>
          </div>
        </div>

        {/* Average Rating */}
        <div className={cn(NEUMORPHIC_CARD, "p-4 sm:p-5 flex items-center gap-3 sm:gap-4")}>
          <div
            className={cn(
              "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 bg-background text-warning",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
            )}
          >
            <Icon path={ICON_PATHS.star} size="md" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block truncate">
              Avg Rating
            </span>
            <span className="text-xl sm:text-2xl font-black text-text-primary">
              {isLoading ? "-" : stats.avgRating ? `${stats.avgRating} ★` : "New"}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      {!isLoading && services.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(
            [
              { id: "ALL", label: "All", count: stats.total },
              { id: "ACTIVE", label: "Active", count: stats.active },
              { id: "PAUSED", label: "Paused", count: stats.paused },
              { id: "ARCHIVED", label: "Archived", count: stats.archived },
            ] as const
          ).map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer",
                  isActive
                    ? "bg-primary text-white shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff] dark:shadow-[2px_2px_5px_#0a0f1a,-2px_-2px_5px_#1e2a4a]"
                    : "bg-white text-text-secondary hover:text-primary shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#0a0f1a,-3px_-3px_6px_#1e2a4a] active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px]",
                    isActive ? "bg-white/20 text-white" : "bg-background text-text-secondary"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Services List / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn(NEUMORPHIC_CARD, "p-6 space-y-4 animate-pulse")}>
              <div className="flex items-center justify-between">
                <div className="h-5 bg-background rounded-full w-24" />
                <div className="h-5 bg-background rounded-full w-16" />
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-background rounded w-3/4" />
                <div className="h-4 bg-background rounded w-full" />
                <div className="h-4 bg-background rounded w-2/3" />
              </div>
              <div className="h-16 bg-background rounded-xl" />
              <div className="flex items-center justify-between pt-3 border-t border-border-light/40">
                <div className="h-4 bg-background rounded w-24" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-background rounded-xl" />
                  <div className="w-8 h-8 bg-background rounded-xl" />
                  <div className="w-8 h-8 bg-background rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          variant="card"
          icon={ICON_PATHS.briefcase}
          title="No services yet"
          message="Create your first service offering to start attracting clients and getting hired directly."
          linkHref="/app/freelancer/services/new"
          linkText="Create Your First Service"
        />
      ) : filteredServices.length === 0 ? (
        <div className={cn(NEUMORPHIC_CARD, "p-12 text-center space-y-3")}>
          <div
            className={cn(
              "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-background text-text-secondary",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
            )}
          >
            <Icon path={ICON_PATHS.search} size="lg" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">No services found</h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto">
            You don't have any services with status "{STATUS_LABELS[activeFilter as ServiceStatus] || activeFilter}".
          </p>
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            className="text-xs font-semibold text-primary hover:underline pt-2 cursor-pointer"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} onDelete={openDeleteModal} />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState(INITIAL_DELETE_MODAL_STATE)}
        onConfirm={handleConfirmDelete}
        title="Delete Service?"
        message={`Are you sure you want to delete "${deleteModalState.serviceName}"? This action cannot be undone and will remove your service from the marketplace.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        icon={ICON_PATHS.trash}
        isLoading={isConfirming}
      />

      {/* Toast Notification */}
      {successToastMessage && (
        <Toast message={successToastMessage} type="success" onClose={handleToastClose} />
      )}
    </div>
  );
}

export default function ServicesPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-pulse">
          <div className="h-10 bg-background rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn(NEUMORPHIC_CARD, "h-24")} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={cn(NEUMORPHIC_CARD, "h-64")} />
            ))}
          </div>
        </div>
      }
    >
      <ServicesPageContent />
    </Suspense>
  );
}

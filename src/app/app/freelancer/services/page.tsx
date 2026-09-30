"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { ServiceCard } from "@/components/services/ServiceCard";
import { NEUMORPHIC_CARD, PRIMARY_BUTTON } from "@/lib/styles";
import { getMyServices, deleteService } from "@/lib/api/services";
import { useAuthStore } from "@/stores/auth-store";
import type { Service, ServiceStatus } from "@/types/service.types";

const STATUS_LABELS: Record<ServiceStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  ARCHIVED: "Archived",
};

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

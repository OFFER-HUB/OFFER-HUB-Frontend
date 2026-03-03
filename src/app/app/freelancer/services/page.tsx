"use client";

import { useState, useEffect, Suspense } from "react";
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
  ACTIVE: "bg-success/20 text-success",
  PAUSED: "bg-warning/20 text-warning",
  ARCHIVED: "bg-text-secondary/20 text-text-secondary",
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
  return (
    <div className={cn(NEUMORPHIC_CARD, "p-4")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/app/freelancer/services/${service.id}`}
              className="font-semibold text-text-primary truncate hover:text-primary transition-colors cursor-pointer"
            >
              {service.title}
            </Link>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
                STATUS_STYLES[service.status]
              )}
            >
              {STATUS_LABELS[service.status]}
            </span>
          </div>
          <p className="text-sm text-text-secondary mb-2">{getCategoryLabel(service.category)}</p>
          <p className="text-sm text-text-secondary line-clamp-2">{service.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-primary font-semibold">${parseFloat(service.price).toFixed(2)}</span>
          <span className="text-text-secondary flex items-center gap-1">
            <Icon path={ICON_PATHS.clock} size="sm" />
            {service.deliveryDays} {service.deliveryDays === 1 ? "day" : "days"}
          </span>
          {service.averageRating && (
            <span className="text-text-secondary flex items-center gap-1">
              <Icon path={ICON_PATHS.star} size="sm" className="text-warning" />
              {parseFloat(service.averageRating).toFixed(1)}
            </span>
          )}
          <span className="text-text-secondary">{service.totalOrders} orders</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/app/freelancer/services/${service.id}`}
            className={cn(
              "p-2 rounded-xl bg-white text-primary",
              "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
              "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1)]",
              "transition-all duration-200"
            )}
            title="View"
          >
            <Icon path={ICON_PATHS.eye} size="sm" />
          </Link>
          <Link
            href={`/app/freelancer/services/${service.id}/edit`}
            className={cn(
              "p-2 rounded-xl bg-white text-primary",
              "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
              "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1)]",
              "transition-all duration-200"
            )}
            title="Edit"
          >
            <Icon path={ICON_PATHS.edit} size="sm" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(service.id, service.title)}
            className={cn(
              "p-2 rounded-xl bg-white text-error",
              "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
              "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1)]",
              "transition-all duration-200"
            )}
            title="Delete"
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

function ServicesPageContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const token = useAuthStore((state) => state.token);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalState, setDeleteModalState] = useState(INITIAL_DELETE_MODAL_STATE);
  const [isConfirming, setIsConfirming] = useState(false);
  const [localSuccessToastMessage, setLocalSuccessToastMessage] = useState("");

  // Ensure Zustand hydrates from localStorage on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (token) {
      getMyServices(token)
        .then((services) => {
          setServices(services);
        })
        .catch((error) => {
          console.error('Failed to fetch services:', error);
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
      console.error('Failed to delete service:', error);
      setLocalSuccessToastMessage('Failed to delete service. Please try again.');
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Services</h1>
          <p className="text-text-secondary text-sm">Manage your service offerings</p>
        </div>
        <Link
          href="/app/freelancer/services/new"
          className={cn(PRIMARY_BUTTON, "flex items-center gap-2")}
        >
          <Icon path={ICON_PATHS.plus} size="sm" />
          Create Service
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn(NEUMORPHIC_CARD, "p-4 animate-pulse")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light">
                <div className="flex items-center gap-4">
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                  <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                  <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !Array.isArray(services) || services.length === 0 ? (
        <EmptyState
          variant="card"
          icon={ICON_PATHS.briefcase}
          title="No services yet"
          message="Create your first service to start attracting clients."
          linkHref="/app/freelancer/services/new"
          linkText="Create Your First Service"
        />
      ) : (
        <div className="space-y-4">
          {Array.isArray(services) && services.map((service) => (
            <ServiceCard key={service.id} service={service} onDelete={openDeleteModal} />
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState(INITIAL_DELETE_MODAL_STATE)}
        onConfirm={handleConfirmDelete}
        title="Delete Service?"
        message={`Are you sure you want to delete "${deleteModalState.serviceName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        icon={ICON_PATHS.trash}
        isLoading={isConfirming}
      />

      {successToastMessage && (
        <Toast message={successToastMessage} type="success" onClose={handleToastClose} />
      )}
    </div>
  );
}

export default function ServicesPage(): React.JSX.Element {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Services</h1>
            <p className="text-text-secondary text-sm">Manage your service offerings</p>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn(NEUMORPHIC_CARD, "p-4 animate-pulse")}>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            </div>
          ))}
        </div>
      </div>
    }>
      <ServicesPageContent />
    </Suspense>
  );
}

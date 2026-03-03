"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useModeStore } from "@/stores/mode-store";
import { useAuthStore } from "@/stores/auth-store";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, PRIMARY_BUTTON } from "@/lib/styles";
import { getMyOffers, deleteOffer, type Offer } from "@/lib/api/offers";
import type { ClientOffer, FilterStatus, OfferStatus } from "@/types/client-offer.types";

function mapApiOfferToClientOffer(offer: Offer): ClientOffer {
  const categoryMap: Record<string, string> = {
    WEB_DEVELOPMENT: "Web Development",
    MOBILE_DEVELOPMENT: "Mobile Development",
    DESIGN: "Design & Creative",
    WRITING: "Writing & Translation",
    MARKETING: "Marketing & Sales",
    VIDEO: "Video & Animation",
    MUSIC: "Music & Audio",
    DATA: "Data & Analytics",
    OTHER: "Other",
  };

  return {
    id: offer.id,
    title: offer.title,
    category: categoryMap[offer.category] || offer.category,
    budget: parseFloat(offer.budget),
    deadline: offer.deadline.split("T")[0],
    status: offer.status.toLowerCase() as OfferStatus,
    applicants: offer.applicantsCount,
    createdAt: offer.createdAt.split("T")[0],
  };
}

const FILTER_STATUSES: FilterStatus[] = ["all", "active", "pending", "closed"];

interface OfferRowProps {
  offer: ClientOffer;
  onDelete: (id: string) => void;
}

function OfferRow({ offer, onDelete }: OfferRowProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl",
        NEUMORPHIC_INSET
      )}
    >
      <div className="flex-1 min-w-0">
        <Link
          href={`/app/client/offers/${offer.id}`}
          className="font-medium text-text-primary hover:text-primary transition-colors"
        >
          {offer.title}
        </Link>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-sm text-text-secondary">{offer.category}</span>
          <span className="text-text-secondary">•</span>
          <span className="text-sm text-text-secondary">${offer.budget.toLocaleString()}</span>
          <span className="text-text-secondary">•</span>
          <span className="text-sm text-text-secondary">{offer.applicants} applicants</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge status={offer.status} />

        <div className="flex items-center gap-2">
          <Link
            href={`/app/client/offers/${offer.id}`}
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
            href={`/app/client/offers/${offer.id}/edit`}
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
            onClick={() => onDelete(offer.id)}
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

function formatFilterLabel(status: FilterStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function countByStatus(offers: ClientOffer[], status: FilterStatus): number {
  if (status === "all") return offers.length;
  return offers.filter((o) => o.status === status).length;
}

export default function ManageOffersPage(): React.JSX.Element {
  const { setMode } = useModeStore();
  const token = useAuthStore((state) => state.token);
  const [mounted, setMounted] = useState(false);
  const [offers, setOffers] = useState<ClientOffer[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setMode("client");
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function fetchOffers() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getMyOffers(token);
        setOffers(data.map(mapApiOfferToClientOffer));
      } catch (error) {
        console.error("Failed to fetch offers:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOffers();
  }, [mounted, token]);

  function handleDelete(id: string): void {
    setDeleteTarget(id);
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!deleteTarget || !token) return;
    setIsConfirming(true);

    try {
      await deleteOffer(token, deleteTarget);
      setOffers((prev) => prev.filter((o) => o.id !== deleteTarget));
    } catch (error) {
      console.error("Failed to delete offer:", error);
    } finally {
      setIsConfirming(false);
      setDeleteTarget(null);
      setDeleteModalOpen(false);
    }
  }

  const filteredOffers = filter === "all" ? offers : offers.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Manage Offers</h1>
          <p className="text-text-secondary mt-1">View and manage your posted job offers</p>
        </div>
        <Link href="/app/client/offers/new" className={PRIMARY_BUTTON}>
          <Icon path={ICON_PATHS.plus} size="sm" />
          Create Offer
        </Link>
      </div>

      <div className={NEUMORPHIC_CARD}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
            <span className="ml-3 text-text-secondary">Loading offers...</span>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {FILTER_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                    filter === status
                      ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                      : "text-text-secondary hover:text-text-primary hover:bg-background"
                  )}
                >
                  {formatFilterLabel(status)} ({countByStatus(offers, status)})
                </button>
              ))}
            </div>

            {filteredOffers.length === 0 ? (
              <EmptyState
                icon={ICON_PATHS.briefcase}
                message="No offers found"
                linkHref="/app/client/offers/new"
                linkText="Create your first offer"
              />
            ) : (
              <div className="space-y-3">
                {filteredOffers.map((offer) => (
                  <OfferRow key={offer.id} offer={offer} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Offer?"
        message={`Are you sure you want to delete "${offers.find((o) => o.id === deleteTarget)?.title ?? "this offer"}"? All applicants will be notified.`}
        confirmText="Delete Offer"
        cancelText="Keep Offer"
        variant="danger"
        icon={ICON_PATHS.trash}
        isLoading={isConfirming}
      />
    </div>
  );
}



"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useModeStore } from "@/stores/mode-store";
import { useAuthStore } from "@/stores/auth-store";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { NEUMORPHIC_CARD, PRIMARY_BUTTON } from "@/lib/styles";
import { getMyOffers, deleteOffer } from "@/lib/api/offers";
import type { ClientOffer, FilterStatus } from "@/types/client-offer.types";
import { mapApiOfferToClientOffer, formatFilterLabel, countByStatus } from "@/lib/client-offers";
import { OfferRow } from "@/components/offers/OfferRow";
import { OfferFilterBar } from "@/components/offers/OfferFilterBar";

const FILTER_STATUSES: FilterStatus[] = ["all", "active", "pending", "closed"];

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
            <OfferFilterBar
              statuses={FILTER_STATUSES}
              activeFilter={filter}
              offers={offers}
              onFilterChange={setFilter}
            />

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




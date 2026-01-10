"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useModeStore } from "@/stores/mode-store";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, ICON_BUTTON, PRIMARY_BUTTON } from "@/lib/styles";
import { MOCK_CLIENT_OFFERS } from "@/data/client-offer.data";
import type { ClientOffer, FilterStatus } from "@/types/client-offer.types";

const FILTER_STATUSES: FilterStatus[] = ["all", "active", "pending", "closed"];

interface OfferRowProps {
  offer: ClientOffer;
  onDelete: (id: string) => void;
}

function OfferRow({ offer, onDelete }: OfferRowProps): React.JSX.Element {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl", NEUMORPHIC_INSET)}>
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

        <div className="flex items-center gap-1">
          <Link href={`/app/client/offers/${offer.id}`} className={ICON_BUTTON} title="View">
            <Icon path={ICON_PATHS.eye} size="sm" className="text-text-secondary" />
          </Link>
          <Link href={`/app/client/offers/${offer.id}/edit`} className={ICON_BUTTON} title="Edit">
            <Icon path={ICON_PATHS.edit} size="sm" className="text-text-secondary" />
          </Link>
          <button
            onClick={() => onDelete(offer.id)}
            className={cn(ICON_BUTTON, "hover:text-error")}
            title="Delete"
          >
            <Icon path={ICON_PATHS.trash} size="sm" className="text-text-secondary" />
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
  const [offers, setOffers] = useState<ClientOffer[]>(MOCK_CLIENT_OFFERS);
  const [filter, setFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    setMode("client");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDelete(id: string): void {
    if (confirm("Are you sure you want to delete this offer?")) {
      setOffers((prev) => prev.filter((o) => o.id !== id));
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
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useModeStore } from "@/stores/mode-store";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INSET,
  ICON_BUTTON,
  PRIMARY_BUTTON,
} from "@/lib/styles";

type OfferStatus = "active" | "pending" | "closed";

interface Offer {
  id: string;
  title: string;
  category: string;
  budget: number;
  deadline: string;
  status: OfferStatus;
  applicants: number;
  createdAt: string;
}

const MOCK_OFFERS: Offer[] = [
  {
    id: "1",
    title: "Build a responsive e-commerce website",
    category: "Web Development",
    budget: 2500,
    deadline: "2026-02-15",
    status: "active",
    applicants: 8,
    createdAt: "2026-01-05",
  },
  {
    id: "2",
    title: "Mobile app UI/UX design",
    category: "Design & Creative",
    budget: 1200,
    deadline: "2026-01-25",
    status: "active",
    applicants: 12,
    createdAt: "2026-01-03",
  },
  {
    id: "3",
    title: "Logo design for tech startup",
    category: "Design & Creative",
    budget: 500,
    deadline: "2026-01-20",
    status: "pending",
    applicants: 5,
    createdAt: "2026-01-07",
  },
  {
    id: "4",
    title: "Backend API development",
    category: "Web Development",
    budget: 3000,
    deadline: "2026-01-10",
    status: "closed",
    applicants: 15,
    createdAt: "2025-12-20",
  },
  {
    id: "5",
    title: "Content writing for blog",
    category: "Writing & Translation",
    budget: 300,
    deadline: "2026-01-30",
    status: "active",
    applicants: 3,
    createdAt: "2026-01-08",
  },
];

const STATUS_CONFIG: Record<OfferStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-success", bg: "bg-success/10" },
  pending: { label: "Pending", color: "text-warning", bg: "bg-warning/10" },
  closed: { label: "Closed", color: "text-text-secondary", bg: "bg-gray-100" },
};

type FilterStatus = OfferStatus | "all";

interface StatusBadgeProps {
  status: OfferStatus;
}

function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", config.color, config.bg)}>
      {config.label}
    </span>
  );
}

interface OfferRowProps {
  offer: Offer;
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

export default function ManageOffersPage(): React.JSX.Element {
  const { setMode } = useModeStore();
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
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

  const counts = {
    all: offers.length,
    active: offers.filter((o) => o.status === "active").length,
    pending: offers.filter((o) => o.status === "pending").length,
    closed: offers.filter((o) => o.status === "closed").length,
  };

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
          {(["all", "active", "pending", "closed"] as FilterStatus[]).map((status) => (
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
              {status.charAt(0).toUpperCase() + status.slice(1)} ({counts[status]})
            </button>
          ))}
        </div>

        {filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <Icon path={ICON_PATHS.briefcase} size="xl" className="text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">No offers found</p>
            <Link href="/app/client/offers/new" className="text-primary hover:underline mt-2 inline-block">
              Create your first offer
            </Link>
          </div>
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

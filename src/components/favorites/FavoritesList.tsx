"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useFavoritesStore } from "@/stores/favorites-store";
import { OfferCard } from "@/components/marketplace/OfferCard";
import { ServiceCard } from "@/components/marketplace/ServiceCard";
import { FreelancerCard } from "@/components/marketplace/FreelancerCard";

type Tab = "offers" | "services" | "freelancers";

const TABS: { id: Tab; label: string }[] = [
  { id: "offers", label: "Offers" },
  { id: "services", label: "Services" },
  { id: "freelancers", label: "Freelancers" },
];

export function FavoritesList(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>("offers");
  const offers = useFavoritesStore((s) => s.offers);
  const services = useFavoritesStore((s) => s.services);
  const freelancers = useFavoritesStore((s) => s.freelancers);

  const counts: Record<Tab, number> = {
    offers: offers.length,
    services: services.length,
    freelancers: freelancers.length,
  };

  return (
    <div>
      {/* Tabs */}
      <div
        className={cn(
          "flex gap-2 p-2 rounded-2xl mb-8",
          "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
        )}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl",
              "text-sm font-medium transition-all duration-200",
              activeTab === tab.id
                ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span
                className={cn(
                  "min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center",
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-primary/10 text-primary"
                )}
              >
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "offers" && (
        offers.length === 0 ? (
          <EmptyState label="offers" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )
      )}

      {activeTab === "services" && (
        services.length === 0 ? (
          <EmptyState label="services" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )
      )}

      {activeTab === "freelancers" && (
        freelancers.length === 0 ? (
          <EmptyState label="freelancers" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map((freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 rounded-2xl",
        "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
      )}
    >
      <svg
        className="w-12 h-12 text-text-secondary mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <p className="text-text-primary font-semibold mb-1">No favorite {label} yet</p>
      <p className="text-sm text-text-secondary">
        Click the heart icon on any {label.slice(0, -1)} to save it here.
      </p>
    </div>
  );
}

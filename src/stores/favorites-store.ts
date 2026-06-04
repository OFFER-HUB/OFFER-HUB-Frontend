import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MarketplaceOffer, MarketplaceService } from "@/lib/api/marketplace";
import type { Freelancer } from "@/types/marketplace.types";
import type { FavoriteType } from "@/types/favorites.types";

interface FavoritesState {
  offerIds: string[];
  serviceIds: string[];
  freelancerIds: string[];
  offers: MarketplaceOffer[];
  services: MarketplaceService[];
  freelancers: Freelancer[];

  isFavorite: (type: FavoriteType, id: string) => boolean;
  addOffer: (offer: MarketplaceOffer) => void;
  removeOffer: (id: string) => void;
  addService: (service: MarketplaceService) => void;
  removeService: (id: string) => void;
  addFreelancer: (freelancer: Freelancer) => void;
  removeFreelancer: (id: string) => void;
  toggleOffer: (offer: MarketplaceOffer) => void;
  toggleService: (service: MarketplaceService) => void;
  toggleFreelancer: (freelancer: Freelancer) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      offerIds: [],
      serviceIds: [],
      freelancerIds: [],
      offers: [],
      services: [],
      freelancers: [],

      isFavorite: (type, id) => {
        const { offerIds, serviceIds, freelancerIds } = get();
        if (type === "offer") return offerIds.includes(id);
        if (type === "service") return serviceIds.includes(id);
        return freelancerIds.includes(id);
      },

      addOffer: (offer) =>
        set((s) =>
          s.offerIds.includes(offer.id)
            ? s
            : { offerIds: [...s.offerIds, offer.id], offers: [...s.offers, offer] }
        ),

      removeOffer: (id) =>
        set((s) => ({
          offerIds: s.offerIds.filter((i) => i !== id),
          offers: s.offers.filter((o) => o.id !== id),
        })),

      addService: (service) =>
        set((s) =>
          s.serviceIds.includes(service.id)
            ? s
            : { serviceIds: [...s.serviceIds, service.id], services: [...s.services, service] }
        ),

      removeService: (id) =>
        set((s) => ({
          serviceIds: s.serviceIds.filter((i) => i !== id),
          services: s.services.filter((sv) => sv.id !== id),
        })),

      addFreelancer: (freelancer) =>
        set((s) =>
          s.freelancerIds.includes(freelancer.id)
            ? s
            : {
                freelancerIds: [...s.freelancerIds, freelancer.id],
                freelancers: [...s.freelancers, freelancer],
              }
        ),

      removeFreelancer: (id) =>
        set((s) => ({
          freelancerIds: s.freelancerIds.filter((i) => i !== id),
          freelancers: s.freelancers.filter((f) => f.id !== id),
        })),

      toggleOffer: (offer) => {
        const { offerIds, addOffer, removeOffer } = get();
        offerIds.includes(offer.id) ? removeOffer(offer.id) : addOffer(offer);
      },

      toggleService: (service) => {
        const { serviceIds, addService, removeService } = get();
        serviceIds.includes(service.id) ? removeService(service.id) : addService(service);
      },

      toggleFreelancer: (freelancer) => {
        const { freelancerIds, addFreelancer, removeFreelancer } = get();
        freelancerIds.includes(freelancer.id)
          ? removeFreelancer(freelancer.id)
          : addFreelancer(freelancer);
      },
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

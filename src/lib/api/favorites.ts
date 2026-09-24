/**
 * Favorites API client.
 * Currently backed by the local Zustand store (persisted to localStorage).
 * Replace with real HTTP calls when the backend endpoint is available.
 */
import { useFavoritesStore } from "@/stores/favorites-store";
import type { MarketplaceOffer, MarketplaceService } from "@/lib/api/marketplace";
import type { Freelancer } from "@/types/marketplace.types";
import type { FavoriteType } from "@/types/favorites.types";

export function isFavorited(type: FavoriteType, id: string): boolean {
  return useFavoritesStore.getState().isFavorite(type, id);
}

export function toggleFavoriteOffer(offer: MarketplaceOffer): void {
  useFavoritesStore.getState().toggleOffer(offer);
}

export function toggleFavoriteService(service: MarketplaceService): void {
  useFavoritesStore.getState().toggleService(service);
}

export function toggleFavoriteFreelancer(freelancer: Freelancer): void {
  useFavoritesStore.getState().toggleFreelancer(freelancer);
}

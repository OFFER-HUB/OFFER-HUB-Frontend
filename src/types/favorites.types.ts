import type { MarketplaceOffer, MarketplaceService } from "@/lib/api/marketplace";
import type { Freelancer } from "@/types/marketplace.types";

export type FavoriteType = "offer" | "service" | "freelancer";

export interface FavoriteOffer {
  type: "offer";
  id: string;
  item: MarketplaceOffer;
}

export interface FavoriteService {
  type: "service";
  id: string;
  item: MarketplaceService;
}

export interface FavoriteFreelancer {
  type: "freelancer";
  id: string;
  item: Freelancer;
}

export type FavoriteItem = FavoriteOffer | FavoriteService | FavoriteFreelancer;

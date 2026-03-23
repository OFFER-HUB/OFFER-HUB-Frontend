import {
  getPublicOffers,
  getPublicServices,
  type MarketplaceOffer,
  type MarketplaceService,
} from "@/lib/api/marketplace";

export type SearchTab = "offers" | "services" | "freelancers";

export type SearchSort = "relevance" | "price" | "rating" | "date";

export interface FreelancerSearchHit {
  userId: string;
  user: MarketplaceService["user"];
  serviceCount: number;
  avgRating: number | null;
  minPrice: number;
  showcaseServiceId: string;
  categories: string[];
  services: MarketplaceService[];
}

const CATEGORY_LABELS: Record<string, string> = {
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

export const SEARCH_SKILL_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export interface SearchOffersResult {
  data: MarketplaceOffer[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface SearchServicesResult {
  data: MarketplaceService[];
  hasMore: boolean;
  nextCursor?: string;
}

export function aggregateFreelancersFromServices(services: MarketplaceService[]): FreelancerSearchHit[] {
  const byUser = new Map<string, MarketplaceService[]>();
  for (const s of services) {
    const list = byUser.get(s.userId) ?? [];
    list.push(s);
    byUser.set(s.userId, list);
  }

  return Array.from(byUser.values()).map((list) => {
    const ratings = list
      .map((s) => (s.averageRating ? parseFloat(s.averageRating) : null))
      .filter((x): x is number => x !== null && !Number.isNaN(x));
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    const prices = list.map((s) => parseFloat(s.price)).filter((n) => !Number.isNaN(n));
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const sortedByPrice = [...list].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    const showcase = sortedByPrice[0] ?? list[0];

    return {
      userId: list[0].userId,
      user: list[0].user,
      serviceCount: list.length,
      avgRating,
      minPrice,
      showcaseServiceId: showcase.id,
      categories: [...new Set(list.map((s) => s.category))],
      services: list,
    };
  });
}

export async function fetchSearchOffers(params: {
  search?: string;
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  limit?: number;
  cursor?: string;
}): Promise<SearchOffersResult> {
  return getPublicOffers({
    search: params.search,
    category: params.category || undefined,
    minBudget: params.minBudget,
    maxBudget: params.maxBudget,
    limit: params.limit ?? 20,
    cursor: params.cursor,
  });
}

export async function fetchSearchServices(params: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  cursor?: string;
}): Promise<SearchServicesResult> {
  return getPublicServices({
    search: params.search,
    category: params.category || undefined,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    limit: params.limit ?? 20,
    cursor: params.cursor,
  });
}

export async function fetchFreelancerHitsFromServices(params: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  cursor?: string;
}): Promise<{
  hits: FreelancerSearchHit[];
  rawServices: MarketplaceService[];
  hasMore: boolean;
  nextCursor?: string;
}> {
  const res = await getPublicServices({
    search: params.search,
    category: params.category || undefined,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    limit: params.limit ?? 40,
    cursor: params.cursor,
  });
  return {
    hits: aggregateFreelancersFromServices(res.data),
    rawServices: res.data,
    hasMore: res.hasMore,
    nextCursor: res.nextCursor,
  };
}

export function filterBySkills<T extends { category: string }>(items: T[], skills: Set<string>): T[] {
  if (skills.size === 0) return items;
  return items.filter((item) => skills.has(item.category));
}

export function filterFreelancersBySkills(hits: FreelancerSearchHit[], skills: Set<string>): FreelancerSearchHit[] {
  if (skills.size === 0) return hits;
  return hits.filter((h) => h.categories.some((c) => skills.has(c)));
}

export function filterByMinRatingServices(
  items: MarketplaceService[],
  minRating: number
): MarketplaceService[] {
  if (minRating <= 0) return items;
  return items.filter((s) => {
    const r = s.averageRating ? parseFloat(s.averageRating) : null;
    return r !== null && !Number.isNaN(r) && r >= minRating;
  });
}

export function filterByMinRatingFreelancers(
  hits: FreelancerSearchHit[],
  minRating: number
): FreelancerSearchHit[] {
  if (minRating <= 0) return hits;
  return hits.filter((h) => h.avgRating !== null && h.avgRating >= minRating);
}

export function filterFreelancersByPriceRange(
  hits: FreelancerSearchHit[],
  minPrice: number,
  maxPrice: number
): FreelancerSearchHit[] {
  return hits.filter((h) =>
    h.services.some((s) => {
      const p = parseFloat(s.price);
      if (Number.isNaN(p)) return false;
      return p >= minPrice && p <= maxPrice;
    })
  );
}

function relevanceScore(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  if (t === q) return 4;
  if (t.startsWith(q)) return 3;
  if (t.includes(q)) return 2;
  return 1;
}

export function sortOffers(
  items: MarketplaceOffer[],
  sort: SearchSort,
  query: string
): MarketplaceOffer[] {
  const copy = [...items];
  switch (sort) {
    case "price":
      return copy.sort((a, b) => parseFloat(a.budget) - parseFloat(b.budget));
    case "date":
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "rating":
      return copy;
    case "relevance":
    default:
      if (!query.trim()) return copy;
      return copy.sort(
        (a, b) =>
          relevanceScore(a.title + " " + a.description, query) -
          relevanceScore(b.title + " " + b.description, query)
      );
  }
}

export function sortServices(
  items: MarketplaceService[],
  sort: SearchSort,
  query: string
): MarketplaceService[] {
  const copy = [...items];
  switch (sort) {
    case "price":
      return copy.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    case "rating":
      return copy.sort((a, b) => {
        const ra = a.averageRating ? parseFloat(a.averageRating) : -1;
        const rb = b.averageRating ? parseFloat(b.averageRating) : -1;
        return rb - ra;
      });
    case "date":
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "relevance":
    default:
      if (!query.trim()) return copy;
      return copy.sort(
        (a, b) =>
          relevanceScore(a.title + " " + a.description, query) -
          relevanceScore(b.title + " " + b.description, query)
      );
  }
}

export function sortFreelancerHits(
  hits: FreelancerSearchHit[],
  sort: SearchSort,
  query: string
): FreelancerSearchHit[] {
  const copy = [...hits];
  const nameHit = (h: FreelancerSearchHit) => {
    const u = h.user;
    const name =
      u.firstName && u.lastName
        ? `${u.firstName} ${u.lastName}`
        : u.username || u.email?.split("@")[0] || "";
    return name + " " + h.services.map((s) => s.title).join(" ");
  };
  switch (sort) {
    case "price":
      return copy.sort((a, b) => a.minPrice - b.minPrice);
    case "rating":
      return copy.sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1));
    case "date":
      return copy.sort(
        (a, b) =>
          Math.max(...b.services.map((s) => new Date(s.createdAt).getTime())) -
          Math.max(...a.services.map((s) => new Date(s.createdAt).getTime()))
      );
    case "relevance":
    default:
      if (!query.trim()) return copy;
      return copy.sort(
        (a, b) => relevanceScore(nameHit(a), query) - relevanceScore(nameHit(b), query)
      );
  }
}

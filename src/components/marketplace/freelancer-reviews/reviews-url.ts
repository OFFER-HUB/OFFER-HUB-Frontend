import type { PublicReviewSort } from "@/types/public-freelancer.types";

export function buildFreelancerReviewsQuery(params: {
  sort?: PublicReviewSort;
  stars?: number;
  page?: number;
  pageSize?: number;
}): string {
  const q = new URLSearchParams();
  if (params.sort && params.sort !== "newest") {
    q.set("sort", params.sort);
  }
  if (params.stars !== undefined && params.stars >= 1 && params.stars <= 5) {
    q.set("stars", String(params.stars));
  }
  if (params.page !== undefined && params.page > 1) {
    q.set("page", String(params.page));
  }
  if (params.pageSize !== undefined && params.pageSize !== 10) {
    q.set("pageSize", String(params.pageSize));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function parseReviewsSearchParams(searchParams: Record<string, string | string[] | undefined>): {
  sort: PublicReviewSort;
  stars?: number;
  page: number;
  pageSize: number;
} {
  const sortRaw = typeof searchParams.sort === "string" ? searchParams.sort : "";
  const sort: PublicReviewSort =
    sortRaw === "oldest" || sortRaw === "highest" || sortRaw === "lowest" || sortRaw === "newest"
      ? sortRaw
      : "newest";

  let stars: number | undefined;
  const starsRaw = typeof searchParams.stars === "string" ? searchParams.stars : "";
  if (starsRaw) {
    const n = Number.parseInt(starsRaw, 10);
    if (n >= 1 && n <= 5) stars = n;
  }

  let page = 1;
  const pageRaw = typeof searchParams.page === "string" ? searchParams.page : "";
  if (pageRaw) {
    const n = Number.parseInt(pageRaw, 10);
    if (n >= 1) page = n;
  }

  let pageSize = 10;
  const psRaw = typeof searchParams.pageSize === "string" ? searchParams.pageSize : "";
  if (psRaw) {
    const n = Number.parseInt(psRaw, 10);
    if ([5, 10, 25, 50].includes(n)) pageSize = n;
  }

  return { sort, stars, page, pageSize };
}

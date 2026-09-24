import { API_URL } from "@/config/api";
import { normalizePortfolioImages } from "@/lib/portfolio-image-helpers";
import type { PortfolioItem, PortfolioFormData } from "@/types/portfolio.types";

const API_BASE_URL = API_URL;

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getPortfolioItems(token: string | null): Promise<PortfolioItem[]> {
  const response = await fetch(`${API_BASE_URL}/portfolio`, {
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to fetch portfolio");
  }

  const data = await response.json();
  const list = (data.data ?? data) as PortfolioItem[];
  return list.map((item) => ({
    ...item,
    images: normalizePortfolioImages(item.images),
  }));
}

export async function getPortfolioItemById(
  token: string | null,
  id: string
): Promise<PortfolioItem> {
  const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to fetch portfolio item");
  }

  const data = await response.json();
  const item = (data.data ?? data) as PortfolioItem;
  return {
    ...item,
    images: normalizePortfolioImages(item.images),
  };
}

export async function createPortfolioItem(
  token: string | null,
  formData: PortfolioFormData
): Promise<PortfolioItem> {
  const response = await fetch(`${API_BASE_URL}/portfolio`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to create portfolio item");
  }

  const data = await response.json();
  const created = (data.data ?? data) as PortfolioItem;
  return {
    ...created,
    images: normalizePortfolioImages(created.images),
  };
}

export async function updatePortfolioItem(
  token: string | null,
  id: string,
  formData: PortfolioFormData
): Promise<PortfolioItem> {
  const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to update portfolio item");
  }

  const data = await response.json();
  const updated = (data.data ?? data) as PortfolioItem;
  return {
    ...updated,
    images: normalizePortfolioImages(updated.images),
  };
}

export async function deletePortfolioItem(
  token: string | null,
  id: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to delete portfolio item");
  }
}

export async function reorderPortfolioItems(
  token: string | null,
  orderedIds: string[]
): Promise<PortfolioItem[]> {
  const response = await fetch(`${API_BASE_URL}/portfolio/reorder`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderedIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to reorder portfolio");
  }

  const data = await response.json();
  const list = (data.data ?? data) as PortfolioItem[];
  return list.map((item) => ({
    ...item,
    images: normalizePortfolioImages(item.images),
  }));
}

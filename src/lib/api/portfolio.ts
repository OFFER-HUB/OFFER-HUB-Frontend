import { API_URL } from "@/config/api";
import { MOCK_PORTFOLIO_ITEMS } from "@/data/portfolio.data";
import type { PortfolioItem, PortfolioFormData } from "@/types/portfolio.types";

const API_BASE_URL = API_URL;

/**
 * Set to false when real portfolio API endpoints are available on the backend.
 */
const USE_MOCK = true;

// ─── In-memory mock store ─────────────────────────────────────────────────────
const mockStore: PortfolioItem[] = structuredClone(MOCK_PORTFOLIO_ITEMS);

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getPortfolioItems(token: string | null): Promise<PortfolioItem[]> {
  if (USE_MOCK) {
    await simulateDelay(500);
    return structuredClone(mockStore).sort((a, b) => a.order - b.order);
  }

  const response = await fetch(`${API_BASE_URL}/portfolio`, {
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to fetch portfolio");
  }

  const data = await response.json();
  return (data.data ?? data) as PortfolioItem[];
}

export async function getPortfolioItemById(
  token: string | null,
  id: string
): Promise<PortfolioItem> {
  if (USE_MOCK) {
    await simulateDelay(300);
    const found = mockStore.find((p) => p.id === id);
    if (!found) throw new Error("Portfolio item not found");
    return structuredClone(found);
  }

  const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to fetch portfolio item");
  }

  const data = await response.json();
  return (data.data ?? data) as PortfolioItem;
}

export async function createPortfolioItem(
  token: string | null,
  formData: PortfolioFormData
): Promise<PortfolioItem> {
  if (USE_MOCK) {
    await simulateDelay(600);
    const newItem: PortfolioItem = {
      id: generateId(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags,
      images: formData.images,
      projectUrl: formData.projectUrl || undefined,
      repoUrl: formData.repoUrl || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      isPublic: formData.isPublic,
      order: mockStore.length,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    mockStore.push(newItem);
    return structuredClone(newItem);
  }

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
  return (data.data ?? data) as PortfolioItem;
}

export async function updatePortfolioItem(
  token: string | null,
  id: string,
  formData: PortfolioFormData
): Promise<PortfolioItem> {
  if (USE_MOCK) {
    await simulateDelay(500);
    const idx = mockStore.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Portfolio item not found");

    mockStore[idx] = {
      ...mockStore[idx],
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags,
      images: formData.images,
      projectUrl: formData.projectUrl || undefined,
      repoUrl: formData.repoUrl || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      isPublic: formData.isPublic,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    return structuredClone(mockStore[idx]);
  }

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
  return (data.data ?? data) as PortfolioItem;
}

export async function deletePortfolioItem(
  token: string | null,
  id: string
): Promise<void> {
  if (USE_MOCK) {
    await simulateDelay(400);
    const idx = mockStore.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Portfolio item not found");
    mockStore.splice(idx, 1);
    // Re-normalize order
    mockStore.forEach((item, i) => {
      item.order = i;
    });
    return;
  }

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
  if (USE_MOCK) {
    await simulateDelay(300);
    orderedIds.forEach((id, idx) => {
      const item = mockStore.find((p) => p.id === id);
      if (item) item.order = idx;
    });
    return structuredClone(mockStore).sort((a, b) => a.order - b.order);
  }

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
  return (data.data ?? data) as PortfolioItem[];
}

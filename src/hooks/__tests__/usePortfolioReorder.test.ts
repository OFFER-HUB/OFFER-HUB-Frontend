import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePortfolioReorder } from "@/hooks/usePortfolioReorder";
import { reorderPortfolioItems } from "@/lib/api/portfolio";
import type { PortfolioItem } from "@/types/portfolio.types";

vi.mock("@/lib/api/portfolio", () => ({
  reorderPortfolioItems: vi.fn().mockResolvedValue([]),
}));

const mockItems: PortfolioItem[] = [
  {
    id: "item-1",
    title: "Project 1",
    description: "Description 1",
    category: "web_development",
    tags: ["React"],
    images: [],
    projectUrl: "https://example.com/1",
    startDate: "2023-01-01",
    endDate: "2023-02-01",
    isPublic: true,
    order: 0,
  },
  {
    id: "item-2",
    title: "Project 2",
    description: "Description 2",
    category: "design",
    tags: ["Figma"],
    images: [],
    projectUrl: "https://example.com/2",
    startDate: "2023-03-01",
    endDate: "2023-04-01",
    isPublic: true,
    order: 1,
  },
  {
    id: "item-3",
    title: "Project 3",
    description: "Description 3",
    category: "writing",
    tags: ["SEO"],
    images: [],
    projectUrl: "https://example.com/3",
    startDate: "2023-05-01",
    endDate: "2023-06-01",
    isPublic: true,
    order: 2,
  },
];

describe("usePortfolioReorder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles moving an item up", () => {
    let items = [...mockItems];
    const setItems = vi.fn((updater) => {
      items = typeof updater === "function" ? updater(items) : updater;
    });

    const { result } = renderHook(() =>
      usePortfolioReorder({
        items,
        setItems,
        token: "test-token",
      })
    );

    act(() => {
      result.current.handleMoveUp(1);
    });

    expect(setItems).toHaveBeenCalled();
    expect(items[0].id).toBe("item-2");
    expect(items[1].id).toBe("item-1");
  });

  it("does nothing when moving up index 0", () => {
    const items = [...mockItems];
    const setItems = vi.fn();

    const { result } = renderHook(() =>
      usePortfolioReorder({
        items,
        setItems,
        token: "test-token",
      })
    );

    act(() => {
      result.current.handleMoveUp(0);
    });

    expect(setItems).not.toHaveBeenCalled();
  });

  it("handles moving an item down", () => {
    let items = [...mockItems];
    const setItems = vi.fn((updater) => {
      items = typeof updater === "function" ? updater(items) : updater;
    });

    const { result } = renderHook(() =>
      usePortfolioReorder({
        items,
        setItems,
        token: "test-token",
      })
    );

    act(() => {
      result.current.handleMoveDown(0);
    });

    expect(setItems).toHaveBeenCalled();
    expect(items[0].id).toBe("item-2");
    expect(items[1].id).toBe("item-1");
  });

  it("does nothing when moving down the last item", () => {
    const items = [...mockItems];
    const setItems = vi.fn();

    const { result } = renderHook(() =>
      usePortfolioReorder({
        items,
        setItems,
        token: "test-token",
      })
    );

    act(() => {
      result.current.handleMoveDown(items.length - 1);
    });

    expect(setItems).not.toHaveBeenCalled();
  });

  it("manages drag and drop state and persists reorder", () => {
    let items = [...mockItems];
    const setItems = vi.fn((updater) => {
      items = typeof updater === "function" ? updater(items) : updater;
    });
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      usePortfolioReorder({
        items,
        setItems,
        token: "test-token",
        onSuccess,
      })
    );

    act(() => {
      result.current.handleDragStart("item-1");
    });
    expect(result.current.dragId).toBe("item-1");

    const mockDragOverEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;
    act(() => {
      result.current.handleDragOver(mockDragOverEvent, "item-3");
    });
    expect(result.current.dragOverId).toBe("item-3");

    const mockDropEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;
    act(() => {
      result.current.handleDrop(mockDropEvent, "item-3");
    });

    expect(setItems).toHaveBeenCalled();
    expect(reorderPortfolioItems).toHaveBeenCalledWith("test-token", ["item-2", "item-1", "item-3"]);
    expect(onSuccess).toHaveBeenCalledWith("Order saved.");
    expect(result.current.dragId).toBeNull();
    expect(result.current.dragOverId).toBeNull();
  });
});

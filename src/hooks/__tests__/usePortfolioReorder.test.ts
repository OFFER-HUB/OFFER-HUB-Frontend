import { describe, it, expect } from "vitest";
import { buildReorderedIds } from "@/hooks/usePortfolioReorder";
import type { PortfolioItem } from "@/types/portfolio.types";

function makeItem(id: string, order: number): PortfolioItem {
  return {
    id,
    title: `Project ${id}`,
    description: "",
    category: "other",
    tags: [],
    images: [],
    isPublic: true,
    order,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
}

function makeItems(ids: string[]): PortfolioItem[] {
  return ids.map((id, i) => makeItem(id, i));
}

describe("buildReorderedIds", () => {
  it("moves dragged item directly before the drop target", () => {
    const items = makeItems(["a", "b", "c", "d"]);
    expect(buildReorderedIds(items, "a", "c")).toEqual(["b", "a", "c", "d"]);
  });

  it("moves a middle item forward before the target", () => {
    const items = makeItems(["a", "b", "c", "d"]);
    expect(buildReorderedIds(items, "b", "d")).toEqual(["a", "c", "b", "d"]);
  });

  it("moves an item to the end when dropped on the last card", () => {
    const items = makeItems(["a", "b", "c"]);
    expect(buildReorderedIds(items, "a", "c")).toEqual(["b", "a", "c"]);
  });

  it("returns unchanged order when dragging onto itself", () => {
    const items = makeItems(["a", "b", "c"]);
    expect(buildReorderedIds(items, "b", "b")).toEqual(["a", "b", "c"]);
  });

  it("does not mutate the source array", () => {
    const items = makeItems(["a", "b", "c"]);
    const snapshot = items.map((i) => i.id);
    buildReorderedIds(items, "a", "c");
    expect(items.map((i) => i.id)).toEqual(snapshot);
  });
});

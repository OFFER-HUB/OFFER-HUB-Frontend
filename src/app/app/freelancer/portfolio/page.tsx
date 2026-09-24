"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import {
  getPortfolioItems,
  deletePortfolioItem,
  reorderPortfolioItems,
} from "@/lib/api/portfolio";
import type { PortfolioItem } from "@/types/portfolio.types";

// ─── Drag state ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 6;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PortfolioPage(): React.JSX.Element {
  const { token } = useAuthStore();

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null);

  // Drag state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

  // Success toast
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchItems() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPortfolioItems(token);
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load portfolio");
      } finally {
        setIsLoading(false);
      }
    }
    fetchItems();
  }, [token, refreshKey]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // ── Move up/down ──────────────────────────────────────────────────────────
  function handleMoveUp(index: number) {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((item, i) => ({ ...item, order: i }));
    });
  }

  function handleMoveDown(index: number) {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((item, i) => ({ ...item, order: i }));
    });
  }

  // ── Toggle public ─────────────────────────────────────────────────────────
  function handleTogglePublic(item: PortfolioItem) {
    setItems((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, isPublic: !p.isPublic } : p))
    );
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deletePortfolioItem(token, deleteTarget.id);
    setItems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
    showToast("Project deleted successfully.");
  }, [token, deleteTarget]);

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  function handleDragStart(id: string) {
    setDragId(id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (id !== dragId) setDragOverId(id);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }

    setItems((prev) => {
      const next = [...prev];
      const fromIdx = next.findIndex((p) => p.id === dragId);
      const toIdx = next.findIndex((p) => p.id === targetId);
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next.map((item, i) => ({ ...item, order: i }));
    });

    // Persist reorder (fire and forget in mock mode)
    const orderedIds = items
      .filter((p) => p.id !== dragId)
      .reduce<string[]>((acc, p) => {
        if (p.id === targetId) {
          acc.push(dragId, p.id);
        } else {
          acc.push(p.id);
        }
        return acc;
      }, []);
    reorderPortfolioItems(token, orderedIds).catch(console.error);

    setDragId(null);
    setDragOverId(null);
    showToast("Order saved.");
  }

  function handleDragEnd() {
    setDragId(null);
    setDragOverId(null);
  }

  // ─────────────────────────────────────────────────────────────────────────

  if (isLoading) return <LoadingState message="Loading portfolio..." />;
  if (error)
    return (
      <ErrorState message={error} onRetry={() => setRefreshKey((k) => k + 1)} />
    );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Portfolio</h1>
          <p className="text-sm text-text-secondary">
            Showcase your best work to attract clients
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toast */}
          {toast && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 text-success animate-scale-in">
              <Icon path={ICON_PATHS.check} size="sm" />
              <span className="text-sm font-medium">{toast}</span>
            </div>
          )}

          {/* Stats badge */}
          {!isLoading && items.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10">
              <Icon path={ICON_PATHS.briefcase} size="sm" className="text-primary" />
              <span className="text-sm font-semibold text-primary">
                {items.length} project{items.length !== 1 ? "s" : ""}
                {" · "}
                <span className="font-normal text-primary/70">
                  {items.filter((p) => p.isPublic).length} public
                </span>
              </span>
            </div>
          )}

          <Link
            href="/app/freelancer/portfolio/new"
            className={cn(
              "px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2",
              "bg-primary text-white",
              "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "hover:opacity-90 transition-all duration-200"
            )}
          >
            <Icon path={ICON_PATHS.plus} size="sm" />
            Add Project
          </Link>
        </div>
      </div>

      {/* Drag hint */}
      {items.length > 1 && (
        <div className={cn(NEUMORPHIC_CARD, "py-3 flex items-center gap-3")}>
          <Icon path={ICON_PATHS.menu} size="sm" className="text-text-secondary" />
          <p className="text-xs text-text-secondary">
            Drag the <span className="font-medium">≡</span> handle on a card to reorder, or use the ↑↓ arrows.
          </p>
        </div>
      )}

      {/* Grid or Empty */}
      {items.length === 0 ? (
        <EmptyState
          variant="card"
          icon={ICON_PATHS.image}
          title="No projects yet"
          message="Start building your portfolio by adding your first project. Showcase your skills and attract more clients."
          actionLabel="Add Your First Project"
          onAction={() => {
            window.location.href = "/app/freelancer/portfolio/new";
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map((item, pageIdx) => {
            const globalIdx = (currentPage - 1) * itemsPerPage + pageIdx;
            const isDraggingOver = dragOverId === item.id && dragId !== item.id;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "transition-all duration-150",
                  isDraggingOver && "scale-[1.02] ring-2 ring-primary/40 rounded-2xl"
                )}
              >
                <PortfolioCard
                  item={item}
                  isFirst={globalIdx === 0}
                  isLast={globalIdx === items.length - 1}
                  isDragging={dragId === item.id}
                  onEdit={() => {}}
                  onDelete={() => setDeleteTarget(item)}
                  onMoveUp={() => handleMoveUp(globalIdx)}
                  onMoveDown={() => handleMoveDown(globalIdx)}
                  onTogglePublic={() => handleTogglePublic(item)}
                  dragHandleProps={{
                    onMouseDown: (e) => e.stopPropagation(),
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && items.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={items.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Permanently delete "${deleteTarget?.title ?? "this project"}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

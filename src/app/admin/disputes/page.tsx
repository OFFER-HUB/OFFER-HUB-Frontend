"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { DisputesFilters } from "@/components/admin/disputes/DisputesFilters";
import { DisputesTable } from "@/components/admin/disputes/DisputesTable";
import {
  DisputeResolutionForm,
  StatusChangeForm,
} from "@/components/admin/disputes/DisputeResolutionForm";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import {
  getAdminDisputes,
  resolveDispute,
  updateDisputeStatus,
} from "@/lib/api/admin-disputes";
import {
  ADMIN_DISPUTE_STATUS_CONFIG,
  ADMIN_DISPUTE_PRIORITY_CONFIG,
  type AdminDispute,
  type AdminDisputesFilters,
  type AdminDisputesSort,
  type AdminDisputeSortField,
  type DisputeResolutionOutcome,
} from "@/types/admin.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: AdminDisputesFilters = {
  search: "",
  status: "ALL",
  priority: "ALL",
  reason: "ALL",
  openedAfter: "",
  openedBefore: "",
};

const DEFAULT_SORT: AdminDisputesSort = {
  field: "createdAt",
  direction: "desc",
};

// Priority order for sorting
const PRIORITY_ORDER: Record<AdminDispute["priority"], number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// ─── Inline modal wrapper ─────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ isOpen, title, onClose, children }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(NEUMORPHIC_CARD, "relative w-full max-w-lg animate-scale-in")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
            aria-label="Close"
          >
            <Icon path={ICON_PATHS.close} size="md" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Stats Card ───────────────────────────────────────────────────────────────

interface StatsCardProps {
  label: string;
  value: number;
  color: string;
  bg: string;
}

function StatsCard({ label, value, color, bg }: StatsCardProps) {
  return (
    <div className={cn(NEUMORPHIC_CARD, "p-4 flex items-center justify-between")}>
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={cn("text-xl font-bold px-3 py-1 rounded-xl", color, bg)}>
        {value}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDisputesPage(): React.JSX.Element | null {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();

  const [isAuthorized, setIsAuthorized] = useState(false);

  // ── Data ──
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Filters & sort ──
  const [filters, setFilters] = useState<AdminDisputesFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<AdminDisputesSort>(DEFAULT_SORT);

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ── Modals ──
  const [resolveTarget, setResolveTarget] = useState<AdminDispute | null>(null);
  const [statusTarget, setStatusTarget] = useState<AdminDispute | null>(null);

  // ── Admin guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || user === null) {
      router.replace("/login");
      return;
    }
    if (user.type !== "ADMIN") {
      router.replace("/app/client/dashboard");
      return;
    }
    setIsAuthorized(true);
  }, [user, isAuthenticated, router]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthorized || !token) return;

    async function fetchDisputes() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAdminDisputes(token!);
        setDisputes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load disputes");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDisputes();
  }, [isAuthorized, token]);

  // ── Client-side filter + sort ─────────────────────────────────────────────
  const filteredDisputes = useMemo(() => {
    const q = filters.search.toLowerCase();

    return disputes
      .filter((d) => {
        const matchesSearch =
          !q ||
          d.offerTitle.toLowerCase().includes(q) ||
          d.buyer.username.toLowerCase().includes(q) ||
          d.seller.username.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q);

        const matchesStatus = filters.status === "ALL" || d.status === filters.status;
        const matchesPriority = filters.priority === "ALL" || d.priority === filters.priority;
        const matchesReason = filters.reason === "ALL" || d.reason === filters.reason;

        const openedDate = new Date(d.createdAt);
        const matchesAfter =
          !filters.openedAfter || openedDate >= new Date(filters.openedAfter);
        const matchesBefore =
          !filters.openedBefore || openedDate <= new Date(filters.openedBefore);

        return matchesSearch && matchesStatus && matchesPriority && matchesReason && matchesAfter && matchesBefore;
      })
      .sort((a, b) => {
        const dir = sort.direction === "asc" ? 1 : -1;
        switch (sort.field) {
          case "createdAt":
            return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          case "updatedAt":
            return dir * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
          case "amount":
            return dir * (a.amount - b.amount);
          case "priority":
            return dir * (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
          case "status": {
            const statusOrder = { open: 1, under_review: 2, resolved: 3, closed: 4 };
            return dir * (statusOrder[a.status] - statusOrder[b.status]);
          }
          default:
            return 0;
        }
      });
  }, [disputes, filters, sort]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      open: disputes.filter((d) => d.status === "open").length,
      under_review: disputes.filter((d) => d.status === "under_review").length,
      critical: disputes.filter((d) => d.priority === "critical" && d.status !== "resolved" && d.status !== "closed").length,
      total: disputes.length,
    };
  }, [disputes]);

  const totalPages = Math.max(1, Math.ceil(filteredDisputes.length / itemsPerPage));

  const paginatedDisputes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDisputes.slice(start, start + itemsPerPage);
  }, [filteredDisputes, currentPage, itemsPerPage]);

  // Reset page on filter/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sort, itemsPerPage]);

  // ── Sort handler ──────────────────────────────────────────────────────────
  function handleSortChange(field: AdminDisputeSortField) {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "desc" }
    );
  }

  // ── Resolve handler ───────────────────────────────────────────────────────
  const handleResolve = useCallback(
    async (outcome: DisputeResolutionOutcome, resolution: string) => {
      if (!resolveTarget || !token) return;
      const updated = await resolveDispute(token, resolveTarget.id, { outcome, resolution });
      setDisputes((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setResolveTarget(null);
    },
    [token, resolveTarget]
  );

  // ── Status change handler ─────────────────────────────────────────────────
  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!statusTarget || !token) return;
      const updated = await updateDisputeStatus(token, statusTarget.id, {
        status: newStatus as AdminDispute["status"],
      });
      setDisputes((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setStatusTarget(null);
    },
    [token, statusTarget]
  );

  // ─────────────────────────────────────────────────────────────────────────

  if (!isAuthorized) {
    return <LoadingState variant="fullscreen" message="Checking permissions..." />;
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Icon path={ICON_PATHS.flag} size="md" className="text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Disputes</h1>
            <p className="text-sm text-text-secondary">Manage and resolve platform disputes</p>
          </div>
        </div>

        {!isLoading && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning/10 self-start sm:self-auto">
            <Icon path={ICON_PATHS.flag} size="sm" className="text-warning" />
            <span className="text-sm font-semibold text-warning">
              {filteredDisputes.length}
              {filteredDisputes.length !== disputes.length && (
                <span className="font-normal text-warning/70"> of {disputes.length}</span>
              )}{" "}
              disputes
            </span>
          </div>
        )}
      </div>

      {/* Stats row */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            label="Open"
            value={stats.open}
            color={ADMIN_DISPUTE_STATUS_CONFIG.open.color}
            bg={ADMIN_DISPUTE_STATUS_CONFIG.open.bg}
          />
          <StatsCard
            label="Under Review"
            value={stats.under_review}
            color={ADMIN_DISPUTE_STATUS_CONFIG.under_review.color}
            bg={ADMIN_DISPUTE_STATUS_CONFIG.under_review.bg}
          />
          <StatsCard
            label="Critical"
            value={stats.critical}
            color={ADMIN_DISPUTE_PRIORITY_CONFIG.critical.color}
            bg={ADMIN_DISPUTE_PRIORITY_CONFIG.critical.bg}
          />
          <StatsCard
            label="Total"
            value={stats.total}
            color="text-text-primary"
            bg="bg-gray-100"
          />
        </div>
      )}

      {/* Filters */}
      <DisputesFilters filters={filters} onFiltersChange={setFilters} />

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 text-error">
          <Icon path={ICON_PATHS.alertCircle} size="md" />
          <span className="text-sm font-medium">{error}</span>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsLoading(true);
              getAdminDisputes(token!)
                .then(setDisputes)
                .catch((e: unknown) =>
                  setError(e instanceof Error ? e.message : "Failed to load disputes")
                )
                .finally(() => setIsLoading(false));
            }}
            className="ml-auto text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <DisputesTable
        disputes={paginatedDisputes}
        isLoading={isLoading}
        sort={sort}
        onSortChange={handleSortChange}
        onViewDetail={(d) => router.push(`/admin/disputes/${d.id}`)}
        onResolve={setResolveTarget}
        onChangeStatus={setStatusTarget}
      />

      {/* Pagination */}
      {!isLoading && filteredDisputes.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredDisputes.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Resolve modal */}
      <Modal
        isOpen={resolveTarget !== null}
        title="Resolve Dispute"
        onClose={() => setResolveTarget(null)}
      >
        {resolveTarget && (
          <DisputeResolutionForm
            dispute={resolveTarget}
            onSubmit={handleResolve}
            onCancel={() => setResolveTarget(null)}
          />
        )}
      </Modal>

      {/* Status change modal */}
      <Modal
        isOpen={statusTarget !== null}
        title="Change Dispute Status"
        onClose={() => setStatusTarget(null)}
      >
        {statusTarget && (
          <StatusChangeForm
            dispute={statusTarget}
            onSubmit={handleStatusChange}
            onCancel={() => setStatusTarget(null)}
          />
        )}
      </Modal>
    </div>
  );
}

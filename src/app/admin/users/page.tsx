"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { UsersFilters } from "@/components/admin/users/UsersFilters";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { UserEditModal } from "@/components/admin/users/UserEditModal";
import { BanUserModal } from "@/components/admin/users/BanUserModal";
import { ACTION_BUTTON_WARNING, ACTION_BUTTON_DANGER } from "@/lib/styles";
import {
  getAdminUsers,
  updateAdminUser,
  banUser,
  unbanUser,
  deleteUser,
} from "@/lib/api/admin";
import type {
  AdminUser,
  AdminUsersFilters,
  AdminUsersSort,
  AdminUserSortField,
  UpdateAdminUserPayload,
} from "@/types/admin.types";

// ─── Default state values ─────────────────────────────────────────────────────

const DEFAULT_FILTERS: AdminUsersFilters = {
  search: "",
  status: "ALL",
  role: "ALL",
  registeredAfter: "",
  registeredBefore: "",
};

const DEFAULT_SORT: AdminUsersSort = {
  field: "registeredAt",
  direction: "desc",
};

// ─── Bulk Action Bar ──────────────────────────────────────────────────────────

interface BulkActionBarProps {
  selectedCount: number;
  onBanSelected: () => void;
  onDeleteSelected: () => void;
  onClear: () => void;
}

function BulkActionBar({ selectedCount, onBanSelected, onDeleteSelected, onClear }: BulkActionBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white shadow-[6px_6px_20px_rgba(0,0,0,0.15),-6px_-6px_20px_#ffffff] animate-scale-in">
      <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
        {selectedCount} selected
      </span>

      <div className="w-px h-5 bg-gray-200" />

      <button
        type="button"
        onClick={onBanSelected}
        className={cn(ACTION_BUTTON_WARNING, "px-3 py-2 text-sm")}
      >
        <Icon path={ICON_PATHS.flag} size="sm" />
        Ban Selected
      </button>

      <button
        type="button"
        onClick={onDeleteSelected}
        className={cn(ACTION_BUTTON_DANGER, "px-3 py-2 text-sm")}
      >
        <Icon path={ICON_PATHS.trash} size="sm" />
        Delete Selected
      </button>

      <button
        type="button"
        onClick={onClear}
        className="p-1.5 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-gray-100"
        aria-label="Clear selection"
      >
        <Icon path={ICON_PATHS.close} size="sm" />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersPage(): React.JSX.Element | null {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();

  // Auth gate state — prevents flash of page content before redirect
  const [isAuthorized, setIsAuthorized] = useState(false);

  // ── Data ──
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Filters & sort ──
  const [filters, setFilters] = useState<AdminUsersFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<AdminUsersSort>(DEFAULT_SORT);

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ── Modals ──
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [unbanTarget, setUnbanTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  // ── Bulk ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkBanning, setIsBulkBanning] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

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

  // ── Fetch users ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthorized || !token) return;

    async function fetchUsers() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAdminUsers(token!);
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch admin users:", err);
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [isAuthorized, token]);

  // ── Client-side filter + sort ─────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const q = filters.search.toLowerCase();

    return users
      .filter((u) => {
        const matchesSearch =
          !q ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q);

        const matchesStatus = filters.status === "ALL" || u.status === filters.status;
        const matchesRole = filters.role === "ALL" || u.type === filters.role;

        const regDate = new Date(u.registeredAt);
        const matchesAfter =
          !filters.registeredAfter || regDate >= new Date(filters.registeredAfter);
        const matchesBefore =
          !filters.registeredBefore || regDate <= new Date(filters.registeredBefore);

        return matchesSearch && matchesStatus && matchesRole && matchesAfter && matchesBefore;
      })
      .sort((a, b) => {
        const dir = sort.direction === "asc" ? 1 : -1;
        switch (sort.field) {
          case "username":
            return dir * a.username.localeCompare(b.username);
          case "email":
            return dir * a.email.localeCompare(b.email);
          case "registeredAt":
            return dir * (new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());
          case "lastActiveAt":
            return dir * (new Date(a.lastActiveAt).getTime() - new Date(b.lastActiveAt).getTime());
          case "totalOrders":
            return dir * (a.stats.totalOrders - b.stats.totalOrders);
          case "totalEarnings":
            return (
              dir *
              (parseFloat(a.stats.totalEarnings.replace(/[$,]/g, "")) -
                parseFloat(b.stats.totalEarnings.replace(/[$,]/g, "")))
            );
          case "averageRating":
            return dir * (a.stats.averageRating - b.stats.averageRating);
          default:
            return 0;
        }
      });
  }, [users, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Reset page when filters/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sort, itemsPerPage]);

  // Clear selection when page or filters change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [currentPage, filters]);

  // ── Sort handler ──────────────────────────────────────────────────────────
  function handleSortChange(field: AdminUserSortField) {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" }
    );
  }

  // ── Selection handlers ────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    const pageIds = paginatedUsers.map((u) => u.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => new Set([...prev, ...pageIds]));
    }
  }

  // ── Mutation handlers ─────────────────────────────────────────────────────

  const handleUpdateUser = useCallback(
    async (userId: string, payload: UpdateAdminUserPayload) => {
      const updated = await updateAdminUser(token!, userId, payload);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    },
    [token]
  );

  const handleBanUser = useCallback(
    async (userId: string, reason: string) => {
      const updated = await banUser(token!, userId, { reason });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setBanTarget(null);
    },
    [token]
  );

  const handleUnbanUser = useCallback(async () => {
    if (!unbanTarget) return;
    const updated = await unbanUser(token!, unbanTarget.id);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setUnbanTarget(null);
  }, [token, unbanTarget]);

  const handleDeleteUser = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteUser(token!, deleteTarget.id);
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(deleteTarget.id);
      return next;
    });
    setDeleteTarget(null);
  }, [token, deleteTarget]);

  // ── Bulk handlers ─────────────────────────────────────────────────────────

  const handleBulkBan = useCallback(
    async (userId: string, reason: string) => {
      // For bulk, userId is a sentinel; we ban all selectedIds
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => banUser(token!, id, { reason })));
      const updatedAll = await getAdminUsers(token!);
      setUsers(updatedAll);
      setSelectedIds(new Set());
      setIsBulkBanning(false);
    },
    [token, selectedIds]
  );

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => deleteUser(token!, id)));
    setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
  }, [token, selectedIds]);

  // ─────────────────────────────────────────────────────────────────────────

  if (!isAuthorized) {
    return <LoadingState variant="fullscreen" message="Checking permissions..." />;
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon path={ICON_PATHS.users} size="md" className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Users</h1>
              <p className="text-sm text-text-secondary">Manage platform accounts</p>
            </div>
          </div>
        </div>

        {!isLoading && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 self-start sm:self-auto">
            <Icon path={ICON_PATHS.users} size="sm" className="text-primary" />
            <span className="text-sm font-semibold text-primary">
              {filteredUsers.length}
              {filteredUsers.length !== users.length && (
                <span className="font-normal text-primary/70"> of {users.length}</span>
              )}{" "}
              users
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <UsersFilters filters={filters} onFiltersChange={setFilters} />

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
              getAdminUsers(token!)
                .then(setUsers)
                .catch((e: unknown) =>
                  setError(e instanceof Error ? e.message : "Failed to load users")
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
      <UsersTable
        users={paginatedUsers}
        isLoading={isLoading}
        sort={sort}
        selectedIds={selectedIds}
        onSortChange={handleSortChange}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onEdit={setEditTarget}
        onBan={setBanTarget}
        onUnban={setUnbanTarget}
        onDelete={setDeleteTarget}
      />

      {/* Pagination */}
      {!isLoading && filteredUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          onBanSelected={() => setIsBulkBanning(true)}
          onDeleteSelected={() => setBulkDeleteOpen(true)}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      {/* Edit modal */}
      <UserEditModal
        isOpen={editTarget !== null}
        user={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleUpdateUser}
        onBan={(u) => {
          setEditTarget(null);
          setBanTarget(u);
        }}
      />

      {/* Ban modal — single user */}
      <BanUserModal
        isOpen={banTarget !== null && !isBulkBanning}
        user={banTarget}
        onClose={() => setBanTarget(null)}
        onConfirm={handleBanUser}
      />

      {/* Ban modal — bulk */}
      <BanUserModal
        isOpen={isBulkBanning}
        user={
          isBulkBanning
            ? ({
                id: "bulk",
                username: `${selectedIds.size} users`,
                email: "",
                type: "BUYER",
                status: "ACTIVE",
                registeredAt: "",
                lastActiveAt: "",
                stats: {
                  totalOrders: 0,
                  completedOrders: 0,
                  totalEarnings: "$0.00",
                  totalSpent: "$0.00",
                  averageRating: 0,
                  ratingCount: 0,
                  joinedDaysAgo: 0,
                },
                banHistory: [],
                activityHistory: [],
              } satisfies AdminUser)
            : null
        }
        onClose={() => {
          setIsBulkBanning(false);
        }}
        onConfirm={handleBulkBan}
      />

      {/* Unban confirmation */}
      <ConfirmationModal
        isOpen={unbanTarget !== null}
        onClose={() => setUnbanTarget(null)}
        onConfirm={handleUnbanUser}
        title="Unban User"
        message={`Remove the ban for ${unbanTarget?.username ?? "this user"}? They will regain full access to the platform.`}
        confirmText="Unban"
        variant="warning"
      />

      {/* Delete confirmation — single */}
      <ConfirmationModal
        isOpen={deleteTarget !== null && !bulkDeleteOpen}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Permanently delete ${deleteTarget?.username ?? "this user"}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Delete confirmation — bulk */}
      <ConfirmationModal
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedIds.size} Users`}
        message={`Permanently delete ${selectedIds.size} selected users? This action cannot be undone.`}
        confirmText="Delete All"
        variant="danger"
      />
    </div>
  );
}

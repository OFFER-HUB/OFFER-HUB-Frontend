"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getAdminUsers, updateAdminUser, banUser, unbanUser } from "@/lib/api/admin";
import type {
  AdminUser,
  AdminUsersFilters,
  AdminUsersMeta,
  AdminUsersSort,
  AdminUserSortField,
  UpdateAdminUserPayload,
} from "@/types/admin.types";

export const DEFAULT_ADMIN_USERS_FILTERS: AdminUsersFilters = {
  search: "",
  status: "ALL",
  role: "ALL",
  registeredAfter: "",
  registeredBefore: "",
};

export const DEFAULT_ADMIN_USERS_SORT: AdminUsersSort = {
  field: "createdAt",
  direction: "desc",
};

const EMPTY_META: AdminUsersMeta = { total: 0, page: 1, limit: 10, totalPages: 1 };

export interface UseAdminUsersResult {
  users: AdminUser[];
  meta: AdminUsersMeta;
  isLoading: boolean;
  error: string | null;
  filters: AdminUsersFilters;
  sort: AdminUsersSort;
  page: number;
  limit: number;
  selectedIds: Set<string>;
  setFilters: (filters: AdminUsersFilters) => void;
  toggleSort: (field: AdminUserSortField) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  refetch: () => Promise<void>;
  updateUser: (userId: string, payload: UpdateAdminUserPayload) => Promise<void>;
  ban: (userId: string, reason: string) => Promise<void>;
  unban: (userId: string) => Promise<void>;
  banSelected: (reason: string) => Promise<void>;
}

/**
 * Data + behaviour for the admin users page. Filtering, sorting and paging are
 * done by `GET /admin/users`, so every change to the query refetches — the
 * page never holds more than one page of rows.
 */
export function useAdminUsers(enabled: boolean): UseAdminUsersResult {
  const token = useAuthStore((s) => s.token);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<AdminUsersMeta>(EMPTY_META);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFiltersState] = useState<AdminUsersFilters>(DEFAULT_ADMIN_USERS_FILTERS);
  const [sort, setSort] = useState<AdminUsersSort>(DEFAULT_ADMIN_USERS_SORT);
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchPage = useCallback(async () => {
    if (!enabled || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAdminUsers(token, { ...filters, sort, page, limit });
      setUsers(result.users);
      setMeta(result.meta);
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [enabled, token, filters, sort, page, limit]);

  useEffect(() => {
    void fetchPage();
  }, [fetchPage]);

  // Any change to what the list is asked for restarts at page 1 and drops the
  // selection, which only ever refers to rows on the current page.
  const setFilters = useCallback((next: AdminUsersFilters) => {
    setFiltersState(next);
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const toggleSort = useCallback((field: AdminUserSortField) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" }
    );
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const setLimit = useCallback((next: number) => {
    setLimitState(next);
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const changePage = useCallback((next: number) => {
    setPage(next);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const pageIds = users.map((u) => u.id);
      const allSelected = pageIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(pageIds);
    });
  }, [users]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const replaceRow = useCallback((updated: AdminUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }, []);

  const updateUser = useCallback(
    async (userId: string, payload: UpdateAdminUserPayload) => {
      if (!token) return;
      replaceRow(await updateAdminUser(token, userId, payload));
    },
    [token, replaceRow]
  );

  const ban = useCallback(
    async (userId: string, reason: string) => {
      if (!token) return;
      replaceRow(await banUser(token, userId, { reason }));
    },
    [token, replaceRow]
  );

  const unban = useCallback(
    async (userId: string) => {
      if (!token) return;
      replaceRow(await unbanUser(token, userId));
    },
    [token, replaceRow]
  );

  const banSelected = useCallback(
    async (reason: string) => {
      if (!token) return;
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => banUser(token, id, { reason })));
      setSelectedIds(new Set());
      await fetchPage();
    },
    [token, selectedIds, fetchPage]
  );

  return {
    users,
    meta,
    isLoading,
    error,
    filters,
    sort,
    page,
    limit,
    selectedIds,
    setFilters,
    toggleSort,
    setPage: changePage,
    setLimit,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    refetch: fetchPage,
    updateUser,
    ban,
    unban,
    banSelected,
  };
}

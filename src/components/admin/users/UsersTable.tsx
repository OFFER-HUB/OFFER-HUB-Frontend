"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { NEUMORPHIC_CARD, ICON_BUTTON } from "@/lib/styles";
import {
  ADMIN_USER_STATUS_CONFIG,
  ADMIN_USER_ROLE_LABELS,
  type AdminUser,
  type AdminUsersSort,
  type AdminUserSortField,
} from "@/types/admin.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  sort: AdminUsersSort;
  selectedIds: Set<string>;
  onSortChange: (field: AdminUserSortField) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (user: AdminUser) => void;
  onBan: (user: AdminUser) => void;
  onUnban: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortableHeader({
  field,
  label,
  currentSort,
  onSort,
}: {
  field: AdminUserSortField;
  label: string;
  currentSort: AdminUsersSort;
  onSort: (f: AdminUserSortField) => void;
}) {
  const isActive = currentSort.field === field;
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-primary transition-colors whitespace-nowrap"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <Icon
          path={isActive && currentSort.direction === "asc" ? ICON_PATHS.arrowUp : ICON_PATHS.arrowDown}
          size="sm"
          className={isActive ? "text-primary" : "text-text-secondary/30"}
        />
      </span>
    </th>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-t border-gray-100 animate-pulse">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div
            className={cn(
              "h-4 rounded bg-gray-200",
              i === 0 ? "w-5" : i === 1 ? "w-32" : i === 8 ? "w-20" : "w-16"
            )}
          />
        </td>
      ))}
    </tr>
  );
}

function UserAvatar({ username, avatarUrl }: { username: string; avatarUrl?: string }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className="w-8 h-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
      {username.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function UsersTable({
  users,
  isLoading,
  sort,
  selectedIds,
  onSortChange,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onBan,
  onUnban,
  onDelete,
}: UsersTableProps) {
  const allPageSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));
  const somePageSelected = users.some((u) => selectedIds.has(u.id));

  return (
    <div className={cn(NEUMORPHIC_CARD, "overflow-x-auto p-0")}>
      <table className="w-full min-w-[900px]">
        {/* Header */}
        <thead>
          <tr className="bg-gray-50/80">
            {/* Checkbox — select all */}
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={allPageSelected}
                ref={(el) => {
                  if (el) el.indeterminate = somePageSelected && !allPageSelected;
                }}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded accent-primary cursor-pointer"
                aria-label="Select all users on this page"
              />
            </th>

            <SortableHeader field="username" label="User" currentSort={sort} onSort={onSortChange} />

            {/* Role — not sortable */}
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
              Role
            </th>

            {/* Status — not sortable */}
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
              Status
            </th>

            <SortableHeader field="registeredAt" label="Registered" currentSort={sort} onSort={onSortChange} />
            <SortableHeader field="lastActiveAt" label="Last Active" currentSort={sort} onSort={onSortChange} />
            <SortableHeader field="totalOrders" label="Orders" currentSort={sort} onSort={onSortChange} />
            <SortableHeader field="averageRating" label="Rating" currentSort={sort} onSort={onSortChange} />

            <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-8">
                <EmptyState
                  icon={ICON_PATHS.users}
                  title="No users found"
                  message="No users match your current filters."
                />
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const statusCfg = ADMIN_USER_STATUS_CONFIG[user.status];
              const isSelected = selectedIds.has(user.id);
              return (
                <tr
                  key={user.id}
                  className={cn(
                    "border-t border-gray-100 transition-colors",
                    isSelected ? "bg-primary/5" : "hover:bg-gray-50/50"
                  )}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(user.id)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                      aria-label={`Select ${user.username}`}
                    />
                  </td>

                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar username={user.username} avatarUrl={user.avatarUrl} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-text-secondary truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-text-secondary bg-gray-100 px-2 py-1 rounded-full">
                      {ADMIN_USER_ROLE_LABELS[user.type]}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-full",
                        statusCfg.color,
                        statusCfg.bg
                      )}
                    >
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Registered */}
                  <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                    {formatDate(user.registeredAt)}
                  </td>

                  {/* Last Active */}
                  <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                    {formatDate(user.lastActiveAt)}
                  </td>

                  {/* Orders */}
                  <td className="px-4 py-3 text-xs text-text-primary whitespace-nowrap">
                    <span className="font-semibold">{user.stats.completedOrders}</span>
                    <span className="text-text-secondary">/{user.stats.totalOrders}</span>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.stats.ratingCount > 0 ? (
                      <span className="flex items-center gap-1 text-xs">
                        <Icon path={ICON_PATHS.star} size="sm" className="text-warning" />
                        <span className="font-semibold text-text-primary">
                          {user.stats.averageRating.toFixed(1)}
                        </span>
                        <span className="text-text-secondary">({user.stats.ratingCount})</span>
                      </span>
                    ) : (
                      <span className="text-xs text-text-secondary">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        className={cn(ICON_BUTTON, "w-8 h-8")}
                        title="Edit user"
                        aria-label={`Edit ${user.username}`}
                      >
                        <Icon path={ICON_PATHS.edit} size="sm" className="text-text-secondary" />
                      </button>

                      {/* Ban / Unban */}
                      {user.status === "BANNED" ? (
                        <button
                          type="button"
                          onClick={() => onUnban(user)}
                          className={cn(ICON_BUTTON, "w-8 h-8")}
                          title="Unban user"
                          aria-label={`Unban ${user.username}`}
                        >
                          <Icon path={ICON_PATHS.lock} size="sm" className="text-warning" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onBan(user)}
                          className={cn(ICON_BUTTON, "w-8 h-8")}
                          title="Ban user"
                          aria-label={`Ban ${user.username}`}
                        >
                          <Icon path={ICON_PATHS.flag} size="sm" className="text-text-secondary hover:text-error" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDelete(user)}
                        className={cn(ICON_BUTTON, "w-8 h-8")}
                        title="Delete user"
                        aria-label={`Delete ${user.username}`}
                      >
                        <Icon path={ICON_PATHS.trash} size="sm" className="text-error/70 hover:text-error" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

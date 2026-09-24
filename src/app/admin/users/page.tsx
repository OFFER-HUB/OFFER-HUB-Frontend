"use client";

import { useState } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { UsersFilters } from "@/components/admin/users/UsersFilters";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { UserEditModal } from "@/components/admin/users/UserEditModal";
import { BanUserModal, type BanSubject } from "@/components/admin/users/BanUserModal";
import { BulkActionBar } from "@/components/admin/users/BulkActionBar";
import { adminUserDisplayName, type AdminUser } from "@/types/admin.types";

const BULK_BAN_ID = "bulk";

export default function AdminUsersPage(): React.JSX.Element | null {
  const isAuthorized = useAdminGuard();
  const list = useAdminUsers(isAuthorized);

  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [unbanTarget, setUnbanTarget] = useState<AdminUser | null>(null);
  const [isBulkBanning, setIsBulkBanning] = useState(false);

  if (!isAuthorized) {
    return <LoadingState variant="fullscreen" message="Checking permissions..." />;
  }

  const banSubject: BanSubject | null = isBulkBanning
    ? { id: BULK_BAN_ID, name: `${list.selectedIds.size} users`, email: null }
    : banTarget
      ? { id: banTarget.id, name: adminUserDisplayName(banTarget), email: banTarget.email }
      : null;

  async function handleBanConfirm(userId: string, reason: string) {
    if (userId === BULK_BAN_ID) {
      await list.banSelected(reason);
      setIsBulkBanning(false);
      return;
    }
    await list.ban(userId, reason);
    setBanTarget(null);
  }

  async function handleUnbanConfirm() {
    if (!unbanTarget) return;
    await list.unban(unbanTarget.id);
    setUnbanTarget(null);
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon path={ICON_PATHS.users} size="md" className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Users</h1>
            <p className="text-sm text-text-secondary">Manage platform accounts</p>
          </div>
        </div>

        {!list.isLoading && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 self-start sm:self-auto">
            <Icon path={ICON_PATHS.users} size="sm" className="text-primary" />
            <span className="text-sm font-semibold text-primary">{list.meta.total} users</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <UsersFilters filters={list.filters} onFiltersChange={list.setFilters} />

      {/* Error state */}
      {list.error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 text-error">
          <Icon path={ICON_PATHS.alertCircle} size="md" />
          <span className="text-sm font-medium">{list.error}</span>
          <button
            type="button"
            onClick={() => void list.refetch()}
            className="ml-auto text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <UsersTable
        users={list.users}
        isLoading={list.isLoading}
        sort={list.sort}
        selectedIds={list.selectedIds}
        onSortChange={list.toggleSort}
        onToggleSelect={list.toggleSelect}
        onToggleSelectAll={list.toggleSelectAll}
        onEdit={setEditTarget}
        onBan={setBanTarget}
        onUnban={setUnbanTarget}
      />

      {/* Pagination */}
      {!list.isLoading && list.meta.total > 0 && (
        <Pagination
          currentPage={list.page}
          totalPages={list.meta.totalPages}
          totalItems={list.meta.total}
          itemsPerPage={list.limit}
          onPageChange={list.setPage}
          onItemsPerPageChange={list.setLimit}
        />
      )}

      {/* Bulk action bar */}
      {list.selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={list.selectedIds.size}
          onBanSelected={() => setIsBulkBanning(true)}
          onClear={list.clearSelection}
        />
      )}

      {/* Edit modal */}
      <UserEditModal
        isOpen={editTarget !== null}
        user={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={list.updateUser}
        onBan={(u) => {
          setEditTarget(null);
          setBanTarget(u);
        }}
      />

      {/* Ban modal — single or bulk */}
      <BanUserModal
        isOpen={banSubject !== null}
        user={banSubject}
        onClose={() => {
          setBanTarget(null);
          setIsBulkBanning(false);
        }}
        onConfirm={handleBanConfirm}
      />

      {/* Unban confirmation */}
      <ConfirmationModal
        isOpen={unbanTarget !== null}
        onClose={() => setUnbanTarget(null)}
        onConfirm={handleUnbanConfirm}
        title="Unban User"
        message={`Remove the ban for ${unbanTarget ? adminUserDisplayName(unbanTarget) : "this user"}? They will regain full access to the platform.`}
        confirmText="Unban"
        variant="warning"
      />
    </div>
  );
}

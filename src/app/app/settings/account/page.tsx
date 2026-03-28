"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, DANGER_BUTTON } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/auth-store";
import { deleteAccount, type DeleteAccountError } from "@/lib/api/account";
import { DeleteAccountModal } from "@/components/settings/DeleteAccountModal";

const ACCOUNT_ITEMS = [
  {
    icon: ICON_PATHS.user,
    label: "Edit Profile",
    description: "Update your name, bio, and avatar",
    href: "/app/profile",
  },
  {
    icon: ICON_PATHS.lock,
    label: "Change Password",
    description: "Update your login password",
    href: "/forgot-password",
  },
  {
    icon: ICON_PATHS.shield,
    label: "Connected Accounts",
    description: "Manage OAuth providers (GitHub, Google)",
    href: "/app/profile",
  },
];

export default function AccountSettingsPage(): React.JSX.Element {
  const router = useRouter();
  const { token, logout } = useAuthStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleDeleteConfirm(password: string): Promise<void> {
    if (!token) return;

    setServerError(null);
    try {
      await deleteAccount(token, { password });
      // Success — log out then redirect to homepage
      await logout();
      router.push("/");
    } catch (err) {
      const e = err as DeleteAccountError;
      if (e.code === "ACTIVE_ORDERS") {
        setServerError(
          "You have active orders in progress. Please complete or cancel them before deleting your account."
        );
      } else if (e.code === "INSUFFICIENT_BALANCE") {
        setServerError(
          "You have a remaining balance. Please withdraw your funds before deleting your account."
        );
      } else if (e.code === "INVALID_PASSWORD") {
        setServerError("Incorrect password. Please try again.");
      } else {
        setServerError(e.message ?? "Something went wrong. Please try again.");
      }
      // Re-throw so the modal knows to stop its loading state
      throw err;
    }
  }

  function handleOpenModal(): void {
    setServerError(null);
    setModalOpen(true);
  }

  return (
    <>
      <div className="space-y-4 max-w-2xl">
        {/* Back link */}
        <Link
          href="/app/settings"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <Icon path={ICON_PATHS.chevronLeft} size="sm" />
          Back to Settings
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Account</h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage your account details and linked services
          </p>
        </div>

        {/* Account links */}
        <div className={NEUMORPHIC_CARD}>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Icon path={ICON_PATHS.settingsCircle} size="md" className="text-primary" />
            Account Settings
          </h2>
          <div className="divide-y divide-border-light">
            {ACCOUNT_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 py-3",
                  "group transition-colors duration-150",
                  "hover:text-primary"
                )}
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon path={item.icon} size="sm" className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                    {item.label}
                  </p>
                  <p className="text-xs text-text-secondary">{item.description}</p>
                </div>
                <Icon
                  path={ICON_PATHS.chevronRight}
                  size="sm"
                  className="text-text-secondary group-hover:text-primary transition-colors flex-shrink-0"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div
          className={cn(
            NEUMORPHIC_CARD,
            "border border-error/20"
          )}
        >
          <h2 className="text-lg font-semibold text-error mb-1 flex items-center gap-2">
            <Icon path={ICON_PATHS.alertCircle} size="md" className="text-error" />
            Danger Zone
          </h2>
          <p className="text-sm text-text-secondary mb-5">
            Irreversible and destructive actions. Proceed with extreme caution.
          </p>

          <div className={cn(
            "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
            "p-4 rounded-xl bg-error/5 border border-error/10"
          )}>
            <div>
              <p className="text-sm font-semibold text-text-primary">Delete my account</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Permanently remove your account and all associated data. This cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenModal}
              className={cn(DANGER_BUTTON, "flex-shrink-0 border border-error/30")}
            >
              <Icon path={ICON_PATHS.trash} size="sm" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        serverError={serverError}
      />
    </>
  );
}

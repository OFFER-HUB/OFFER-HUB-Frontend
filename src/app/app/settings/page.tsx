"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, DANGER_BUTTON } from "@/lib/styles";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { ClaimWalletCard } from "@/components/settings/ClaimWalletCard";
import { STELLAR_NETWORK } from "@/config/wallet";
import { WalletManagementCard } from "@/components/settings/WalletManagementCard";
import { BankAccountSelector } from "@/components/bank-accounts/BankAccountSelector";
import { KycStatusCard } from "@/components/kyc/KycStatusCard";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPage(): React.JSX.Element {
  const { hasCompletedTour, resetTour } = useOnboardingStore();
  const userType = useAuthStore((state) => state.user?.type);
  const canReceivePayouts = userType === "SELLER" || userType === "BOTH";

  function handleRestartTour(): void {
    resetTour();
    localStorage.setItem("show-onboarding-tour", "true");
    window.location.href = "/app/freelancer/dashboard";
  }

  return (
    <div className="space-y-4">
      <SettingsHeader
        icon={ICON_PATHS.settings}
        title="Settings"
        description="Manage your security, wallets and account."
        showBack={false}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/app/settings/preferences"
          className={cn(
            NEUMORPHIC_CARD,
            "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon path={ICON_PATHS.settings} size="md" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Preferences</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Choose your time zone and how dates and times are displayed.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/app/settings/security"
          className={cn(
            NEUMORPHIC_CARD,
            "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon path={ICON_PATHS.lock} size="md" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Security</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Change your password and review account access protections.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/app/settings/sessions"
          className={cn(
            NEUMORPHIC_CARD,
            "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon path={ICON_PATHS.desktop} size="md" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Sessions</h2>
              <p className="mt-1 text-sm text-text-secondary">
                View and manage your active login sessions across all devices.
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className={NEUMORPHIC_CARD}>
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Icon path={ICON_PATHS.help} size="md" className="text-primary" />
          Help & Support
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">Platform Tour</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {hasCompletedTour
                  ? "You have completed the tour. Restart to see it again."
                  : "Take a guided tour to learn how to use OFFER-HUB."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRestartTour}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                "bg-primary/10 text-primary hover:bg-primary/20",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
              )}
            >
              {hasCompletedTour ? "Restart Tour" : "Start Tour"}
            </button>
          </div>
        </div>
      </div>

      {/* Custodial → non-custodial migration. Sits above the account section
          because it is a one-way change to who holds the keys, not a preference. */}
      {/* Mainnet holds no custodial keys (ADR-001): there is nothing to claim there. */}
      {STELLAR_NETWORK === "testnet" && <ClaimWalletCard />}

      <WalletManagementCard />

      {/* Only sellers ever get paid out, so buyers with no seller side never see a section asking them to register a payout destination. */}
      {canReceivePayouts && <KycStatusCard />}
      {canReceivePayouts && <BankAccountSelector title="Payment Accounts" />}

      <div className={cn(NEUMORPHIC_CARD, "border border-error/20")}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-error mb-1 flex items-center gap-2">
              <Icon path={ICON_PATHS.alertCircle} size="md" className="text-error" />
              Account
            </h2>
            <p className="text-sm text-text-secondary">
              Manage account details, linked services, and account deletion.
            </p>
          </div>
          <Link
            href="/app/settings/account"
            className={cn(DANGER_BUTTON, "justify-center py-2 px-5")}
          >
            Manage Account
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useModeStore } from "@/stores/mode-store";
import { canUseMode, dashboardForMode } from "@/lib/roles/roles";
import { LoadingSpinner } from "@/components/ui/Icon";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const mode = useModeStore((state) => state.mode);
  const accountType = useAuthStore((state) => state.user?.type);

  useEffect(() => {
    // A single-role account never lands on the other role's dashboard, even if
    // the persisted mode says otherwise.
    const target = canUseMode(accountType, mode) ? mode : mode === "client" ? "freelancer" : "client";
    router.replace(dashboardForMode(target));
  }, [mode, accountType, router]);

  return (
    <div className="flex items-center justify-center h-full">
      <LoadingSpinner className="text-primary" />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useModeStore } from "@/stores/mode-store";
import { LoadingSpinner } from "@/components/ui/Icon";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const mode = useModeStore((state) => state.mode);

  useEffect(() => {
    router.replace(
      mode === "client" ? "/app/client/dashboard" : "/app/freelancer/dashboard"
    );
  }, [mode, router]);

  return (
    <div className="flex items-center justify-center h-full">
      <LoadingSpinner className="text-primary" />
    </div>
  );
}

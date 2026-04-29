"use client";

import { useEffect, useState } from "react";
import { useModeStore } from "@/stores/mode-store";
import { FreelancerDashboard } from "@/components/freelancer-dashboard/FreelancerDashboard";

export default function FreelancerDashboardPage(): React.JSX.Element {
  const { setMode } = useModeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode("freelancer");
    setMounted(true);
  }, [setMode]);

  if (!mounted) return <div className="min-h-screen bg-background" />;

  return <FreelancerDashboard />;
}

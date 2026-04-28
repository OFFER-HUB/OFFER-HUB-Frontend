"use client";

import { useEffect } from "react";
import { useModeStore } from "@/stores/mode-store";
import { FreelancerDashboard } from "@/components/freelancer-dashboard/FreelancerDashboard";

export default function FreelancerDashboardPage(): React.JSX.Element {
  const { setMode } = useModeStore();

  useEffect(() => {
    setMode("freelancer");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <FreelancerDashboard />;
}

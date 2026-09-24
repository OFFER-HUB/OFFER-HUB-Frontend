"use client";

import { Suspense } from "react";
import { NavigationProgress } from "@/components/ui/NavigationProgress";

export function NavigationProgressProvider(): React.JSX.Element {
  return (
    <Suspense fallback={null}>
      <NavigationProgress />
    </Suspense>
  );
}

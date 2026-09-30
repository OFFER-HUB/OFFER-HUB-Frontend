"use client";

import { Suspense } from "react";
import { NewDisputeForm } from "@/components/disputes/NewDisputeForm";
import { DisputeFormLoadingFallback } from "@/components/disputes/DisputeFormLoadingFallback";

export default function NewDisputePage(): React.JSX.Element {
  return (
    <Suspense fallback={<DisputeFormLoadingFallback />}>
      <NewDisputeForm mode="client" />
    </Suspense>
  );
}
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/auth-store";
import { acceptTos } from "@/lib/api/kyc";

/** Where the user lands once BlindPay's terms are recorded — see KycStatusCard. */
const RETURN_PATH = "/app/settings";
const SUCCESS_REDIRECT_DELAY_MS = 1500;

type CallbackState = "processing" | "success" | "error";

function TosCallbackContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const [state, setState] = useState<CallbackState>("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasRun = useRef(false);

  const tosId = searchParams.get("tos_id");

  // Derived directly from render inputs (searchParams, the store) rather than
  // set as state in an effect — both are already known once hydration and
  // this render have happened, so there's nothing async to synchronize here.
  const missingTosId = hasHydrated && !tosId;
  const missingToken = hasHydrated && Boolean(tosId) && !token;

  useEffect(() => {
    if (!hasHydrated || hasRun.current || !tosId || !token) return;

    hasRun.current = true;
    acceptTos(token, tosId)
      .then(() => {
        setState("success");
        setTimeout(() => router.replace(RETURN_PATH), SUCCESS_REDIRECT_DELAY_MS);
      })
      .catch((error: unknown) => {
        setState("error");
        const raw = error instanceof Error ? error.message : "Could not confirm terms-of-service acceptance.";
        let friendly = raw;
        if (raw.includes("invalid_cpf_tax_id")) {
          friendly = "The Brazilian CPF provided is invalid according to BlindPay. Please return to settings, edit your KYC information with a valid CPF, and accept terms again.";
        }
        setErrorMessage(friendly);
      });
  }, [hasHydrated, token, tosId, router]);

  if (!hasHydrated || (state === "processing" && !missingTosId && !missingToken)) {
    return <LoadingState variant="fullscreen" message="Confirming your BlindPay terms acceptance..." />;
  }

  if (missingTosId) {
    return (
      <ErrorState
        variant="card"
        title="Couldn't confirm acceptance"
        message="BlindPay didn't send back a terms-of-service confirmation. Please try again."
        onRetry={() => router.replace(RETURN_PATH)}
        retryLabel="Back to settings"
      />
    );
  }

  if (missingToken) {
    return (
      <ErrorState
        variant="card"
        title="Couldn't confirm acceptance"
        message="Your session has expired. Please sign in and try again."
        onRetry={() => router.replace(RETURN_PATH)}
        retryLabel="Back to settings"
      />
    );
  }

  if (state === "error") {
    return (
      <ErrorState
        variant="card"
        title="Couldn't confirm acceptance"
        message={errorMessage ?? "Something went wrong."}
        onRetry={() => router.replace(RETURN_PATH)}
        retryLabel="Back to settings"
      />
    );
  }

  return (
    <div className="max-w-md mx-auto text-center py-16 px-4">
      <Icon path={ICON_PATHS.check} size="xl" className="mx-auto text-success mb-4" />
      <h1 className="text-xl font-bold text-text-primary mb-2">Terms accepted</h1>
      <p className="text-sm text-text-secondary">Taking you back to your settings...</p>
    </div>
  );
}

export default function TosCallbackPage(): React.JSX.Element {
  return (
    <Suspense fallback={<LoadingState variant="fullscreen" message="Loading..." />}>
      <TosCallbackContent />
    </Suspense>
  );
}

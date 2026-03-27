"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import {
  createWithdrawalRequest,
  type WithdrawalRequestData,
  type CreateWithdrawalRequestInput,
} from "@/lib/api/wallet";
import { WithdrawForm, type WithdrawFormValues } from "./WithdrawForm";

const PREFERRED_DESTINATION_KEY = "preferred_withdraw_destination";

export interface WithdrawModalProps {
  isOpen: boolean;
  token: string;
  availableBalance: number;
  currency: string;
  onClose: () => void;
  onSuccess?: (result: WithdrawalRequestData) => void;
  minimumAmount?: number;
  feePercent?: number;
  fixedFee?: number;
  estimatedArrival?: string;
  isDemo?: boolean;
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

function parseAmount(value: string): number {
  const n = parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
}

function buildDemoResult(
  payload: CreateWithdrawalRequestInput,
  currency: string,
  feePercent: number,
  fixedFee: number,
  estimatedArrival: string
): WithdrawalRequestData {
  const fee = fixedFee + payload.amount * (feePercent / 100);
  return {
    id: `wd_demo_${Date.now()}`,
    status: "pending",
    amount: payload.amount.toFixed(2),
    fee: fee.toFixed(2),
    totalDeducted: (payload.amount + fee).toFixed(2),
    currency,
    destination: payload.destination,
    estimatedArrival,
    createdAt: new Date().toISOString(),
    message: "Withdrawal request created successfully.",
  };
}

export function WithdrawModal({
  isOpen,
  token,
  availableBalance,
  currency,
  onClose,
  onSuccess,
  minimumAmount = 20,
  feePercent = 1.5,
  fixedFee = 0.5,
  estimatedArrival = "Within 24 hours",
  isDemo = false,
}: WithdrawModalProps): React.JSX.Element | null {
  const [pendingValues, setPendingValues] = useState<WithdrawFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<WithdrawalRequestData | null>(null);
  const [initialDestination, setInitialDestination] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const saved = window.localStorage.getItem(PREFERRED_DESTINATION_KEY);
    setInitialDestination(saved ?? "");
  }, [isOpen]);

  useEffect(() => {
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) {
        setPendingValues(null);
        setSubmitError(null);
        setResult(null);
        onClose();
      }
    }
    if (isOpen) window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [isOpen, isSubmitting, onClose]);

  const confirmationMessage = useMemo(() => {
    if (!pendingValues) return "";
    const amount = parseAmount(pendingValues.amount);
    const fee = fixedFee + amount * (feePercent / 100);
    const total = amount + fee;
    return [
      `You are requesting ${formatCurrency(amount, currency)} to ${pendingValues.destination}.`,
      `Fee: ${formatCurrency(fee, currency)} (${feePercent}% + ${formatCurrency(fixedFee, currency)}).`,
      `Total deduction: ${formatCurrency(total, currency)}.`,
      `Estimated arrival: ${estimatedArrival}.`,
    ].join(" ");
  }, [currency, estimatedArrival, feePercent, fixedFee, pendingValues]);

  if (!isOpen) return null;

  async function submitWithdrawal() {
    if (!pendingValues) return;

    const payload: CreateWithdrawalRequestInput = {
      amount: parseAmount(pendingValues.amount),
      destination: pendingValues.destination,
      saveDestination: pendingValues.saveDestination,
    };

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = isDemo
        ? await new Promise<WithdrawalRequestData>((resolve) => {
            window.setTimeout(() => {
              resolve(buildDemoResult(payload, currency, feePercent, fixedFee, estimatedArrival));
            }, 800);
          })
        : await createWithdrawalRequest(token, payload);

      if (pendingValues.saveDestination) {
        window.localStorage.setItem(PREFERRED_DESTINATION_KEY, pendingValues.destination);
      } else {
        window.localStorage.removeItem(PREFERRED_DESTINATION_KEY);
      }

      setResult(response);
      setPendingValues(null);
      onSuccess?.(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit withdrawal request.";
      if (message.toLowerCase().includes("insufficient")) {
        setSubmitError("Insufficient balance for this withdrawal request.");
      } else {
        setSubmitError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (isSubmitting) return;
    setPendingValues(null);
    setSubmitError(null);
    setResult(null);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
          aria-label="Close withdrawal modal"
        />
        <div
          className={cn(NEUMORPHIC_CARD, "relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6")}
          role="dialog"
          aria-modal="true"
          aria-label="Withdraw funds"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
            aria-label="Close"
            disabled={isSubmitting}
          >
            <Icon path={ICON_PATHS.close} size="md" />
          </button>

          <div className="pr-10">
            <h2 className="text-xl font-bold text-text-primary">Withdraw funds</h2>
            <p className="text-sm text-text-secondary mt-1">
              Submit a secure withdrawal request from your available balance.
            </p>
          </div>

          <div className="mt-5">
            {result ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-success/10 border border-success/20">
                  <p className="text-success font-semibold flex items-center gap-2">
                    <Icon path={ICON_PATHS.check} size="sm" />
                    Withdrawal request submitted
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {result.message ?? "Your withdrawal is now being processed."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-background">
                    <p className="text-text-secondary">Request ID</p>
                    <p className="font-semibold text-text-primary break-all">{result.id}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background">
                    <p className="text-text-secondary">Amount</p>
                    <p className="font-semibold text-text-primary">
                      {formatCurrency(parseAmount(result.amount), result.currency)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-background">
                    <p className="text-text-secondary">Fee</p>
                    <p className="font-semibold text-text-primary">
                      {formatCurrency(parseAmount(result.fee), result.currency)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-background">
                    <p className="text-text-secondary">Estimated arrival</p>
                    <p className="font-semibold text-text-primary">{result.estimatedArrival}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background sm:col-span-2">
                    <p className="text-text-secondary">Destination</p>
                    <p className="font-semibold text-text-primary break-all">{result.destination}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className={cn(
                      "px-5 py-2.5 rounded-xl text-sm font-medium text-white",
                      "bg-primary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
                    )}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <WithdrawForm
                currency={currency}
                availableBalance={availableBalance}
                minimumAmount={minimumAmount}
                feePercent={feePercent}
                fixedFee={fixedFee}
                estimatedArrival={estimatedArrival}
                initialDestination={initialDestination}
                onContinue={setPendingValues}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            )}
          </div>

          {isSubmitting ? (
            <div className="mt-4 flex items-center justify-end gap-2 text-sm text-text-secondary">
              <LoadingSpinner size="sm" />
              Processing withdrawal...
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmationModal
        isOpen={Boolean(pendingValues)}
        onClose={() => {
          if (!isSubmitting) setPendingValues(null);
        }}
        onConfirm={submitWithdrawal}
        title="Confirm withdrawal"
        message={confirmationMessage}
        confirmText="Submit request"
        cancelText="Back"
        variant="warning"
        isLoading={isSubmitting}
      />
    </>
  );
}

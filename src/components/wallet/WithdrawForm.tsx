"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { FormField } from "@/components/ui/FormField";
import { NEUMORPHIC_INPUT } from "@/lib/styles";

export interface WithdrawFormValues {
  amount: string;
  destination: string;
  saveDestination: boolean;
}

interface WithdrawFormProps {
  currency: string;
  availableBalance: number;
  minimumAmount: number;
  feePercent: number;
  fixedFee: number;
  estimatedArrival: string;
  initialDestination?: string;
  onContinue: (values: WithdrawFormValues) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

interface WithdrawFormErrors {
  amount?: string;
  destination?: string;
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

function toTwoDecimals(value: number): string {
  return Math.max(0, value).toFixed(2);
}

export function WithdrawForm({
  currency,
  availableBalance,
  minimumAmount,
  feePercent,
  fixedFee,
  estimatedArrival,
  initialDestination = "",
  onContinue,
  isSubmitting = false,
  submitError = null,
}: WithdrawFormProps): React.JSX.Element {
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState(initialDestination);
  const [saveDestination, setSaveDestination] = useState(Boolean(initialDestination));
  const [errors, setErrors] = useState<WithdrawFormErrors>({});

  useEffect(() => {
    setDestination(initialDestination);
    setSaveDestination(Boolean(initialDestination));
  }, [initialDestination]);

  const numericAmount = useMemo(() => {
    const parsed = parseFloat(amount);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [amount]);

  const feeAmount = useMemo(() => {
    if (numericAmount <= 0) return 0;
    return fixedFee + numericAmount * (feePercent / 100);
  }, [fixedFee, feePercent, numericAmount]);

  const totalDeducted = numericAmount + feeAmount;
  const remainingBalance = availableBalance - totalDeducted;
  const maxWithdrawable = Math.max(0, (availableBalance - fixedFee) / (1 + feePercent / 100));

  function validate(): WithdrawFormErrors {
    const nextErrors: WithdrawFormErrors = {};
    if (!amount.trim()) {
      nextErrors.amount = "Amount is required.";
    } else if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = "Enter a valid amount greater than 0.";
    } else if (numericAmount < minimumAmount) {
      nextErrors.amount = `Minimum withdrawal is ${formatCurrency(minimumAmount, currency)}.`;
    } else if (totalDeducted > availableBalance) {
      nextErrors.amount = "Insufficient balance after withdrawal fee.";
    }

    if (!destination.trim()) {
      nextErrors.destination = "Destination wallet address is required.";
    } else if (destination.trim().length < 10) {
      nextErrors.destination = "Wallet address seems too short.";
    }
    return nextErrors;
  }

  function handleWithdrawAll() {
    setAmount(toTwoDecimals(maxWithdrawable));
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onContinue({
      amount: toTwoDecimals(numericAmount),
      destination: destination.trim(),
      saveDestination,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-4 rounded-2xl bg-primary/8 border border-primary/20">
        <p className="text-sm text-text-secondary">Available balance</p>
        <p className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">
          {formatCurrency(availableBalance, currency)}
        </p>
      </div>

      <FormField
        label="Amount"
        error={errors.amount}
        hint={`Minimum ${formatCurrency(minimumAmount, currency)}. Fee: ${feePercent}% + ${formatCurrency(
          fixedFee,
          currency
        )}.`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={isSubmitting}
            className={cn(NEUMORPHIC_INPUT, errors.amount && "ring-2 ring-error/40")}
          />
          <button
            type="button"
            onClick={handleWithdrawAll}
            disabled={isSubmitting || maxWithdrawable <= 0}
            className={cn(
              "px-4 py-3 rounded-xl text-sm font-medium",
              "bg-background text-primary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Withdraw all
          </button>
        </div>
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded-xl bg-background">
          <p className="text-text-secondary">Withdrawal fee</p>
          <p className="font-semibold text-text-primary">{formatCurrency(feeAmount, currency)}</p>
        </div>
        <div className="p-3 rounded-xl bg-background">
          <p className="text-text-secondary">Total deducted</p>
          <p className="font-semibold text-text-primary">{formatCurrency(totalDeducted, currency)}</p>
        </div>
        <div className="p-3 rounded-xl bg-background">
          <p className="text-text-secondary">Estimated arrival</p>
          <p className="font-semibold text-text-primary">{estimatedArrival}</p>
        </div>
        <div className="p-3 rounded-xl bg-background">
          <p className="text-text-secondary">Balance after request</p>
          <p className={cn("font-semibold", remainingBalance < 0 ? "text-error" : "text-text-primary")}>
            {formatCurrency(Math.max(0, remainingBalance), currency)}
          </p>
        </div>
      </div>

      <FormField
        label="Destination wallet address"
        error={errors.destination}
        hint="Double-check the address. Withdrawals sent to the wrong address cannot be reversed."
      >
        <textarea
          rows={3}
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Enter destination wallet address"
          disabled={isSubmitting}
          className={cn(NEUMORPHIC_INPUT, "resize-none", errors.destination && "ring-2 ring-error/40")}
        />
      </FormField>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={saveDestination}
          onChange={(e) => setSaveDestination(e.target.checked)}
          disabled={isSubmitting}
          className="rounded border-border"
        />
        Save this destination for next withdrawal
      </label>

      <div className="p-3 rounded-xl bg-primary/5 text-xs text-text-secondary space-y-1">
        <p>Helpful tips:</p>
        <p>- Requests are reviewed before processing to improve security.</p>
        <p>- Ensure your destination wallet supports {currency} settlements.</p>
        <p>- Network congestion can extend arrival time.</p>
      </div>

      {submitError ? (
        <div className="p-3 rounded-xl bg-error/10 text-error text-sm" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "px-5 py-2.5 rounded-xl text-sm font-medium text-white",
            "bg-primary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          Continue
        </button>
      </div>
    </form>
  );
}

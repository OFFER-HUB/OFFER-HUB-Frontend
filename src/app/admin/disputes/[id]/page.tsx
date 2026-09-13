"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAdminDispute } from "@/hooks/useAdminDispute";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { formatDateTime } from "@/lib/date-formatters";
import { StatusBadge } from "@/components/admin/disputes/DisputesTable";
import { DisputePartyCard } from "@/components/admin/disputes/DisputePartyCard";
import { DisputeMilestones } from "@/components/admin/disputes/DisputeMilestones";
import { DisputeResolutionForm } from "@/components/admin/disputes/DisputeResolutionForm";
import { ORDER_STATUS_CONFIG } from "@/types/order.types";
import { STELLAR_EXPLORER_URL } from "@/config/wallet";
import {
  ADMIN_DISPUTE_REASON_LABELS,
  DISPUTE_OPENED_BY_LABELS,
  RESOLUTION_DECISION_CONFIG,
} from "@/types/admin.types";

const ADMIN_DISPUTES_ROUTE = "/admin/disputes";

export default function AdminDisputeDetailPage(): React.JSX.Element | null {
  const params = useParams();
  const disputeId = typeof params.id === "string" ? params.id : null;
  const isAuthorized = useAdminGuard();
  const detail = useAdminDispute(disputeId, isAuthorized);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [copiedDisputeId, setCopiedDisputeId] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [copiedContractId, setCopiedContractId] = useState(false);

  const handleCopy = useCallback(async (text: string, type: "dispute" | "order" | "contract") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "dispute") {
        setCopiedDisputeId(true);
        setTimeout(() => setCopiedDisputeId(false), 2000);
      } else if (type === "order") {
        setCopiedOrderId(true);
        setTimeout(() => setCopiedOrderId(false), 2000);
      } else {
        setCopiedContractId(true);
        setTimeout(() => setCopiedContractId(false), 2000);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!isAuthorized) {
    return <LoadingState variant="fullscreen" message="Checking permissions..." />;
  }
  if (detail.isLoading) {
    return <LoadingState message="Loading dispute..." />;
  }
  if (detail.error || !detail.dispute) {
    return (
      <div className="space-y-6">
        <Link
          href={ADMIN_DISPUTES_ROUTE}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-2xl",
            "bg-background text-text-secondary hover:text-text-primary text-sm font-medium",
            "shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff]",
            "hover:shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]",
            "transition-all duration-200"
          )}
        >
          <Icon path={ICON_PATHS.chevronLeft} size="sm" />
          <span>All Disputes</span>
        </Link>
        <ErrorState
          title="Dispute not found"
          message={detail.error ?? "This dispute does not exist."}
          onRetry={detail.refetch}
        />
      </div>
    );
  }

  const dispute = detail.dispute;
  const { order } = dispute;
  const orderStatus = ORDER_STATUS_CONFIG[order.status] ?? {
    label: order.status,
    color: "text-text-secondary",
    bg: "bg-text-secondary/10",
  };

  const isUnderReview = dispute.status === "UNDER_REVIEW";
  const isResolved = dispute.status === "RESOLVED";

  async function handleTakeForReview() {
    setActionError(null);
    try {
      await detail.takeForReview();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to take the dispute for review.");
    }
  }

  const contractAddress = order.escrow?.id;

  return (
    <div className="space-y-7 pb-16 w-full">
      {/* Top Breadcrumbs & Quick Back */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            href={ADMIN_DISPUTES_ROUTE}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-2xl",
              "bg-background text-text-secondary hover:text-text-primary text-sm font-medium",
              "shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff]",
              "hover:shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]",
              "transition-all duration-200"
            )}
          >
            <Icon path={ICON_PATHS.chevronLeft} size="sm" />
            <span>All Disputes</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs text-text-secondary pl-2">
            <span>/</span>
            <span className="truncate max-w-[280px]">{order.title}</span>
            <span>/</span>
            <span className="font-mono text-text-primary font-medium">#{dispute.id.slice(-8)}</span>
          </div>
        </div>
      </div>

      {/* Main Dispute Summary Header */}
      <div className={cn(NEUMORPHIC_CARD, "p-6 sm:p-8 space-y-5")}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  dispute.openedBy === "BUYER"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary/10 text-secondary"
                )}
              >
                {DISPUTE_OPENED_BY_LABELS[dispute.openedBy]}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-warning/10 text-warning">
                {ADMIN_DISPUTE_REASON_LABELS[dispute.reason]}
              </span>

              <button
                type="button"
                onClick={() => handleCopy(dispute.id, "dispute")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-text-secondary cursor-pointer",
                  "bg-background shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                  "hover:text-text-primary transition-colors"
                )}
                title="Copy Dispute ID"
              >
                <Icon
                  path={copiedDisputeId ? ICON_PATHS.check : ICON_PATHS.copy}
                  size="sm"
                  className="w-3.5 h-3.5"
                />
                <span>{copiedDisputeId ? "Copied" : `#${dispute.id.slice(-8)}`}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(order.id, "order")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-text-secondary cursor-pointer",
                  "bg-background shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                  "hover:text-text-primary transition-colors"
                )}
                title="Copy Order ID"
              >
                <Icon
                  path={copiedOrderId ? ICON_PATHS.check : ICON_PATHS.copy}
                  size="sm"
                  className="w-3.5 h-3.5"
                />
                <span>{copiedOrderId ? "Copied Order" : `Order #${order.id.slice(-8)}`}</span>
              </button>

              <span className="text-xs text-text-secondary flex items-center gap-1">
                <Icon path={ICON_PATHS.calendar} size="sm" className="w-3.5 h-3.5" />
                <span>Opened {formatDateTime(dispute.createdAt)}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-snug">
              {order.title}
            </h1>
          </div>

          {/* Right Escrow & Status Block */}
          <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 shrink-0">
            <div className="text-left md:text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Disputed Escrow
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-primary font-mono tracking-tight">
                ${Number(order.amount).toFixed(2)}{" "}
                <span className="text-xs text-text-secondary uppercase">{order.currency}</span>
              </p>
            </div>

            <div className="flex items-center">
              <StatusBadge status={dispute.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout (Matching Orders Experience) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Documentation, Progress & Evidence (8 Cols) */}
        <div className="lg:col-span-8 space-y-7">
          {/* Dispute Progress Stepper */}
          <div className={cn(NEUMORPHIC_CARD, "p-6 sm:p-7 space-y-4")}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Adjudication Lifecycle
              </p>
              <span className="text-xs font-semibold text-primary">
                {dispute.status === "OPEN"
                  ? "Stage 1: Awaiting Review"
                  : dispute.status === "UNDER_REVIEW"
                    ? "Stage 2: Under Investigation"
                    : "Stage 3: Adjudication Completed"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Step 1 */}
              <div
                className={cn(
                  "p-3.5 rounded-2xl flex items-center gap-3 transition-all",
                  "bg-white shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff]"
                )}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 bg-success text-white shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff]">
                  ✓
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">1. Dispute Opened</p>
                  <p className="text-[10px] text-text-secondary truncate">
                    By {dispute.openedBy === "BUYER" ? "Buyer" : "Seller"}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={cn(
                  "p-3.5 rounded-2xl flex items-center gap-3 transition-all",
                  isUnderReview
                    ? "bg-primary/5 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                    : isResolved
                      ? "bg-white shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff]"
                      : "opacity-60 bg-background shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all",
                    isResolved
                      ? "bg-success text-white shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff]"
                      : isUnderReview
                        ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] animate-pulse"
                        : "bg-background text-text-secondary shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
                  )}
                >
                  {isResolved ? "✓" : "2"}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-xs font-bold truncate",
                      isUnderReview
                        ? "text-primary"
                        : isResolved
                          ? "text-text-primary"
                          : "text-text-secondary"
                    )}
                  >
                    2. Under Review
                  </p>
                  <p className="text-[10px] text-text-secondary truncate">
                    Administrator evaluation
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={cn(
                  "p-3.5 rounded-2xl flex items-center gap-3 transition-all",
                  isResolved
                    ? "bg-primary/5 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                    : "opacity-60 bg-background shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all",
                    isResolved
                      ? "bg-success text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                      : "bg-background text-text-secondary shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
                  )}
                >
                  {isResolved ? "✓" : "3"}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-xs font-bold truncate",
                      isResolved ? "text-primary" : "text-text-secondary"
                    )}
                  >
                    3. Settled
                  </p>
                  <p className="text-[10px] text-text-secondary truncate">On-chain distribution</p>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence & Documentation */}
          <section className={cn(NEUMORPHIC_CARD, "p-6 sm:p-7 space-y-4")}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Dispute Evidence</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Uploaded documentation and proofs submitted with this claim
                </p>
              </div>
              {dispute.evidence && dispute.evidence.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  {dispute.evidence.length} {dispute.evidence.length === 1 ? "file" : "files"}
                </span>
              )}
            </div>

            {!dispute.evidence || dispute.evidence.length === 0 ? (
              <div className={cn(NEUMORPHIC_INSET, "p-6 rounded-2xl text-center space-y-2")}>
                <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-text-secondary bg-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]">
                  <Icon path={ICON_PATHS.paperclip} size="sm" />
                </div>
                <p className="text-sm text-text-secondary font-medium">
                  No evidence was attached when the dispute was opened.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dispute.evidence.map((url, idx) => (
                  <div
                    key={url}
                    className={cn(
                      NEUMORPHIC_INSET,
                      "p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all",
                      "hover:shadow-[inset_3px_3px_6px_#cbd5e1,inset_-3px_-3px_6px_#ffffff]"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] flex items-center justify-center text-primary shrink-0">
                        <Icon path={ICON_PATHS.paperclip} size="sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-text-secondary">
                          Evidence Attachment #{idx + 1}
                        </p>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-primary hover:underline truncate block"
                        >
                          {url}
                        </a>
                      </div>
                    </div>

                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0",
                        "bg-white text-primary shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                        "hover:shadow-[1px_1px_2px_#d1d5db,-1px_-1px_2px_#ffffff]",
                        "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                      )}
                    >
                      <span>Open Link</span>
                      <Icon path={ICON_PATHS.externalLink} size="sm" className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Order Milestones */}
          <section className={cn(NEUMORPHIC_CARD, "p-6 sm:p-7 space-y-4")}>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Order Milestones</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Contract deliverables and milestone payment breakdown
              </p>
            </div>
            <DisputeMilestones milestones={order.milestones} currency={order.currency} />
          </section>

          {/* Order Brief & Project Scope */}
          {order.description && (
            <section className={cn(NEUMORPHIC_CARD, "p-6 sm:p-7 space-y-3")}>
              <h2 className="text-lg font-bold text-text-primary">Order Brief & Requirements</h2>
              <div
                className={cn(
                  NEUMORPHIC_INSET,
                  "p-5 rounded-2xl text-sm text-text-secondary whitespace-pre-wrap leading-relaxed"
                )}
              >
                {order.description}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Admin Action Hub & Counterparty Info (4 Cols, Sticky) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          {/* Admin Resolution Center Card */}
          <section className={cn(NEUMORPHIC_CARD, "p-6 sm:p-7 space-y-5")}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary font-bold shrink-0">
                <Icon path={ICON_PATHS.shield} size="sm" />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary">Resolution Center</h2>
                <p className="text-xs text-text-secondary">Administrative adjudication</p>
              </div>
            </div>

            {dispute.status === "OPEN" && (
              <div className="space-y-4">
                <div className={cn(NEUMORPHIC_INSET, "p-4 rounded-2xl text-xs text-text-secondary leading-relaxed")}>
                  This dispute is currently unassigned. Take it for review to lock adjudication under
                  your administrator account.
                </div>

                <button
                  type="button"
                  onClick={handleTakeForReview}
                  disabled={detail.isActing}
                  className={cn(
                    "w-full py-3.5 px-5 rounded-2xl font-bold text-sm text-white bg-primary transition-all flex items-center justify-center gap-2 cursor-pointer",
                    "shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff]",
                    "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                    "active:shadow-[inset_2px_2px_4px_#00000030]",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                >
                  {detail.isActing ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    <Icon path={ICON_PATHS.eye} size="sm" />
                  )}
                  <span>Take for Review</span>
                </button>
              </div>
            )}

            {dispute.status === "UNDER_REVIEW" && (
              <div className="space-y-4">
                <div className={cn(NEUMORPHIC_INSET, "p-4 rounded-2xl text-xs text-text-secondary leading-relaxed")}>
                  You are currently reviewing this claim. Evaluate the milestone deliverables and
                  evidence before issuing the irrevocable on-chain resolution.
                </div>

                <button
                  type="button"
                  onClick={() => setIsResolveOpen(true)}
                  disabled={detail.isActing}
                  className={cn(
                    "w-full py-3.5 px-5 rounded-2xl font-bold text-sm text-white bg-primary transition-all flex items-center justify-center gap-2 cursor-pointer",
                    "shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff]",
                    "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                    "active:shadow-[inset_2px_2px_4px_#00000030]",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                >
                  <Icon path={ICON_PATHS.check} size="sm" />
                  <span>Resolve Dispute & Settle</span>
                </button>
              </div>
            )}

            {dispute.status === "RESOLVED" && dispute.resolutionDecision && (
              <div className={cn(NEUMORPHIC_INSET, "p-4 rounded-2xl space-y-3")}>
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-block text-xs font-bold px-3 py-1 rounded-xl shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]",
                      RESOLUTION_DECISION_CONFIG[dispute.resolutionDecision].color,
                      RESOLUTION_DECISION_CONFIG[dispute.resolutionDecision].bg
                    )}
                  >
                    {RESOLUTION_DECISION_CONFIG[dispute.resolutionDecision].label}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {formatDateTime(dispute.updatedAt)}
                  </span>
                </div>

                <div className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
                  <p className="font-semibold text-text-secondary text-[11px] mb-1">
                    Decision Note:
                  </p>
                  {dispute.decisionNote ?? "No decision note provided."}
                </div>
              </div>
            )}

            {actionError && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-error/10 text-error text-xs font-medium">
                <Icon path={ICON_PATHS.alertCircle} size="sm" className="shrink-0" />
                <span>{actionError}</span>
              </div>
            )}
          </section>

          {/* Disputing Parties */}
          <section className={cn(NEUMORPHIC_CARD, "p-6 sm:p-7 space-y-4")}>
            <div>
              <h2 className="text-base font-bold text-text-primary">Disputing Parties</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Buyer and seller profiles for this contract
              </p>
            </div>
            <div className="space-y-3">
              <DisputePartyCard
                role="Buyer"
                party={order.buyer}
                openedDispute={dispute.openedBy === "BUYER"}
              />
              <DisputePartyCard
                role="Seller"
                party={order.seller}
                openedDispute={dispute.openedBy === "SELLER"}
              />
            </div>
          </section>

          {/* Escrow Smart Contract Details */}
          <section className={cn(NEUMORPHIC_CARD, "p-6 sm:p-7 space-y-4")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] text-primary">
                  <Icon path={ICON_PATHS.lock} size="sm" />
                </div>
                <h2 className="text-base font-bold text-text-primary">Escrow Contract</h2>
              </div>
              {order.escrow && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                  {order.escrow.status}
                </span>
              )}
            </div>

            {order.escrow ? (
              <div className={cn(NEUMORPHIC_INSET, "p-4 rounded-2xl space-y-3")}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                    Escrow ID
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="font-mono text-xs text-text-primary truncate">
                      {order.escrow.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(order.escrow!.id, "contract")}
                      className="p-1.5 rounded-lg bg-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] text-text-secondary hover:text-primary transition-all shrink-0 cursor-pointer"
                      title="Copy Escrow ID"
                    >
                      <Icon
                        path={copiedContractId ? ICON_PATHS.check : ICON_PATHS.copy}
                        size="sm"
                        className="w-3.5 h-3.5"
                      />
                    </button>
                  </div>
                </div>

                {contractAddress && (
                  <a
                    href={`${STELLAR_EXPLORER_URL}/contract/${contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
                      "bg-white text-primary shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                      "hover:shadow-[1px_1px_2px_#d1d5db,-1px_-1px_2px_#ffffff]"
                    )}
                  >
                    <Icon path={ICON_PATHS.externalLink} size="sm" className="w-3.5 h-3.5" />
                    <span>View on Stellar Explorer</span>
                  </a>
                )}
              </div>
            ) : (
              <div className={cn(NEUMORPHIC_INSET, "p-4 rounded-2xl text-center")}>
                <p className="text-xs text-text-secondary">No escrow record on this order.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Resolution Modal */}
      <Modal isOpen={isResolveOpen} title="Resolve dispute" onClose={() => setIsResolveOpen(false)}>
        <DisputeResolutionForm
          dispute={dispute}
          onSubmit={async (payload) => {
            await detail.resolve(payload);
            setIsResolveOpen(false);
          }}
          onCancel={() => setIsResolveOpen(false)}
        />
      </Modal>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, PRIMARY_BUTTON } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import type { Application } from "@/types/application.types";
import { useLiveRound } from "../use-live-round";
import { useCreateSealedRound } from "../use-create-sealed-round";
import { isSealedApplication, sealedApplicationBidder } from "../application-link";
import type { LiveRoundPhase, RevealedProposal } from "../live.types";
import { SealedBadge } from "./SubRosaBadges";
import { SealedProposalsToggle } from "./SealedProposalsToggle";
import { SealedRoundEvidence } from "./SealedRoundEvidence";

const PHASE_COPY: Record<LiveRoundPhase, { label: string; tone: string }> = {
  collecting: {
    label: "Collecting sealed proposals",
    tone: "bg-primary/15 text-primary border-primary/30",
  },
  sealed: {
    label: "Sealed — awaiting reveal window",
    tone: "bg-warning/15 text-warning border-warning/30",
  },
  revealable: { label: "Ready to reveal", tone: "bg-success/15 text-success border-success/30" },
  revealed: { label: "Revealed", tone: "bg-success/15 text-success border-success/30" },
  closed: {
    label: "Closed",
    tone: "bg-text-secondary/15 text-text-secondary border-text-secondary/30",
  },
};

function shortenAddress(addr: string): string {
  return addr.length > 12 ? `${addr.slice(0, 5)}…${addr.slice(-5)}` : addr;
}

function fmtUnix(secs: number): string {
  return new Date(secs * 1000).toLocaleString();
}

interface RevealedProposalCardProps {
  proposal: RevealedProposal;
  application: Application | null;
  onAccept?: (applicationId: string) => Promise<void>;
  onReject?: (applicationId: string) => Promise<void>;
}

function RevealedProposalCard({
  proposal,
  application,
  onAccept,
  onReject,
}: RevealedProposalCardProps): React.JSX.Element {
  const router = useRouter();
  const [decision, setDecision] = useState<"accept" | "reject" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function confirmDecision(): Promise<void> {
    if (!application || !decision) return;
    setIsProcessing(true);
    try {
      if (decision === "accept") {
        await onAccept?.(application.id);
        router.push("/app/orders");
      } else {
        await onReject?.(application.id);
      }
      setDecision(null);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          "p-4 rounded-2xl bg-background space-y-3",
          "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-text-secondary">
            {shortenAddress(proposal.bidder)}
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-text-secondary">
              <Icon path={ICON_PATHS.clock} size="sm" className="w-3 h-3" />
              {proposal.timelineDays}d
            </span>
            {proposal.totalAmount !== undefined && (
              <span className="font-bold text-primary">
                {proposal.totalAmount.toLocaleString()} {proposal.currency ?? ""}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-text-primary whitespace-pre-wrap">{proposal.approach}</p>
        {proposal.deliverables && proposal.deliverables.length > 0 && (
          <ul className="text-xs text-text-secondary list-disc list-inside space-y-0.5">
            {proposal.deliverables.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        )}

        {application?.status === "PENDING" && onAccept && onReject ? (
          <div className="flex items-center gap-2 pt-2 border-t border-border-light/60">
            <button
              type="button"
              onClick={() => setDecision("accept")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white text-success shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
            >
              <Icon path={ICON_PATHS.check} size="sm" />
              Accept this proposal
            </button>
            <button
              type="button"
              onClick={() => setDecision("reject")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white text-error shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
            >
              <Icon path={ICON_PATHS.close} size="sm" />
              Reject
            </button>
          </div>
        ) : application ? (
          <p className="pt-2 border-t border-border-light/60 text-xs font-semibold text-text-secondary">
            Application status: {application.status.toLowerCase()}
          </p>
        ) : (
          <p className="pt-2 border-t border-border-light/60 text-xs text-warning">
            This revealed bidder could not be linked to an OFFER HUB application.
          </p>
        )}
      </div>

      <ConfirmationModal
        isOpen={decision !== null}
        onClose={() => setDecision(null)}
        onConfirm={confirmDecision}
        title={decision === "accept" ? "Accept Revealed Proposal" : "Reject Revealed Proposal"}
        message={
          decision === "accept"
            ? "Accept this revealed proposal and continue with OFFER HUB's provider flow?"
            : "Reject this revealed proposal?"
        }
        confirmText={decision === "accept" ? "Accept" : "Reject"}
        variant={decision === "accept" ? "info" : "danger"}
        isLoading={isProcessing}
      />
    </>
  );
}

/**
 * The client's view of a sealed round on their offer. Shows the current phase,
 * how many proposals are sealed, the reveal action once the window opens, and
 * the revealed proposals afterwards.
 *
 * Sub Rosa reveals every proposal at once — it does NOT pick a winner. The
 * client still selects a provider through OFFER HUB's own flow.
 */
export function SealedRoundPanel({
  offerId,
  allowCreate = false,
  onProviderSelectionReadyChange,
  applications = [],
  onAcceptApplication,
  onRejectApplication,
}: {
  offerId: string;
  /** Lets an offer owner recover from a failed create-page round transaction. */
  allowCreate?: boolean;
  /** Locks OFFER HUB's accept/reject flow until every sealed proposal reveals. */
  onProviderSelectionReadyChange?: (ready: boolean) => void;
  applications?: Application[];
  onAcceptApplication?: (applicationId: string) => Promise<void>;
  onRejectApplication?: (applicationId: string) => Promise<void>;
}): React.JSX.Element | null {
  const {
    loading,
    hasSealedRound,
    record,
    view,
    error,
    refresh,
    hasSubmitted: _hasSubmitted,
    revealState,
    revealError,
    reveal,
  } = useLiveRound(offerId);
  const { create, state: createState, error: createError, canCreate } = useCreateSealedRound();
  const [createEnabled, setCreateEnabled] = useState(false);
  const [createDeadline, setCreateDeadline] = useState<Date | null>(null);

  // Read the clock once at mount — used only for the phase fallback before a
  // wallet-backed on-chain read lands. Reading it in render breaks purity rules.
  const [nowSecs] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (loading) return;
    onProviderSelectionReadyChange?.(!hasSealedRound || view?.phase === "revealed");
  }, [loading, hasSealedRound, view?.phase, onProviderSelectionReadyChange]);

  if (loading) {
    return (
      <div className={cn(NEUMORPHIC_CARD, "flex items-center gap-3 text-sm text-text-secondary")}>
        <LoadingSpinner size="sm" />
        Loading sealed round…
      </div>
    );
  }

  if (!hasSealedRound || !record) {
    if (!allowCreate) return null;

    const isCreating = createState === "creating";
    return (
      <div className={cn(NEUMORPHIC_CARD, "space-y-4")}>
        <SealedProposalsToggle
          enabled={createEnabled}
          onEnabledChange={setCreateEnabled}
          deadline={createDeadline}
          onDeadlineChange={setCreateDeadline}
          walletConnected={canCreate}
          disabled={isCreating}
        />

        {createEnabled ? (
          <div className="space-y-2">
            <button
              type="button"
              disabled={!createDeadline || !canCreate || isCreating}
              onClick={() => {
                if (!createDeadline) return;
                void (async () => {
                  const created = await create(offerId, createDeadline);
                  if (created) await refresh();
                })();
              }}
              className={cn(PRIMARY_BUTTON, "w-full justify-center text-sm py-3 font-bold")}
            >
              {isCreating ? (
                <span className="flex items-center gap-2 justify-center">
                  <LoadingSpinner size="sm" />
                  Opening sealed round — confirm in wallet…
                </span>
              ) : (
                "Open sealed proposal round"
              )}
            </button>
            {createError ? (
              <p className="text-xs text-error font-medium flex items-start gap-1.5">
                <Icon path={ICON_PATHS.alertCircle} size="sm" className="mt-0.5 shrink-0" />
                {createError}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  const phase = view?.phase ?? (nowSecs < record.commitDeadline ? "collecting" : "sealed");
  const phaseCopy = PHASE_COPY[phase];
  const sealedCount = view?.bidders.length ?? 0;
  const canReveal = phase === "revealable";
  const sealedApplications = applications.filter(isSealedApplication);

  function applicationForProposal(proposal: RevealedProposal): Application | null {
    const exact = sealedApplications.find(
      (application) => sealedApplicationBidder(application) === proposal.bidder
    );
    if (exact) return exact;

    // Compatibility for rounds submitted before bidder markers were added.
    if (view?.revealed.length === 1 && sealedApplications.length === 1) {
      return sealedApplications[0];
    }
    return null;
  }

  return (
    <div className={cn(NEUMORPHIC_CARD, "space-y-5")}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SealedBadge />
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
            phaseCopy.tone
          )}
        >
          {phaseCopy.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-text-secondary">
            Sealed proposals
          </span>
          <span className="text-lg font-black text-text-primary">{sealedCount}</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-text-secondary">
            Proposals close
          </span>
          <span className="text-xs font-semibold text-text-primary">
            {fmtUnix(record.commitDeadline)}
          </span>
        </div>
      </div>

      {error && (
        <p className="text-xs text-error font-medium flex items-center gap-1.5">
          <Icon path={ICON_PATHS.alertCircle} size="sm" />
          {error}
        </p>
      )}

      {(phase === "sealed" || phase === "revealable") && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => void reveal()}
            disabled={revealState === "revealing" || !canReveal}
            className={cn(PRIMARY_BUTTON, "w-full justify-center text-sm py-3 font-bold")}
          >
            {revealState === "revealing" ? (
              <span className="flex items-center gap-2 justify-center">
                <LoadingSpinner size="sm" />
                Revealing…
              </span>
            ) : canReveal ? (
              "Reveal all proposals"
            ) : (
              "Waiting for Drand reveal…"
            )}
          </button>
          {revealError && (
            <p className="text-xs text-error font-medium flex items-center gap-1.5">
              <Icon path={ICON_PATHS.alertCircle} size="sm" />
              {revealError}
            </p>
          )}
          <p className="text-[11px] text-text-secondary">
            Revealing decrypts every sealed proposal at once. You still choose the provider
            yourself.
          </p>
        </div>
      )}

      {view && view.revealed.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Revealed proposals ({view.revealed.length})
          </h4>
          {view.revealed.map((p) => (
            <RevealedProposalCard
              key={p.bidder}
              proposal={p}
              application={applicationForProposal(p)}
              onAccept={onAcceptApplication}
              onReject={onRejectApplication}
            />
          ))}
        </div>
      )}

      <SealedRoundEvidence record={record} statusTag={view?.statusTag} />
    </div>
  );
}

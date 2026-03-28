"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DisputeTimeline } from "@/components/disputes/DisputeTimeline";
import {
  DisputeResolutionForm,
  StatusChangeForm,
} from "@/components/admin/disputes/DisputeResolutionForm";
import {
  getAdminDisputeById,
  resolveDispute,
  updateDisputeStatus,
  addInternalNote,
  addAdminComment,
} from "@/lib/api/admin-disputes";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INSET,
  ICON_BUTTON,
} from "@/lib/styles";
import {
  ADMIN_DISPUTE_STATUS_CONFIG,
  ADMIN_DISPUTE_PRIORITY_CONFIG,
  ADMIN_DISPUTE_OUTCOME_CONFIG,
  type AdminDispute,
  type DisputeResolutionOutcome,
} from "@/types/admin.types";
import {
  DISPUTE_REASON_LABELS,
  DISPUTE_STATUS_LABELS,
  type DisputeComment,
} from "@/types/dispute.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatResolutionTime(createdAt: string, resolvedAt: string): string {
  const ms = new Date(resolvedAt).getTime() - new Date(createdAt).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const FILLED_PRIMARY_BUTTON = cn(
  "px-5 py-2.5 rounded-xl font-medium cursor-pointer flex items-center gap-2 text-sm",
  "bg-primary text-white",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
  "hover:bg-primary-hover",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "transition-all duration-200"
);

const COMMENT_ROLE_COLORS: Record<DisputeComment["authorRole"], string> = {
  client: "bg-primary/10 border-primary/20",
  freelancer: "bg-secondary/10 border-secondary/20",
  admin: "bg-warning/10 border-warning/20",
};

const COMMENT_ROLE_LABELS: Record<DisputeComment["authorRole"], string> = {
  client: "Buyer",
  freelancer: "Seller",
  admin: "Support",
};

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-text-secondary text-sm shrink-0">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

interface PartyCardProps {
  role: "Buyer" | "Seller";
  party: AdminDispute["buyer"];
}

function PartyCard({ role, party }: PartyCardProps) {
  return (
    <div className={cn("p-4 rounded-xl", NEUMORPHIC_INSET)}>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
        {role}
      </p>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
          {party.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-text-primary text-sm truncate">{party.username}</p>
          <p className="text-xs text-text-secondary truncate">{party.email}</p>
        </div>
      </div>
      <p className="text-xs text-text-secondary mb-2">
        Total disputes:{" "}
        <span className="text-text-primary font-medium">{party.totalDisputes}</span>
      </p>
      {party.previousDisputes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-secondary mb-1.5">Previous disputes</p>
          <div className="space-y-1.5">
            {party.previousDisputes.map((pd) => {
              const cfg = ADMIN_DISPUTE_STATUS_CONFIG[pd.status];
              return (
                <div key={pd.id} className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary truncate max-w-[120px]" title={pd.offerTitle}>
                    {pd.offerTitle}
                  </span>
                  <span className={cn("font-medium px-1.5 py-0.5 rounded", cfg.color, cfg.bg)}>
                    {DISPUTE_STATUS_LABELS[pd.status]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ isOpen, title, onClose, children }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(NEUMORPHIC_CARD, "relative w-full max-w-lg animate-scale-in")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
            aria-label="Close"
          >
            <Icon path={ICON_PATHS.close} size="md" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDisputeDetailPage(): React.JSX.Element | null {
  const params = useParams();
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [dispute, setDispute] = useState<AdminDispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Form states ──
  const [adminComment, setAdminComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // ── Modal states ──
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const disputeId = params.id as string;

  // ── Admin guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || user === null) {
      router.replace("/login");
      return;
    }
    if (user.type !== "ADMIN") {
      router.replace("/app/client/dashboard");
      return;
    }
    setIsAuthorized(true);
  }, [user, isAuthenticated, router]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthorized || !token) return;

    async function fetchDispute() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAdminDisputeById(token!, disputeId);
        setDispute(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dispute");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDispute();
  }, [isAuthorized, token, disputeId, refreshKey]);

  // ── Resolve handler ───────────────────────────────────────────────────────
  const handleResolve = useCallback(
    async (outcome: DisputeResolutionOutcome, resolution: string) => {
      if (!token || !dispute) return;
      const updated = await resolveDispute(token, dispute.id, { outcome, resolution });
      setDispute(updated);
      setShowResolveModal(false);
    },
    [token, dispute]
  );

  // ── Status change handler ─────────────────────────────────────────────────
  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!token || !dispute) return;
      const updated = await updateDisputeStatus(token, dispute.id, {
        status: newStatus as AdminDispute["status"],
      });
      setDispute(updated);
      setShowStatusModal(false);
    },
    [token, dispute]
  );

  // ── Add admin comment ─────────────────────────────────────────────────────
  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!adminComment.trim() || !token || !dispute) return;
    setIsSubmittingComment(true);
    try {
      const updated = await addAdminComment(token, dispute.id, adminComment.trim());
      setDispute(updated);
      setAdminComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  }

  // ── Add internal note ─────────────────────────────────────────────────────
  async function handleSubmitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim() || !token || !dispute) return;
    setIsSubmittingNote(true);
    try {
      const updated = await addInternalNote(token, dispute.id, { content: newNote.trim() });
      setDispute(updated);
      setNewNote("");
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setIsSubmittingNote(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  if (!isAuthorized) {
    return <LoadingState variant="fullscreen" message="Checking permissions..." />;
  }

  if (isLoading) {
    return <LoadingState message="Loading dispute..." />;
  }

  if (error) {
    return (
      <ErrorState message={error} onRetry={() => setRefreshKey((k) => k + 1)} />
    );
  }

  if (!dispute) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={cn(NEUMORPHIC_CARD, "text-center max-w-md")}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-background shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
            <Icon path={ICON_PATHS.flag} size="xl" className="text-text-secondary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Dispute not found</h2>
          <p className="text-text-secondary mb-4">
            The dispute you are looking for does not exist or has been removed.
          </p>
          <Link href="/admin/disputes" className={FILLED_PRIMARY_BUTTON + " justify-center"}>
            Back to Disputes
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = ADMIN_DISPUTE_STATUS_CONFIG[dispute.status];
  const priorityCfg = ADMIN_DISPUTE_PRIORITY_CONFIG[dispute.priority];
  const isResolvable = dispute.status === "open" || dispute.status === "under_review";
  const ageMs = Date.now() - new Date(dispute.createdAt).getTime();
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/disputes" className={cn(ICON_BUTTON, "shrink-0 mt-1")}>
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary truncate">
              {dispute.offerTitle}
            </h1>
            <span
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-semibold shrink-0",
                statusCfg.color,
                statusCfg.bg
              )}
            >
              {statusCfg.label}
            </span>
            <span
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-semibold shrink-0",
                priorityCfg.color,
                priorityCfg.bg
              )}
            >
              {priorityCfg.label}
            </span>
          </div>
          <p className="text-text-secondary mt-1 text-sm">
            Dispute #{dispute.id} · Opened {formatDate(dispute.createdAt)}
            {ageDays > 0 && (
              <span className={cn("ml-2 font-medium", ageDays >= 7 ? "text-error" : "text-warning")}>
                ({ageDays} days ago)
              </span>
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isResolvable && (
            <>
              <button
                type="button"
                onClick={() => setShowStatusModal(true)}
                className={cn(
                  "px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2",
                  "bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                  "text-primary transition-all duration-200"
                )}
              >
                <Icon path={ICON_PATHS.refresh} size="sm" />
                Status
              </button>
              <button
                type="button"
                onClick={() => setShowResolveModal(true)}
                className={FILLED_PRIMARY_BUTTON}
              >
                <Icon path={ICON_PATHS.check} size="sm" />
                Resolve
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* ── Left column ── */}
        <div className="xl:col-span-2 space-y-4">
          {/* Dispute details */}
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Dispute Details</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[140px]">
                  <p className="text-text-secondary text-xs mb-1">Reason</p>
                  <p className="text-text-primary font-medium text-sm">
                    {DISPUTE_REASON_LABELS[dispute.reason]}
                  </p>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <p className="text-text-secondary text-xs mb-1">Disputed Amount</p>
                  <p className="text-text-primary font-semibold text-sm">
                    ${dispute.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <p className="text-text-secondary text-xs mb-1">Related Offer</p>
                  <p className="text-text-primary text-sm font-medium">
                    #{dispute.offerId}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Description</p>
                <p className="text-text-primary text-sm">{dispute.description}</p>
              </div>

              {dispute.resolution && (
                <div className={cn("p-4 rounded-xl", NEUMORPHIC_INSET)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon path={ICON_PATHS.check} size="sm" className="text-success" />
                    <p className="text-sm font-semibold text-success">Resolution</p>
                    {dispute.resolutionOutcome && (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          ADMIN_DISPUTE_OUTCOME_CONFIG[dispute.resolutionOutcome].color,
                          "bg-current/10"
                        )}
                      >
                        {ADMIN_DISPUTE_OUTCOME_CONFIG[dispute.resolutionOutcome].label}
                      </span>
                    )}
                  </div>
                  <p className="text-text-primary text-sm">{dispute.resolution}</p>
                  {dispute.resolvedAt && dispute.resolvedBy && (
                    <p className="text-xs text-text-secondary mt-2">
                      Resolved by <span className="font-medium">{dispute.resolvedBy}</span> on{" "}
                      {formatDateTime(dispute.resolvedAt)}
                      {" · "}
                      <span className="font-medium">
                        {formatResolutionTime(dispute.createdAt, dispute.resolvedAt)}
                      </span>{" "}
                      resolution time
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Evidence */}
          {dispute.evidence.length > 0 && (
            <div className={NEUMORPHIC_CARD}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Evidence ({dispute.evidence.length} files)
              </h2>
              <div className="space-y-2">
                {dispute.evidence.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        path={
                          file.type.startsWith("image/")
                            ? ICON_PATHS.image
                            : file.type.startsWith("video/")
                            ? ICON_PATHS.video
                            : ICON_PATHS.file
                        }
                        size="md"
                        className="text-text-secondary shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-text-primary text-sm font-medium truncate">{file.name}</p>
                        <p className="text-text-secondary text-xs">
                          {(file.size / 1024).toFixed(0)} KB · Uploaded{" "}
                          {formatDate(file.uploadedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Discussion ({dispute.comments.length})
            </h2>
            <div className="space-y-3">
              {dispute.comments.map((comment) => (
                <div
                  key={comment.id}
                  className={cn("p-4 rounded-xl border", COMMENT_ROLE_COLORS[comment.authorRole])}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary text-sm">
                        {comment.author}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-background text-text-secondary">
                        {COMMENT_ROLE_LABELS[comment.authorRole]}
                      </span>
                    </div>
                    <span className="text-text-secondary text-xs">
                      {formatDateTime(comment.timestamp)}
                    </span>
                  </div>
                  <p className="text-text-primary text-sm">{comment.content}</p>
                </div>
              ))}

              {/* Admin reply form */}
              <form onSubmit={handleSubmitComment} className="mt-2">
                <p className="text-xs font-semibold text-text-secondary mb-2">Add Admin Comment</p>
                <div className={cn("rounded-xl", NEUMORPHIC_INSET)}>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Write a message visible to both parties..."
                    rows={3}
                    className={cn(
                      "w-full p-4 bg-transparent resize-none",
                      "text-text-primary placeholder:text-text-secondary/60",
                      "outline-none text-sm"
                    )}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !adminComment.trim()}
                    className={FILLED_PRIMARY_BUTTON}
                  >
                    {isSubmittingComment ? (
                      <>
                        <LoadingSpinner size="sm" className="text-white" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Icon path={ICON_PATHS.send} size="sm" />
                        Send Comment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Internal Notes */}
          <div className={NEUMORPHIC_CARD}>
            <div className="flex items-center gap-2 mb-4">
              <Icon path={ICON_PATHS.lock} size="md" className="text-warning" />
              <h2 className="text-lg font-semibold text-text-primary">
                Internal Notes ({dispute.internalNotes.length})
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-warning/10 text-warning font-medium">
                Admin only
              </span>
            </div>

            <div className="space-y-3">
              {dispute.internalNotes.length === 0 && (
                <p className="text-sm text-text-secondary text-center py-3">
                  No internal notes yet.
                </p>
              )}
              {dispute.internalNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl bg-warning/5 border border-warning/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">
                      {note.adminUsername}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {formatDateTime(note.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary">{note.content}</p>
                </div>
              ))}

              {/* Add note form */}
              <form onSubmit={handleSubmitNote} className="mt-2">
                <div className={cn("rounded-xl", NEUMORPHIC_INSET)}>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a private internal note (not visible to users)..."
                    rows={3}
                    className={cn(
                      "w-full p-4 bg-transparent resize-none",
                      "text-text-primary placeholder:text-text-secondary/60",
                      "outline-none text-sm"
                    )}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNote.trim()}
                    className={cn(
                      "px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2",
                      "bg-warning text-white",
                      "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                      "hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    )}
                  >
                    {isSubmittingNote ? (
                      <>
                        <LoadingSpinner size="sm" className="text-white" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Icon path={ICON_PATHS.lock} size="sm" />
                        Add Note
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">
          {/* Quick info */}
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Info</h2>
            <div className="space-y-3">
              <InfoRow label="Status">
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    statusCfg.color,
                    statusCfg.bg
                  )}
                >
                  {statusCfg.label}
                </span>
              </InfoRow>
              <InfoRow label="Priority">
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    priorityCfg.color,
                    priorityCfg.bg
                  )}
                >
                  {priorityCfg.label}
                </span>
              </InfoRow>
              <InfoRow label="Amount">
                <span className="text-sm font-semibold text-text-primary">
                  ${dispute.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </InfoRow>
              <InfoRow label="Opened">
                <span className="text-sm text-text-primary">{formatDate(dispute.createdAt)}</span>
              </InfoRow>
              <InfoRow label="Last Updated">
                <span className="text-sm text-text-primary">{formatDate(dispute.updatedAt)}</span>
              </InfoRow>
              <InfoRow label="Age">
                <span
                  className={cn(
                    "text-sm font-medium",
                    ageDays >= 7 ? "text-error" : ageDays >= 3 ? "text-warning" : "text-text-primary"
                  )}
                >
                  {ageDays} day{ageDays !== 1 ? "s" : ""}
                </span>
              </InfoRow>
              <InfoRow label="Evidence">
                <span className="text-sm text-text-primary">{dispute.evidence.length} files</span>
              </InfoRow>
              <InfoRow label="Comments">
                <span className="text-sm text-text-primary">{dispute.comments.length}</span>
              </InfoRow>
              {dispute.resolvedAt && (
                <InfoRow label="Resolution Time">
                  <span className="text-sm font-medium text-success">
                    {formatResolutionTime(dispute.createdAt, dispute.resolvedAt)}
                  </span>
                </InfoRow>
              )}
              {dispute.resolutionOutcome && (
                <InfoRow label="Outcome">
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      ADMIN_DISPUTE_OUTCOME_CONFIG[dispute.resolutionOutcome].color
                    )}
                  >
                    {ADMIN_DISPUTE_OUTCOME_CONFIG[dispute.resolutionOutcome].label}
                  </span>
                </InfoRow>
              )}

              {/* Action buttons */}
              {isResolvable && (
                <div className="pt-3 border-t border-border-light space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(true)}
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2",
                      "bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                      "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                      "text-primary transition-all duration-200"
                    )}
                  >
                    <Icon path={ICON_PATHS.refresh} size="sm" />
                    Change Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResolveModal(true)}
                    className={cn(FILLED_PRIMARY_BUTTON, "w-full justify-center")}
                  >
                    <Icon path={ICON_PATHS.check} size="sm" />
                    Resolve Dispute
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Parties */}
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Parties</h2>
            <div className="space-y-3">
              <PartyCard role="Buyer" party={dispute.buyer} />
              <PartyCard role="Seller" party={dispute.seller} />
            </div>
          </div>

          {/* Timeline */}
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Timeline</h2>
            <DisputeTimeline events={dispute.events} />
          </div>
        </div>
      </div>

      {/* Resolve modal */}
      <Modal
        isOpen={showResolveModal}
        title="Resolve Dispute"
        onClose={() => setShowResolveModal(false)}
      >
        <DisputeResolutionForm
          dispute={dispute}
          onSubmit={handleResolve}
          onCancel={() => setShowResolveModal(false)}
        />
      </Modal>

      {/* Status change modal */}
      <Modal
        isOpen={showStatusModal}
        title="Change Dispute Status"
        onClose={() => setShowStatusModal(false)}
      >
        <StatusChangeForm
          dispute={dispute}
          onSubmit={handleStatusChange}
          onCancel={() => setShowStatusModal(false)}
        />
      </Modal>
    </div>
  );
}

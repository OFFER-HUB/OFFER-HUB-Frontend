"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useModeStore } from "@/stores/mode-store";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INSET,
  ICON_BUTTON,
  PRIMARY_BUTTON,
} from "@/lib/styles";
import { getFreelancerDisputeById } from "@/data/dispute.data";
import {
  DISPUTE_REASON_LABELS,
  DISPUTE_STATUS_LABELS,
} from "@/types/dispute.types";
import type { Dispute, DisputeStatus, DisputeComment } from "@/types/dispute.types";

const STATUS_COLORS: Record<DisputeStatus, string> = {
  open: "bg-warning/20 text-warning",
  under_review: "bg-primary/20 text-primary",
  resolved: "bg-success/20 text-success",
  closed: "bg-text-secondary/20 text-text-secondary",
};

const EVENT_ICONS: Record<string, string> = {
  created: ICON_PATHS.plus,
  evidence_added: ICON_PATHS.file,
  status_changed: ICON_PATHS.flag,
  comment_added: ICON_PATHS.chat,
  resolved: ICON_PATHS.check,
};

const COMMENT_ROLE_COLORS: Record<DisputeComment["authorRole"], string> = {
  client: "bg-secondary/10 border-secondary/20",
  freelancer: "bg-primary/10 border-primary/20",
  admin: "bg-warning/10 border-warning/20",
};

const COMMENT_ROLE_LABELS: Record<DisputeComment["authorRole"], string> = {
  client: "Client",
  freelancer: "Freelancer",
  admin: "Support",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
}

function InfoRow({ label, children }: InfoRowProps): React.JSX.Element {
  return (
    <div className="flex justify-between">
      <span className="text-text-secondary text-sm">{label}</span>
      {children}
    </div>
  );
}

export default function FreelancerDisputeDetailPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { setMode } = useModeStore();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const disputeId = params.id as string;

  useEffect(() => {
    setMode("freelancer");
    const foundDispute = getFreelancerDisputeById(disputeId);
    if (foundDispute) {
      setDispute(foundDispute);
    }
  }, [setMode, disputeId]);

  async function handleSubmitComment(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!newComment.trim() || !dispute) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const comment: DisputeComment = {
      id: `comment-${Date.now()}`,
      content: newComment.trim(),
      author: "You",
      authorRole: "freelancer",
      timestamp: new Date().toISOString(),
    };

    setDispute((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: [...prev.comments, comment],
      };
    });

    setNewComment("");
    setIsSubmitting(false);
  }

  if (!dispute) {
    return (
      <div className="page-full-height flex items-center justify-center">
        <div className={cn(NEUMORPHIC_CARD, "text-center max-w-md")}>
          <div
            className={cn(
              "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center",
              "bg-background",
              "shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
            )}
          >
            <Icon path={ICON_PATHS.flag} size="xl" className="text-text-secondary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Dispute not found
          </h2>
          <p className="text-text-secondary mb-4">
            The dispute you are looking for does not exist or has been removed.
          </p>
          <button
            type="button"
            onClick={() => router.push("/app/freelancer/disputes")}
            className={cn(PRIMARY_BUTTON, "text-sm")}
          >
            Back to Disputes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-full-height flex flex-col">
      <div className="flex items-center gap-4 mb-4 flex-shrink-0">
        <Link href="/app/freelancer/disputes" className={ICON_BUTTON}>
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary truncate">
              {dispute.offerTitle}
            </h1>
            <span
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium flex-shrink-0",
                STATUS_COLORS[dispute.status]
              )}
            >
              {DISPUTE_STATUS_LABELS[dispute.status]}
            </span>
          </div>
          <p className="text-text-secondary mt-1">
            Dispute #{dispute.id} • Opened {formatDate(dispute.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <div className={NEUMORPHIC_CARD}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Dispute Details
              </h2>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-text-secondary text-sm mb-1">Reason</p>
                    <p className="text-text-primary font-medium">
                      {DISPUTE_REASON_LABELS[dispute.reason]}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-text-secondary text-sm mb-1">Client</p>
                    <p className="text-text-primary font-medium">
                      {dispute.clientName || "Unknown"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-1">Description</p>
                  <p className="text-text-primary">{dispute.description}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-1">Related Service</p>
                  <Link
                    href={`/app/freelancer/services/${dispute.offerId}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Icon path={ICON_PATHS.briefcase} size="sm" />
                    View Service Details
                  </Link>
                </div>
              </div>

              {dispute.resolution && (
                <div className={cn("mt-4 p-4 rounded-xl", NEUMORPHIC_INSET)}>
                  <p className="text-sm font-medium text-success mb-2">Resolution</p>
                  <p className="text-text-primary">{dispute.resolution}</p>
                </div>
              )}
            </div>

            {dispute.evidence.length > 0 && (
              <div className={NEUMORPHIC_CARD}>
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Evidence ({dispute.evidence.length})
                </h2>
                <div className="space-y-2">
                  {dispute.evidence.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          path={file.type.startsWith("image/") ? ICON_PATHS.image : ICON_PATHS.file}
                          size="md"
                          className="text-text-secondary flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-text-primary text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-text-secondary text-xs">
                            Uploaded {formatDate(file.uploadedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={NEUMORPHIC_CARD}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Comments ({dispute.comments.length})
              </h2>
              <div className="space-y-4">
                {dispute.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={cn(
                      "p-4 rounded-xl border",
                      COMMENT_ROLE_COLORS[comment.authorRole]
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">
                          {comment.author}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-background text-text-secondary">
                          {COMMENT_ROLE_LABELS[comment.authorRole]}
                        </span>
                      </div>
                      <span className="text-text-secondary text-sm">
                        {formatDateTime(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-text-primary">{comment.content}</p>
                  </div>
                ))}

                {(dispute.status === "open" || dispute.status === "under_review") && (
                  <form onSubmit={handleSubmitComment} className="mt-4">
                    <div className={cn("rounded-xl", NEUMORPHIC_INSET)}>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                        className={cn(
                          "w-full p-4 bg-transparent resize-none",
                          "text-text-primary placeholder:text-text-secondary/60",
                          "outline-none"
                        )}
                      />
                    </div>
                    <div className="flex justify-end mt-3">
                      <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className={cn(
                          PRIMARY_BUTTON,
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {isSubmitting ? "Sending..." : "Send Comment"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={NEUMORPHIC_CARD}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Timeline
              </h2>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-4">
                  {dispute.events.map((event, index) => (
                    <div key={event.id} className="relative flex gap-4">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center z-10",
                          "bg-white",
                          "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                          index === 0 ? "ring-2 ring-primary" : ""
                        )}
                      >
                        <Icon
                          path={EVENT_ICONS[event.type] ?? ICON_PATHS.clock}
                          size="sm"
                          className={index === 0 ? "text-primary" : "text-text-secondary"}
                        />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-text-primary text-sm font-medium">
                          {event.description}
                        </p>
                        <p className="text-text-secondary text-xs mt-1">
                          {formatDateTime(event.timestamp)}
                        </p>
                        <p className="text-text-secondary text-xs">
                          by {event.actor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={NEUMORPHIC_CARD}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Quick Info
              </h2>
              <div className="space-y-3">
                <InfoRow label="Status">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      STATUS_COLORS[dispute.status]
                    )}
                  >
                    {DISPUTE_STATUS_LABELS[dispute.status]}
                  </span>
                </InfoRow>
                <InfoRow label="Created">
                  <span className="text-text-primary text-sm">
                    {formatDate(dispute.createdAt)}
                  </span>
                </InfoRow>
                <InfoRow label="Last Updated">
                  <span className="text-text-primary text-sm">
                    {formatDate(dispute.updatedAt)}
                  </span>
                </InfoRow>
                <InfoRow label="Evidence Files">
                  <span className="text-text-primary text-sm">
                    {dispute.evidence.length}
                  </span>
                </InfoRow>
                <InfoRow label="Comments">
                  <span className="text-text-primary text-sm">
                    {dispute.comments.length}
                  </span>
                </InfoRow>
              </div>
            </div>

            {(dispute.status === "open" || dispute.status === "under_review") && (
              <div className={NEUMORPHIC_CARD}>
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Actions
                </h2>
                <div className="space-y-3">
                  <Link
                    href={`/app/chat?dispute=${dispute.id}`}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-3 rounded-xl",
                      "bg-background text-text-primary",
                      "hover:bg-gray-100 transition-colors cursor-pointer"
                    )}
                  >
                    <Icon path={ICON_PATHS.chat} size="md" />
                    <span className="font-medium">Contact Support</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

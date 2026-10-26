"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";

export interface DisputeEvidenceListProps {
  /** Raw URL strings stored on the dispute — may be null when none were attached. */
  evidence: string[] | null;
}

/**
 * Evidence & Documentation section for the admin dispute detail page.
 * Renders a card with a list of evidence URLs, or an empty-state placeholder
 * when no evidence was submitted.
 */
export function DisputeEvidenceList({ evidence }: DisputeEvidenceListProps) {
  const hasEvidence = Array.isArray(evidence) && evidence.length > 0;

  return (
    <section className={cn(NEUMORPHIC_CARD, "p-6 sm:p-7 space-y-4")}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Dispute Evidence</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Uploaded documentation and proofs submitted with this claim
          </p>
        </div>
        {hasEvidence && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {evidence!.length} {evidence!.length === 1 ? "file" : "files"}
          </span>
        )}
      </div>

      {!hasEvidence ? (
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
          {evidence!.map((url, idx) => (
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
  );
}

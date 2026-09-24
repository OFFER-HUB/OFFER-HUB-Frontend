"use client";

import { LoadingSpinner } from "@/components/ui/Icon";
import type { Skill } from "@/lib/api/skills-api";

const NEU_RAISED = "6px 6px 12px #0a0f1a, -6px -6px 12px #1e2a4a";

export interface DeleteSkillModalProps {
  skill: Skill;
  onConfirm: () => void;
  onClose: () => void;
  deleting: boolean;
}

export function DeleteSkillModal({
  skill,
  onConfirm,
  onClose,
  deleting,
}: DeleteSkillModalProps): React.JSX.Element {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 z-10"
        style={{ backgroundColor: "#002333", boxShadow: NEU_RAISED }}
      >
        <h2 id="delete-modal-title" className="text-base font-bold text-white mb-2">
          Remove skill?
        </h2>
        <p className="text-sm mb-6" style={{ color: "#6D758F" }}>
          Are you sure you want to remove{" "}
          <span className="font-semibold" style={{ color: "#B4B9C9" }}>
            {skill.name}
          </span>{" "}
          from your profile?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-70"
            style={{
              backgroundColor: "#DEEFE710",
              color: "#B4B9C9",
              boxShadow: NEU_RAISED,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
            style={{
              backgroundColor: "#FF000022",
              border: "1.5px solid #FF000044",
              color: "#FF0000",
            }}
          >
            {deleting ? <LoadingSpinner size="sm" /> : null}
            {deleting ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

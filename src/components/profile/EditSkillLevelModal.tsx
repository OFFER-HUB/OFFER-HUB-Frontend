"use client";

import { useState } from "react";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { LEVEL_STYLES } from "./SkillTag";
import type { Skill, SkillLevel } from "@/lib/api/skills-api";

const SKILL_LEVELS: SkillLevel[] = ["Beginner", "Intermediate", "Expert"];

const NEU_RAISED = "6px 6px 12px #0a0f1a, -6px -6px 12px #1e2a4a";
const NEU_INSET = "inset 4px 4px 8px #0a0f1a, inset -4px -4px 8px #1e2a4a";

export interface EditSkillLevelModalProps {
  skill: Skill;
  onSave: (level: SkillLevel) => void;
  onClose: () => void;
  saving: boolean;
}

export function EditSkillLevelModal({
  skill,
  onSave,
  onClose,
  saving,
}: EditSkillLevelModalProps): React.JSX.Element {
  const [selected, setSelected] = useState<SkillLevel>(skill.level);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 z-10"
        style={{ backgroundColor: "#002333", boxShadow: NEU_RAISED }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="edit-modal-title" className="text-base font-bold text-white">
            Edit&nbsp;
            <span style={{ color: "#149A9B" }}>{skill.name}</span>
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-1.5 transition-opacity hover:opacity-70"
            style={{ color: "#6D758F" }}
          >
            <Icon path={ICON_PATHS.x} size="sm" />
          </button>
        </div>

        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "#6D758F" }}
        >
          Proficiency Level
        </p>

        <div className="flex flex-col gap-2 mb-6">
          {SKILL_LEVELS.map((level) => {
            const style = LEVEL_STYLES[level as keyof typeof LEVEL_STYLES];
            const isSelected = selected === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setSelected(level)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-left transition-all duration-200"
                style={{
                  backgroundColor: isSelected ? style.bg : "transparent",
                  border: `1.5px solid ${isSelected ? style.border : "#B4B9C922"}`,
                  color: isSelected ? style.text : "#B4B9C9",
                  boxShadow: isSelected ? NEU_INSET : "none",
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-colors"
                  style={{ backgroundColor: isSelected ? style.text : "#B4B9C940" }}
                />
                {level}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => onSave(selected)}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
          style={{
            background: "linear-gradient(to right, #002333, #15949C)",
            boxShadow: NEU_RAISED,
          }}
        >
          {saving ? <LoadingSpinner size="sm" /> : null}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

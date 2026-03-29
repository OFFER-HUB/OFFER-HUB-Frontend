"use client";

import { X, Pencil, GripVertical } from "lucide-react";
import type { Skill, SkillLevel } from "@/lib/api/skills-api";

/* ── Level colour map (teal-anchored, using OFFER-HUB palette) ── */

export const LEVEL_STYLES: Record<
  SkillLevel,
  { bg: string; border: string; text: string; label: string }
> = {
  Beginner: {
    bg: "#149A9B18",
    border: "#149A9B44",
    text: "#149A9B",
    label: "Beginner",
  },
  Intermediate: {
    bg: "#d9770618",
    border: "#d9770644",
    text: "#d97706",
    label: "Intermediate",
  },
  Expert: {
    bg: "#16a34a18",
    border: "#16a34a44",
    text: "#16a34a",
    label: "Expert",
  },
};

interface SkillTagProps {
  skill: Skill;
  /** Show drag handle — false in read-only contexts */
  draggable?: boolean;
  onEdit?: (skill: Skill) => void;
  onDelete?: (skill: Skill) => void;
  /** Drag-and-drop event handlers forwarded from parent */
  dragHandleProps?: React.HTMLAttributes<HTMLSpanElement>;
}

export function SkillTag({
  skill,
  draggable = true,
  onEdit,
  onDelete,
  dragHandleProps,
}: SkillTagProps) {
  const style = LEVEL_STYLES[skill.level];

  return (
    <div
      role="listitem"
      className="group inline-flex items-center gap-2 rounded-full pl-2 pr-2.5 py-1.5 text-sm font-semibold select-none transition-all duration-200"
      style={{
        backgroundColor: style.bg,
        border: `1.5px solid ${style.border}`,
        color: style.text,
      }}
    >
      {/* Drag handle */}
      {draggable && (
        <span
          aria-label="Drag to reorder"
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-60 transition-opacity duration-150 flex-shrink-0"
          {...dragHandleProps}
        >
          <GripVertical size={13} />
        </span>
      )}

      {/* Skill name */}
      <span className="leading-none">{skill.name}</span>

      {/* Level dot */}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: style.text }}
        aria-label={skill.level}
        title={skill.level}
      />

      {/* Edit button */}
      {onEdit && (
        <button
          type="button"
          aria-label={`Edit ${skill.name}`}
          onClick={() => onEdit(skill)}
          className="opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity duration-150 rounded-full p-0.5 flex-shrink-0"
          style={{ color: style.text }}
        >
          <Pencil size={11} />
        </button>
      )}

      {/* Delete button */}
      {onDelete && (
        <button
          type="button"
          aria-label={`Remove ${skill.name}`}
          onClick={() => onDelete(skill)}
          className="opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity duration-150 rounded-full p-0.5 flex-shrink-0"
          style={{ color: style.text }}
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}
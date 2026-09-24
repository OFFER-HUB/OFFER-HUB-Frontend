"use client";

import { useState, useId } from "react";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { SkillTag, LEVEL_STYLES } from "./SkillTag";
import type { Skill, SkillLevel } from "@/lib/api/skills-api";
import { useSkillsManager, MAX_SKILLS } from "@/hooks/useSkillsManager";
import { EditSkillLevelModal } from "./EditSkillLevelModal";
import { DeleteSkillModal } from "./DeleteSkillModal";
import { SkillAutocomplete } from "./SkillAutocomplete";

const SKILL_LEVELS: SkillLevel[] = ["Beginner", "Intermediate", "Expert"];

const POPULAR_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Rust",
  "Go",
  "Solidity",
  "Stellar SDK",
  "GraphQL",
  "PostgreSQL",
  "Docker",
  "Figma",
  "UI/UX Design",
  "Smart Contracts",
  "Web3",
  "Tailwind CSS",
  "AWS",
  "Soroban",
];

const NEU_RAISED = "6px 6px 12px #0a0f1a, -6px -6px 12px #1e2a4a";
const NEU_INSET = "inset 4px 4px 8px #0a0f1a, inset -4px -4px 8px #1e2a4a";

export function SkillsInput() {
  const {
    skills,
    loadState,
    loadError,
    adding,
    addError,
    setAddError,
    modalSaving,
    toast,
    atLimit,
    handleAdd,
    handleEditSave,
    handleDeleteConfirm,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
  } = useSkillsManager();

  const [inputValue, setInputValue] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>("Intermediate");

  const [editTarget, setEditTarget] = useState<Skill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);

  const inputId = useId();

  const handleAddSubmit = async (nameOverride?: string) => {
    const name = nameOverride ?? inputValue;
    const success = await handleAdd(name, selectedLevel);
    if (success) {
      setInputValue("");
    }
  };

  const handleEditModalSave = async (level: SkillLevel) => {
    if (!editTarget) return;
    const success = await handleEditSave(editTarget, level);
    if (success) {
      setEditTarget(null);
    }
  };

  const handleDeleteModalConfirm = async () => {
    if (!deleteTarget) return;
    const success = await handleDeleteConfirm(deleteTarget);
    if (success) {
      setDeleteTarget(null);
    }
  };

  if (loadState === "loading") {
    return (
      <div
        className="rounded-2xl p-8 flex items-center justify-center gap-3"
        style={{ backgroundColor: "#002333", boxShadow: NEU_RAISED }}
      >
        <LoadingSpinner size="sm" className="text-[#149A9B]" />
        <span className="text-sm font-semibold" style={{ color: "#6D758F" }}>
          Loading skills…
        </span>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div
        className="rounded-2xl p-8 flex flex-col items-center gap-3 text-center"
        style={{ backgroundColor: "#002333", boxShadow: NEU_RAISED }}
      >
        <Icon path={ICON_PATHS.alertCircle} size="lg" className="text-red-500" />
        <p className="text-sm font-semibold" style={{ color: "#B4B9C9" }}>
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-xs font-bold underline"
          style={{ color: "#149A9B" }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className="rounded-2xl p-6 md:p-8 flex flex-col gap-6"
        style={{ backgroundColor: "#002333", boxShadow: NEU_RAISED }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Skills</h2>
            <p className="text-xs mt-0.5" style={{ color: "#6D758F" }}>
              Add up to {MAX_SKILLS} skills. Drag to reorder.
            </p>
          </div>

          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{
              backgroundColor: atLimit ? "#FF000018" : "#149A9B18",
              border: `1.5px solid ${atLimit ? "#FF000044" : "#149A9B44"}`,
              color: atLimit ? "#FF0000" : "#149A9B",
            }}
          >
            {skills.length} / {MAX_SKILLS}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <SkillAutocomplete
            inputId={inputId}
            value={inputValue}
            onChange={(v) => {
              setInputValue(v);
              if (addError) setAddError(null);
            }}
            onSelect={(name) => {
              setInputValue(name);
              setAddError(null);
            }}
            existingSkillIds={skills.map((s) => s.name)}
            disabled={adding || atLimit}
          />

          <div className="flex gap-1.5 shrink-0">
            {SKILL_LEVELS.map((level) => {
              const s = LEVEL_STYLES[level as keyof typeof LEVEL_STYLES];
              const isActive = selectedLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedLevel(level)}
                  className="px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? s.bg : "transparent",
                    border: `1.5px solid ${isActive ? s.border : "#B4B9C922"}`,
                    color: isActive ? s.text : "#6D758F",
                    boxShadow: isActive ? NEU_INSET : "none",
                  }}
                >
                  {level}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={adding || atLimit || !inputValue.trim()}
            onClick={() => handleAddSubmit()}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(to right, #002333, #15949C)",
              boxShadow: NEU_RAISED,
            }}
          >
            {adding ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Icon path={ICON_PATHS.plus} size="sm" />
            )}
            Add
          </button>
        </div>

        {addError && (
          <p
            role="alert"
            className="flex items-center gap-1.5 text-xs -mt-2"
            style={{ color: "#FF0000" }}
          >
            <Icon path={ICON_PATHS.alertCircle} size="sm" />
            {addError}
          </p>
        )}

        {skills.length === 0 && (
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "#6D758F" }}
            >
              Popular skills
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SKILLS.slice(0, 10).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleAddSubmit(name)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 hover:opacity-80"
                  style={{
                    backgroundColor: "#149A9B15",
                    border: "1.5px solid #149A9B33",
                    color: "#149A9B",
                  }}
                >
                  + {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#6D758F" }}
            >
              Your skills ({skills.length})
            </p>
            <div
              role="list"
              aria-label="Your skills"
              className="flex flex-wrap gap-2"
            >
              {skills.map((skill, index) => (
                <div
                  key={skill.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <SkillTag
                    skill={skill}
                    draggable
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="flex flex-wrap gap-4 pt-2 border-t"
          style={{ borderColor: "#B4B9C915" }}
        >
          {SKILL_LEVELS.map((level) => {
            const s = LEVEL_STYLES[level as keyof typeof LEVEL_STYLES];
            return (
              <div key={level} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.text }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "#6D758F" }}
                >
                  {level}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {editTarget && (
        <EditSkillLevelModal
          skill={editTarget}
          onSave={handleEditModalSave}
          onClose={() => setEditTarget(null)}
          saving={modalSaving}
        />
      )}

      {deleteTarget && (
        <DeleteSkillModal
          skill={deleteTarget}
          onConfirm={handleDeleteModalConfirm}
          onClose={() => setDeleteTarget(null)}
          deleting={modalSaving}
        />
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg"
          style={{
            backgroundColor: "#002333",
            boxShadow: NEU_RAISED,
            border: `1.5px solid ${toast.type === "success" ? "#16a34a44" : "#FF000044"}`,
            color: toast.type === "success" ? "#16a34a" : "#FF0000",
          }}
        >
          {toast.type === "success" ? (
            <Icon path={ICON_PATHS.check} size="sm" />
          ) : (
            <Icon path={ICON_PATHS.alertCircle} size="sm" />
          )}
          {toast.msg}
        </div>
      )}
    </>
  );
}
"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
} from "react";
import {
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
} from "lucide-react";
import { SkillTag, LEVEL_STYLES } from "./SkillTag";

import {
  fetchSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  reorderSkills,
  type Skill,
  type SkillLevel,
} from "@/lib/api/skills-api";

/* ── Constants ── */

const MAX_SKILLS = 20;

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

/* ── Shared card shadow ── */

const NEU_RAISED = "6px 6px 12px #0a0f1a, -6px -6px 12px #1e2a4a";
const NEU_INSET = "inset 4px 4px 8px #0a0f1a, inset -4px -4px 8px #1e2a4a";

/* ── Edit Modal ── */

function EditLevelModal({
  skill,
  onSave,
  onClose,
  saving,
}: {
  skill: Skill;
  onSave: (level: SkillLevel) => void;
  onClose: () => void;
  saving: boolean;
}) {
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
          <h2
            id="edit-modal-title"
            className="text-base font-bold text-white"
          >
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
            <X size={16} />
          </button>
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#6D758F" }}>
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
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors"
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
          {saving ? <Loader2 size={15} className="animate-spin" /> : null}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

/* ── Delete Confirmation Modal ── */

function DeleteConfirmModal({
  skill,
  onConfirm,
  onClose,
  deleting,
}: {
  skill: Skill;
  onConfirm: () => void;
  onClose: () => void;
  deleting: boolean;
}) {
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
            style={{ backgroundColor: "#FF000022", border: "1.5px solid #FF000044", color: "#FF0000" }}
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
            {deleting ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Autocomplete Input ── */

function SkillAutocomplete({
  value,
  onChange,
  onSelect,
  existingNames,
  disabled,
  inputId,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (name: string) => void;
  existingNames: Set<string>;
  disabled: boolean;
  inputId: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const suggestions = POPULAR_SKILLS.filter(
    (s) =>
      s.toLowerCase().includes(value.toLowerCase()) &&
      value.length > 0 &&
      !existingNames.has(s.toLowerCase())
  ).slice(0, 6);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-0">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
        <Search size={15} color="#6D758F" />
      </span>
      <input
        id={inputId}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder="e.g. React, Solidity, Figma…"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `${NEU_INSET}, 0 0 0 1.5px #149A9B`;
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-[#6D758F] outline-none transition-all duration-200 disabled:opacity-50"
        style={{
          backgroundColor: "#DEEFE710",
          boxShadow: NEU_INSET,
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = NEU_INSET;
        }}
      />

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Skill suggestions"
          className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-20"
          style={{ backgroundColor: "#002333", boxShadow: NEU_RAISED, border: "1px solid #B4B9C915" }}
        >
          {suggestions.map((s) => (
            <li key={s} role="option" aria-selected={false}>
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-white/5"
                style={{ color: "#B4B9C9" }}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent input blur before click
                  onSelect(s);
                  setOpen(false);
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── SkillsManager ── */

export function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  // Add form
  const [inputValue, setInputValue] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>("Intermediate");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Modals
  const [editTarget, setEditTarget] = useState<Skill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [modalSaving, setModalSaving] = useState(false);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const inputId = useId();

  const showToast = useCallback(
    (type: "success" | "error", msg: string) => {
      setToast({ type, msg });
      setTimeout(() => setToast(null), 3500);
    },
    []
  );

  /* ── Load on mount ── */
  useEffect(() => {
    fetchSkills()
      .then((data: unknown[]) => {
        setSkills((data as Skill[]).sort((a, b) => a.order - b.order)); 
        setLoadState("ready");
      })
      .catch((err: { message: unknown; }) => {
        setLoadError(typeof err.message === "string" ? err.message : "Failed to load skills.");
        setLoadState("error");
      });
  }, []);

  const existingNames = new Set(skills.map((s) => s.name.toLowerCase()));
  const atLimit = skills.length >= MAX_SKILLS;

  /* ── Add skill ── */
  const handleAdd = async (nameOverride?: string) => {
    const name = (nameOverride ?? inputValue).trim();
    if (!name) {
      setAddError("Please enter a skill name.");
      return;
    }
    if (existingNames.has(name.toLowerCase())) {
      setAddError(`"${name}" is already in your skills list.`);
      return;
    }
    if (atLimit) {
      setAddError(`You can add a maximum of ${MAX_SKILLS} skills.`);
      return;
    }

    setAdding(true);
    setAddError(null);
    try {
      const newSkill = await addSkill({
        name,
        level: selectedLevel,
        order: skills.length,
      });
      setSkills((prev) => [...prev, newSkill]);
      setInputValue("");
      showToast("success", `"${name}" added.`);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? "Failed to add skill.";
      setAddError(msg);
    } finally {
      setAdding(false);
    }
  };

  /* ── Edit level ── */
  const handleEditSave = async (level: SkillLevel) => {
    if (!editTarget) return;
    setModalSaving(true);
    try {
      const updated = await updateSkill(editTarget.id, { level });
      setSkills((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      showToast("success", `"${editTarget.name}" updated to ${level}.`);
      setEditTarget(null);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? "Failed to update skill.";
      showToast("error", msg);
    } finally {
      setModalSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setModalSaving(true);
    try {
      await deleteSkill(deleteTarget.id);
      setSkills((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      showToast("success", `"${deleteTarget.name}" removed.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? "Failed to remove skill.";
      showToast("error", msg);
    } finally {
      setModalSaving(false);
    }
  };

  /* ── Drag & drop ── */
  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverIndex.current = index;
    if (dragIndex.current === null || dragIndex.current === index) return;

    setSkills((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex.current!, 1);
      next.splice(index, 0, moved);
      dragIndex.current = index;
      return next;
    });
  };

  const handleDragEnd = async () => {
    dragIndex.current = null;
    dragOverIndex.current = null;
    try {
      await reorderSkills(skills.map((s) => s.id));
    } catch {
      showToast("error", "Failed to save new order.");
    }
  };

  /* ── Render ── */

  if (loadState === "loading") {
    return (
      <div
        className="rounded-2xl p-8 flex items-center justify-center gap-3"
        style={{ backgroundColor: "#002333", boxShadow: NEU_RAISED }}
      >
        <Loader2 size={20} className="animate-spin" style={{ color: "#149A9B" }} />
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
        <AlertCircle size={28} color="#FF0000" />
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
      {/* ── Main card ── */}
      <div
        className="rounded-2xl p-6 md:p-8 flex flex-col gap-6"
        style={{ backgroundColor: "#002333", boxShadow: NEU_RAISED }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Skills</h2>
            <p className="text-xs mt-0.5" style={{ color: "#6D758F" }}>
              Add up to {MAX_SKILLS} skills. Drag to reorder.
            </p>
          </div>

          {/* Limit indicator */}
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

        {/* Add skill row */}
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
            existingNames={existingNames}
            disabled={adding || atLimit}
          />

          {/* Level selector */}
          <div className="flex gap-1.5 flex-shrink-0">
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

          {/* Add button */}
          <button
            type="button"
            disabled={adding || atLimit || !inputValue.trim()}
            onClick={() => handleAdd()}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(to right, #002333, #15949C)",
              boxShadow: NEU_RAISED,
            }}
          >
            {adding ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            Add
          </button>
        </div>

        {/* Add error */}
        {addError && (
          <p
            role="alert"
            className="flex items-center gap-1.5 text-xs -mt-2"
            style={{ color: "#FF0000" }}
          >
            <AlertCircle size={12} />
            {addError}
          </p>
        )}

        {/* Popular suggestions */}
        {skills.length === 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6D758F" }}>
              Popular skills
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SKILLS.slice(0, 10).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleAdd(name)}
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

        {/* Skills list */}
        {skills.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6D758F" }}>
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

        {/* Level legend */}
        <div className="flex flex-wrap gap-4 pt-2 border-t" style={{ borderColor: "#B4B9C915" }}>
          {SKILL_LEVELS.map((level) => {
            const s = LEVEL_STYLES[level as keyof typeof LEVEL_STYLES];
            return (
              <div key={level} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.text }} />
                <span className="text-xs font-medium" style={{ color: "#6D758F" }}>
                  {level}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modals ── */}
      {editTarget && (
        <EditLevelModal
          skill={editTarget}
          onSave={handleEditSave}
          onClose={() => setEditTarget(null)}
          saving={modalSaving}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          skill={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
          deleting={modalSaving}
        />
      )}

      {/* ── Toast ── */}
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
            <CheckCircle2 size={15} />
          ) : (
            <AlertCircle size={15} />
          )}
          {toast.msg}
        </div>
      )}
    </>
  );
}
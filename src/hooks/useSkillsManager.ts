"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  fetchSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  reorderSkills,
  type Skill,
  type SkillLevel,
} from "@/lib/api/skills-api";
import { useAuthStore } from "@/stores/auth-store";

export const MAX_SKILLS = 15;

export function useSkillsManager() {
  const { token } = useAuthStore();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  // Add state
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Modal / save state
  const [modalSaving, setModalSaving] = useState(false);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = useCallback((type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }, []);

  /* ── Load on mount ── */
  useEffect(() => {
    if (!token) return;
    fetchSkills(token)
      .then((data: unknown[]) => {
        setSkills((data as Skill[]).sort((a, b) => a.order - b.order));
        setLoadState("ready");
      })
      .catch((err: { message: unknown }) => {
        setLoadError(typeof err.message === "string" ? err.message : "Failed to load skills.");
        setLoadState("error");
      });
  }, [token]);

  const existingNames = useMemo(
    () => new Set(skills.map((s) => s.name.toLowerCase())),
    [skills]
  );
  const atLimit = skills.length >= MAX_SKILLS;

  /* ── Add skill ── */
  const handleAdd = async (name: string, selectedLevel: SkillLevel) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setAddError("Please enter a skill name.");
      return false;
    }
    if (existingNames.has(trimmedName.toLowerCase())) {
      setAddError(`"${trimmedName}" is already in your skills list.`);
      return false;
    }
    if (atLimit) {
      setAddError(`You can add a maximum of ${MAX_SKILLS} skills.`);
      return false;
    }

    setAdding(true);
    setAddError(null);
    try {
      const newSkill = await addSkill(token ?? "", {
        name: trimmedName,
        level: selectedLevel,
        order: skills.length,
      });
      setSkills((prev) => [...prev, newSkill]);
      showToast("success", `"${trimmedName}" added.`);
      return true;
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? "Failed to add skill.";
      setAddError(msg);
      return false;
    } finally {
      setAdding(false);
    }
  };

  /* ── Edit level ── */
  const handleEditSave = async (skill: Skill, level: SkillLevel) => {
    setModalSaving(true);
    try {
      const updated = await updateSkill(token ?? "", skill.id, { level });
      setSkills((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      showToast("success", `"${skill.name}" updated to ${level}.`);
      return true;
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? "Failed to update skill.";
      showToast("error", msg);
      return false;
    } finally {
      setModalSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDeleteConfirm = async (skill: Skill) => {
    setModalSaving(true);
    try {
      await deleteSkill(token ?? "", skill.id);
      setSkills((prev) => prev.filter((s) => s.id !== skill.id));
      showToast("success", `"${skill.name}" removed.`);
      return true;
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? "Failed to remove skill.";
      showToast("error", msg);
      return false;
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
      await reorderSkills(token ?? "", skills.map((s) => s.id));
    } catch {
      showToast("error", "Failed to save new order.");
    }
  };

  return {
    skills,
    loadState,
    loadError,
    adding,
    addError,
    setAddError,
    modalSaving,
    toast,
    existingNames,
    atLimit,
    handleAdd,
    handleEditSave,
    handleDeleteConfirm,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
  };
}

"use client";

import { useState, useEffect, useRef, useId } from "react";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

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

export interface SkillAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (name: string) => void;
  existingSkillIds: string[]; // represents names/ids already present on user profile
  disabled: boolean;
  inputId: string;
}

export function SkillAutocomplete({
  value,
  onChange,
  onSelect,
  existingSkillIds,
  disabled,
  inputId,
}: SkillAutocompleteProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Suggest popular skills that match query and are not yet added
  const suggestions = POPULAR_SKILLS.filter(
    (s) =>
      s.toLowerCase().includes(value.toLowerCase()) &&
      value.length > 0 &&
      !existingSkillIds.map((id) => id.toLowerCase()).includes(s.toLowerCase())
  ).slice(0, 6);

  // Close suggestions list on click outside
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
        <Icon path={ICON_PATHS.search} size="sm" />
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
          style={{
            backgroundColor: "#002333",
            boxShadow: NEU_RAISED,
            border: "1px solid #B4B9C915",
          }}
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

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_INPUT } from "@/lib/styles";

export interface TimezoneComboboxProps {
  value: string;
  onChange: (value: string) => void;
  timezones: string[];
  id?: string;
  label?: string;
}

export function TimezoneCombobox({
  value,
  onChange,
  timezones,
  id = "tz-search",
  label = "Work timezone",
}: TimezoneComboboxProps): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return timezones;
    return timezones.filter((z) => z.toLowerCase().includes(q));
  }, [timezones, query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent): void {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="space-y-2 relative" ref={wrapRef}>
      {label && (
        <label className="block text-sm font-medium text-text-primary" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        autoComplete="off"
        value={open ? query : value}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery(value);
          setOpen(true);
        }}
        placeholder="Search timezone…"
        className={NEUMORPHIC_INPUT}
      />
      {open && (
        <ul
          className={cn(
            "absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl py-1",
            "bg-white border border-gray-200 shadow-lg"
          )}
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-text-secondary">No matches</li>
          ) : (
            filtered.map((z) => (
              <li key={z}>
                <button
                  type="button"
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-background",
                    z === value && "bg-primary/10 font-medium"
                  )}
                  onClick={() => {
                    onChange(z);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  {z}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

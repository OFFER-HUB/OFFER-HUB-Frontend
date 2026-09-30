"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_INPUT, INPUT_ERROR_STYLES } from "@/lib/styles";
import { MAX_TAGS, MAX_TAG_LENGTH } from "@/types/portfolio.types";

export interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  error?: string;
}

export function TagInput({ tags, onChange, error }: TagInputProps): React.JSX.Element {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(value: string) {
    const trimmed = value.trim().replace(/,/g, "");
    if (!trimmed || tags.length >= MAX_TAGS || tags.includes(trimmed)) return;
    if (trimmed.length > MAX_TAG_LENGTH) return;
    onChange([...tags, trimmed]);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div>
      <div
        className={cn(
          NEUMORPHIC_INPUT,
          "flex flex-wrap gap-1.5 cursor-text min-h-[46px] h-auto py-2",
          error && INPUT_ERROR_STYLES
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-error transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              <Icon path={ICON_PATHS.close} size="sm" />
            </button>
          </span>
        ))}
        {tags.length < MAX_TAGS && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(input)}
            placeholder={tags.length === 0 ? "Type a tag and press Enter..." : ""}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-text-primary placeholder:text-text-secondary/60"
          />
        )}
      </div>
      <p className="mt-1 text-xs text-text-secondary">
        {tags.length}/{MAX_TAGS} tags · Press Enter or comma to add
      </p>
    </div>
  );
}

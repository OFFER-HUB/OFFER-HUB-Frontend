"use client";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

/**
 * Highlights occurrences of the search query inside text (case-insensitive).
 */
export function HighlightedText({ text, query, className }: HighlightedTextProps): React.JSX.Element {
  const q = query.trim();
  if (!q) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, "gi"));
  const qLower = q.toLowerCase();

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === qLower ? (
          <mark
            key={i}
            className="rounded px-0.5 bg-amber-200/90 text-text-primary dark:bg-amber-500/40"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

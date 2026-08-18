"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import { formatDateTime } from "@/lib/date-formatters";
import type { AdminDisputeNote } from "@/types/admin.types";

export interface InternalNotesPanelProps {
  notes: AdminDisputeNote[];
  onSubmit: (content: string) => Promise<void>;
}

export function InternalNotesPanel({ notes, onSubmit }: InternalNotesPanelProps): React.JSX.Element {
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(newNote.trim());
      setNewNote("");
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      {notes.length === 0 && (
        <p className="text-sm text-text-secondary text-center py-3">No internal notes yet.</p>
      )}
      {notes.map((note) => (
        <div key={note.id} className="p-4 rounded-xl bg-warning/5 border border-warning/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">{note.adminUsername}</span>
            <span className="text-xs text-text-secondary">{formatDateTime(note.createdAt)}</span>
          </div>
          <p className="text-sm text-text-primary">{note.content}</p>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="mt-2">
        <div className={cn("rounded-xl", NEUMORPHIC_INSET)}>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a private internal note (not visible to users)..."
            rows={3}
            className={cn(
              "w-full p-4 bg-transparent resize-none",
              "text-text-primary placeholder:text-text-secondary/60",
              "outline-none text-sm"
            )}
          />
        </div>
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={isSubmitting || !newNote.trim()}
            className={cn(
              "px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2",
              "bg-warning text-white",
              "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            )}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="text-white" />
                Adding...
              </>
            ) : (
              <>
                <Icon path={ICON_PATHS.lock} size="sm" />
                Add Note
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

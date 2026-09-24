"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import {
  DISPUTE_EVIDENCE_ALLOWED_TYPES,
  DISPUTE_EVIDENCE_MAX_FILES,
  DISPUTE_EVIDENCE_MAX_SIZE,
  uploadDisputeEvidence,
} from "@/lib/api/dispute-evidence";
import { EvidenceList } from "@/components/disputes/EvidenceList";
import type { EvidenceUploadItem } from "@/components/disputes/EvidenceItem";

interface EvidenceUploaderProps {
  token: string | null;
  onChange: (items: EvidenceUploadItem[]) => void;
}

export function EvidenceUploader({ token, onChange }: EvidenceUploaderProps): React.JSX.Element {
  const [items, setItems] = useState<EvidenceUploadItem[]>([]);
  const [dropActive, setDropActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function updateItems(updater: (prev: EvidenceUploadItem[]) => EvidenceUploadItem[]): void {
    setItems((prev) => {
      const next = updater(prev);
      onChange(next);
      return next;
    });
  }

  function validateFile(file: File): string | null {
    if (!DISPUTE_EVIDENCE_ALLOWED_TYPES.includes(file.type as (typeof DISPUTE_EVIDENCE_ALLOWED_TYPES)[number])) {
      return "Unsupported file type. Use images, PDF, DOC/DOCX or TXT.";
    }
    if (file.size > DISPUTE_EVIDENCE_MAX_SIZE) {
      return "File exceeds 10MB size limit.";
    }
    return null;
  }

  async function uploadOne(itemId: string): Promise<void> {
    const target = items.find((entry) => entry.localId === itemId);
    if (!target?.file) return;

    updateItems((prev) =>
      prev.map((entry) =>
        entry.localId === itemId
          ? { ...entry, status: "uploading", progress: 0, error: undefined }
          : entry
      )
    );

    try {
      const uploaded = await uploadDisputeEvidence(token, target.file, {
        description: target.description,
        onProgress: (progress) => {
          setItems((prev) =>
            prev.map((entry) =>
              entry.localId === itemId ? { ...entry, progress } : entry
            )
          );
        },
      });

      updateItems((prev) =>
        prev.map((entry) =>
          entry.localId === itemId
            ? {
                ...entry,
                status: "uploaded",
                progress: 100,
                uploadedAt: uploaded.uploadedAt,
                evidence: uploaded,
              }
            : entry
        )
      );
    } catch (uploadError) {
      updateItems((prev) =>
        prev.map((entry) =>
          entry.localId === itemId
            ? {
                ...entry,
                status: "error",
                progress: 0,
                error: uploadError instanceof Error ? uploadError.message : "Upload failed",
              }
            : entry
        )
      );
    }
  }

  function addFiles(fileList: FileList | null): void {
    if (!fileList?.length) return;
    setError(null);

    if (items.length >= DISPUTE_EVIDENCE_MAX_FILES) {
      setError(`Maximum ${DISPUTE_EVIDENCE_MAX_FILES} files allowed.`);
      return;
    }

    const incoming = Array.from(fileList);
    const availableSlots = DISPUTE_EVIDENCE_MAX_FILES - items.length;
    const selected = incoming.slice(0, availableSlots);
    const next: EvidenceUploadItem[] = [];

    for (const file of selected) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(`${file.name}: ${validationError}`);
        continue;
      }

      next.push({
        localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        description: "",
        previewUrl: file.type.startsWith("image/") || file.type === "application/pdf" ? URL.createObjectURL(file) : undefined,
        progress: 0,
        status: "queued",
      });
    }

    if (next.length === 0) return;

    const queuedIds = next.map((entry) => entry.localId);
    updateItems((prev) => [...prev, ...next]);
    queuedIds.forEach((itemId) => {
      void uploadOne(itemId);
    });
  }

  function handleRemove(itemId: string): void {
    updateItems((prev) => {
      const removing = prev.find((item) => item.localId === itemId);
      if (removing?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(removing.previewUrl);
      }
      return prev.filter((item) => item.localId !== itemId);
    });
  }

  function handleRetry(itemId: string): void {
    void uploadOne(itemId);
  }

  function updateDescription(itemId: string, value: string): void {
    updateItems((prev) =>
      prev.map((item) => (item.localId === itemId ? { ...item, description: value } : item))
    );
  }

  return (
    <div className={NEUMORPHIC_CARD}>
      <h2 className="text-lg font-semibold text-text-primary mb-2">Upload Evidence</h2>
      <p className="text-text-secondary text-sm mb-3">
        Helpful evidence includes contracts, delivery screenshots, milestone proof, payment receipts, and key chat excerpts.
      </p>
      <p className="text-text-secondary text-xs mb-4">
        {items.length}/{DISPUTE_EVIDENCE_MAX_FILES} files used • Images, PDF, DOC/DOCX, TXT • 10MB max each
      </p>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDropActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDropActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDropActive(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
          dropActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-primary/5"
        )}
      >
        <Icon path={ICON_PATHS.upload} size="xl" className="text-text-secondary mb-2" />
        <p className="text-sm text-text-primary font-medium text-center">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-text-secondary text-center mt-1">
          You can select multiple files in one upload
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
        accept={DISPUTE_EVIDENCE_ALLOWED_TYPES.join(",")}
        disabled={items.length >= DISPUTE_EVIDENCE_MAX_FILES}
      />

      {error && <p className="text-sm text-error mt-3">{error}</p>}

      {items.length > 0 && (
        <div className="mt-4 space-y-3">
          <EvidenceList items={items} removable onRemove={handleRemove} onRetry={handleRetry} />
          <div className="space-y-2">
            {items.map((item) => (
              <label key={`${item.localId}-desc`} className="block">
                <span className="text-xs text-text-secondary">
                  Description for {item.name}
                </span>
                <input
                  type="text"
                  value={item.description}
                  onChange={(event) => updateDescription(item.localId, event.target.value)}
                  placeholder="Optional context: what this file proves"
                  className={cn(
                    "mt-1 w-full rounded-lg px-3 py-2 text-sm",
                    "bg-background text-text-primary",
                    "border border-border-light focus:border-primary outline-none"
                  )}
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

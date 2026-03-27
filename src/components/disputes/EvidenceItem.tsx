"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import type { DisputeEvidence } from "@/types/dispute.types";

export type EvidenceUploadStatus = "queued" | "uploading" | "uploaded" | "error";

export interface EvidenceUploadItem {
  localId: string;
  file?: File;
  evidence?: DisputeEvidence;
  name: string;
  type: string;
  size: number;
  description: string;
  uploadedAt?: string;
  previewUrl?: string;
  progress: number;
  status: EvidenceUploadStatus;
  error?: string;
}

interface EvidenceItemProps {
  item: EvidenceUploadItem;
  removable?: boolean;
  onRemove?: (itemId: string) => void;
  onRetry?: (itemId: string) => void;
}

function formatFileSize(bytes: number): string {
  const kb = 1024;
  const mb = kb * 1024;
  if (bytes < kb) return `${bytes} B`;
  if (bytes < mb) return `${(bytes / kb).toFixed(1)} KB`;
  return `${(bytes / mb).toFixed(1)} MB`;
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

function isPdf(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

function getFileIcon(mimeType: string): string {
  if (isImage(mimeType)) return ICON_PATHS.image;
  if (isPdf(mimeType)) return ICON_PATHS.document;
  return ICON_PATHS.file;
}

export function EvidenceItem({
  item,
  removable = false,
  onRemove,
  onRetry,
}: EvidenceItemProps): React.JSX.Element {
  const previewHref = useMemo(() => {
    return item.evidence?.url ?? item.previewUrl;
  }, [item.evidence?.url, item.previewUrl]);

  return (
    <div className={cn("p-3 rounded-xl bg-background space-y-3", item.status === "error" && "border border-error/40")}>
      <div className="flex items-start gap-3">
        <Icon path={getFileIcon(item.type)} size="md" className="text-text-secondary mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
          <p className="text-xs text-text-secondary">
            {formatFileSize(item.size)}
            {item.uploadedAt ? ` • ${new Date(item.uploadedAt).toLocaleString()}` : ""}
          </p>
          {item.description && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.status === "error" && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(item.localId)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            >
              Retry
            </button>
          )}
          {removable && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(item.localId)}
              className="p-1.5 text-text-secondary hover:text-error transition-colors cursor-pointer"
            >
              <Icon path={ICON_PATHS.close} size="sm" />
            </button>
          )}
        </div>
      </div>

      {item.status === "uploading" && (
        <div className={cn("rounded-lg p-2", NEUMORPHIC_INSET)}>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-200" style={{ width: `${item.progress}%` }} />
          </div>
          <p className="text-xs text-text-secondary mt-1">{item.progress}% uploaded</p>
        </div>
      )}

      {item.status === "error" && item.error && (
        <p className="text-xs text-error">{item.error}</p>
      )}

      {isImage(item.type) && previewHref && (
        <img src={previewHref} alt={item.name} className="w-full max-h-52 object-cover rounded-lg border border-border-light" />
      )}

      {isPdf(item.type) && previewHref && (
        <div className="rounded-lg border border-border-light overflow-hidden">
          <iframe title={item.name} src={previewHref} className="w-full h-52" />
          <div className="p-2 flex items-center justify-end gap-3 bg-background">
            <a href={previewHref} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
              Open PDF
            </a>
            <a href={previewHref} download={item.name} className="text-xs text-primary hover:underline">
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

import type { Dispute } from "@/types/dispute.types";
import type { EvidenceUploadItem } from "@/components/disputes/EvidenceItem";

/** Converts stored dispute evidence into the `EvidenceUploadItem` shape used by the upload/list components. */
export function toEvidenceUploadItems(dispute: Dispute): EvidenceUploadItem[] {
  return dispute.evidence.map((file) => ({
    localId: file.id,
    evidence: file,
    name: file.name,
    type: file.type,
    size: file.size,
    description: file.description ?? "",
    uploadedAt: file.uploadedAt,
    previewUrl: file.url,
    progress: 100,
    status: "uploaded",
  }));
}
import { API_URL } from "@/config/api";
import type { DisputeEvidence } from "@/types/dispute.types";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export const DISPUTE_EVIDENCE_MAX_FILES = 5;
export const DISPUTE_EVIDENCE_MAX_SIZE = 10 * 1024 * 1024;
export const DISPUTE_EVIDENCE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

interface UploadOptions {
  disputeId?: string;
  description?: string;
  onProgress?: (progress: number) => void;
}

interface UploadEvidenceResponse {
  data?: DisputeEvidence;
}

interface ListEvidenceResponse {
  data?: DisputeEvidence[];
}

function mapEvidencePayload(payload: unknown, fallbackName: string): DisputeEvidence {
  const evidence = (payload ?? {}) as Partial<DisputeEvidence>;
  return {
    id: evidence.id ?? `evidence-${Date.now()}`,
    name: evidence.name ?? fallbackName,
    type: evidence.type ?? "application/octet-stream",
    size: evidence.size ?? 0,
    uploadedAt: evidence.uploadedAt ?? new Date().toISOString(),
    description: evidence.description,
    url: evidence.url,
  };
}

export async function uploadDisputeEvidence(
  token: string | null,
  file: File,
  options: UploadOptions = {}
): Promise<DisputeEvidence> {
  if (USE_MOCKS) {
    await new Promise<void>((resolve) => {
      let progress = 0;
      const timer = window.setInterval(() => {
        progress += 10;
        options.onProgress?.(Math.min(progress, 100));
        if (progress >= 100) {
          window.clearInterval(timer);
          resolve();
        }
      }, 70);
    });

    return {
      id: `mock-ev-${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      description: options.description,
      url: URL.createObjectURL(file),
    };
  }

  return await new Promise<DisputeEvidence>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append("file", file);
    if (options.description) {
      formData.append("description", options.description);
    }

    const endpoint = options.disputeId
      ? `${API_URL}/disputes/${options.disputeId}/evidence`
      : `${API_URL}/disputes/evidence`;

    xhr.open("POST", endpoint);
    xhr.setRequestHeader("Authorization", `Bearer ${token ?? ""}`);

    xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        options.onProgress?.(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText) as UploadEvidenceResponse;
          resolve(mapEvidencePayload(response.data, file.name));
        } catch {
          reject(new Error("Invalid upload response"));
        }
        return;
      }

      try {
        const response = JSON.parse(xhr.responseText) as { error?: { message?: string } };
        reject(new Error(response.error?.message ?? "Failed to upload evidence"));
      } catch {
        reject(new Error("Failed to upload evidence"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error while uploading evidence"));
    xhr.send(formData);
  });
}

export async function listDisputeEvidence(
  token: string | null,
  disputeId: string
): Promise<DisputeEvidence[]> {
  if (USE_MOCKS) {
    return [];
  }

  const response = await fetch(`${API_URL}/disputes/${disputeId}/evidence`, {
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch evidence");
  }

  const data = (await response.json()) as ListEvidenceResponse;
  return data.data ?? [];
}

export async function deleteDisputeEvidence(
  token: string | null,
  disputeId: string,
  evidenceId: string
): Promise<void> {
  if (USE_MOCKS) {
    return;
  }

  const response = await fetch(`${API_URL}/disputes/${disputeId}/evidence/${evidenceId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to delete evidence");
  }
}

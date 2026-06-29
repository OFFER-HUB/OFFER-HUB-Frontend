import type {
  AttachmentUploadResponse,
  FileAttachment,
} from "@/types/attachment.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Upload a single file with progress tracking
 */
export async function uploadAttachment(
  attachment: FileAttachment,
  conversationId: string,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<AttachmentUploadResponse> {
  const formData = new FormData();
  formData.append("file", attachment.file);
  formData.append("conversationId", conversationId);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText) as AttachmentUploadResponse;
          resolve(response);
        } catch {
          reject(new Error("Invalid response from server"));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    if (signal) {
      signal.addEventListener("abort", () => xhr.abort());
    }

    xhr.open("POST", `${API_BASE_URL}/api/attachments/upload`);
    xhr.send(formData);
  });
}

/**
 * Download an attachment
 */
export function downloadAttachment(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(attachmentId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/attachments/${attachmentId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete attachment");
  }
}
import { API_URL } from "@/config/api";
import type { MessageAttachment } from "@/types/chat.types";
import { FILE_UPLOAD } from "@/lib/validation";

export interface ChatAttachmentUploadResponse {
  attachment: MessageAttachment;
}

export interface UploadProgressCallback {
  (progress: number): void;
}

/**
 * Upload a chat attachment file to the server
 *
 * @param file - File to upload
 * @param token - Authentication token
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Upload response with attachment details
 */
export async function uploadChatAttachment(
  file: File,
  token: string,
  onProgress?: UploadProgressCallback
): Promise<ChatAttachmentUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.data) {
            resolve(response.data);
          } else {
            reject(new Error("Invalid response format"));
          }
        } catch (error) {
          reject(new Error("Failed to parse response"));
        }
      } else {
        let errorMessage = "Failed to upload attachment";
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          errorMessage = errorResponse.error?.message || errorMessage;
        } catch {
          // Use default error message
        }
        reject(new Error(errorMessage));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled"));
    });

    xhr.open("POST", `${API_URL}/chat/attachments`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });
}

/**
 * Validate a file for chat attachment
 *
 * @param file - File to validate
 * @returns Error message if invalid, null if valid
 */
export function validateChatAttachment(file: File): string | null {
  // Check file size
  if (file.size > FILE_UPLOAD.MAX_SIZE) {
    return `File size exceeds ${FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB limit`;
  }

  // Check file type
  const allowedTypes = [
    ...FILE_UPLOAD.ALLOWED_IMAGE_TYPES,
    ...FILE_UPLOAD.ALLOWED_DOC_TYPES,
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.type)) {
    return "File type not supported";
  }

  return null;
}

/**
 * Get file type category from MIME type
 *
 * @param mimeType - MIME type of the file
 * @returns File type category
 */
export function getFileTypeCategory(mimeType: string): "image" | "video" | "document" | "other" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return "document";
  return "other";
}

/**
 * Format file size for display
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Download an attachment
 *
 * @param attachment - Attachment to download
 */
export function downloadAttachment(attachment: MessageAttachment): void {
  const link = document.createElement("a");
  link.href = attachment.url;
  link.download = attachment.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export type AttachmentStatus = "pending" | "uploading" | "uploaded" | "error";

export interface FileAttachment {
  id: string;
  file: File;
  name: string;
  mimeType: string;
  size: number;
  previewUrl?: string;
  status: AttachmentStatus;
  progress: number;
  url?: string;
  error?: string;
}

export interface AttachmentUploadResponse {
  id: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

// ─── Validation ─────────────────────────────────────────────────────────────

export const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
] as const;

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_ATTACHMENTS_PER_MESSAGE = 10;

export const MIME_TYPE_LABELS: Record<string, string> = {
  "image/jpeg": "JPEG Image",
  "image/png": "PNG Image",
  "image/gif": "GIF Image",
  "image/webp": "WebP Image",
  "image/svg+xml": "SVG Image",
  "application/pdf": "PDF Document",
  "application/msword": "Word Document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word Document",
  "application/vnd.ms-excel": "Excel Spreadsheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel Spreadsheet",
  "application/vnd.ms-powerpoint": "PowerPoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
  "text/plain": "Text File",
  "text/csv": "CSV File",
  "application/zip": "ZIP Archive",
  "application/x-zip-compressed": "ZIP Archive",
  "application/x-rar-compressed": "RAR Archive",
};
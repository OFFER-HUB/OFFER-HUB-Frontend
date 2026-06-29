import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MIME_TYPE_LABELS,
  type FileAttachment,
} from "@/types/attachment.types";

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() || "";
}

export function getMimeTypeLabel(mimeType: string): string {
  return MIME_TYPE_LABELS[mimeType] || "File";
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

export function isDocumentFile(mimeType: string): boolean {
  return (
    mimeType.includes("pdf") ||
    mimeType.includes("word") ||
    mimeType.includes("excel") ||
    mimeType.includes("powerpoint") ||
    mimeType.includes("text") ||
    mimeType.includes("csv")
  );
}

export function isArchiveFile(mimeType: string): boolean {
  return mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z");
}

export function generateAttachmentId(): string {
  return `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function createFileAttachment(file: File): FileAttachment {
  return {
    id: generateAttachmentId(),
    file,
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    previewUrl: isImageFile(file.type) ? URL.createObjectURL(file) : undefined,
    status: "pending",
    progress: 0,
  };
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): ValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: `"${file.name}" has an unsupported file type.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `"${file.name}" exceeds the ${formatFileSize(MAX_FILE_SIZE)} limit.`,
    };
  }

  return { valid: true };
}

export function validateFiles(files: File[]): ValidationResult {
  if (files.length === 0) {
    return { valid: false, error: "No files selected." };
  }

  if (files.length > 10) {
    return { valid: false, error: "You can only attach up to 10 files at once." };
  }

  for (const file of files) {
    const result = validateFile(file);
    if (!result.valid) return result;
  }

  return { valid: true };
}

export function getFileIconType(mimeType: string): "image" | "document" | "archive" | "generic" {
  if (isImageFile(mimeType)) return "image";
  if (isDocumentFile(mimeType)) return "document";
  if (isArchiveFile(mimeType)) return "archive";
  return "generic";
}
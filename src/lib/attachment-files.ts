/**
 * Files the API accepts as order attachments (deliverables, evidence, references).
 *
 * Mirrors the API's upload rules: a short list of formats, up to 10 MB. Source
 * code such as a `.py` file is rejected on its own, so the form says so up front
 * and points to a ZIP, instead of failing after the upload.
 */
export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

export const ATTACHMENT_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "pdf",
  "doc",
  "docx",
  "txt",
  "csv",
  "json",
  "md",
  "zip",
] as const;

/** Value for the `accept` attribute of the file input. */
export const ATTACHMENT_ACCEPT = ATTACHMENT_EXTENSIONS.map((extension) => `.${extension}`).join(",");

/** Short, human list for the hint under the upload field. */
export const ATTACHMENT_FORMATS_LABEL = "JPG, PNG, GIF, WebP, PDF, DOC, DOCX, TXT, CSV, JSON, MD or ZIP";

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

/**
 * Returns why a file cannot be attached, or `null` when it can.
 */
export function attachmentProblem(file: { name: string; size: number }): string | null {
  if (file.size > ATTACHMENT_MAX_BYTES) {
    return "File size exceeds 10MB limit. Please select a smaller file.";
  }
  const extension = extensionOf(file.name);
  if (!(ATTACHMENT_EXTENSIONS as readonly string[]).includes(extension)) {
    const shown = extension ? `.${extension} files` : "This file type";
    return `${shown} can't be attached. Accepted: ${ATTACHMENT_FORMATS_LABEL}. Put other files, such as source code, in a ZIP.`;
  }
  return null;
}

/**
 * HTML Sanitization utilities for preventing XSS attacks.
 *
 * These functions strip or escape potentially dangerous HTML content
 * from user-generated input before rendering.
 */

// Characters that need to be escaped in HTML context
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Escapes HTML special characters to prevent XSS.
 * Use this when displaying user-generated content in HTML context.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Strips all HTML tags from a string.
 * Use this for plain text fields that should never contain HTML.
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

/**
 * Sanitizes a string for safe display by:
 * 1. Trimming whitespace
 * 2. Stripping HTML tags
 * 3. Escaping remaining special characters
 */
export function sanitizeText(str: string): string {
  return escapeHtml(stripHtml(str.trim()));
}

/**
 * Sanitizes text while preserving newlines (for multi-line content).
 * Converts newlines to <br> tags after sanitization.
 */
export function sanitizeMultilineText(str: string): string {
  const sanitized = sanitizeText(str);
  return sanitized.replace(/\n/g, "<br>");
}

/**
 * Sanitizes an object's string properties recursively.
 * Useful for sanitizing form data objects.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };

  for (const key in result) {
    const value = result[key];
    if (typeof value === "string") {
      (result as Record<string, unknown>)[key] = sanitizeText(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
    }
  }

  return result;
}

/**
 * Removes potentially dangerous URL protocols.
 * Allows: http, https, mailto, tel
 * Blocks: javascript, data, vbscript, etc.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  const allowedProtocols = ["http:", "https:", "mailto:", "tel:"];

  // Check if URL starts with an allowed protocol
  const hasAllowedProtocol = allowedProtocols.some((protocol) =>
    trimmed.startsWith(protocol)
  );

  // If no protocol, assume relative URL (safe)
  if (!trimmed.includes(":")) {
    return url.trim();
  }

  // Block dangerous protocols
  if (!hasAllowedProtocol) {
    return "";
  }

  return url.trim();
}

/**
 * Sanitizes a filename by removing path traversal characters
 * and limiting to safe characters.
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\?%*:|"<>]/g, "-") // Replace unsafe chars with dash
    .replace(/\.{2,}/g, ".") // Prevent path traversal
    .replace(/^\.+|\.+$/g, "") // Remove leading/trailing dots
    .slice(0, 255); // Limit length
}

/**
 * Truncates text to a maximum length, adding ellipsis if needed.
 * Sanitizes the text before truncating.
 */
export function truncateText(str: string, maxLength: number): string {
  const sanitized = sanitizeText(str);
  if (sanitized.length <= maxLength) {
    return sanitized;
  }
  return sanitized.slice(0, maxLength - 3) + "...";
}

/**
 * Client-side image compression / resize before upload.
 * GIFs are returned unchanged (animated GIFs would break).
 */

const DEFAULT_MAX_EDGE = 1920;
const DEFAULT_QUALITY = 0.82;

export interface CompressImageOptions {
  maxEdge?: number;
  quality?: number;
}

export async function compressImageFile(
  file: File,
  options?: CompressImageOptions
): Promise<File> {
  const maxEdge = options?.maxEdge ?? DEFAULT_MAX_EDGE;
  const quality = options?.quality ?? DEFAULT_QUALITY;

  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/gif") return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { naturalWidth: width, naturalHeight: height } = img;
      if (width <= 0 || height <= 0) {
        resolve(file);
        return;
      }
      if (width > maxEdge || height > maxEdge) {
        const ratio = Math.min(maxEdge / width, maxEdge / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const isPng = file.type === "image/png";
      const mime = isPng ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const ext = mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : ".jpg";
          const base = file.name.replace(/\.[^.]+$/, "") || "image";
          resolve(new File([blob], `${base}${ext}`, { type: mime }));
        },
        mime,
        isPng ? undefined : quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image file"));
    };

    img.src = objectUrl;
  });
}

import { API_URL } from "@/config/api";
import { validatePortfolioImageFile } from "@/data/portfolio.data";

const API_BASE_URL = API_URL;

function parseUploadPayload(data: unknown): { url: string } {
  if (data && typeof data === "object" && "data" in data) {
    const inner = (data as { data: unknown }).data;
    if (inner && typeof inner === "object" && inner !== null && "url" in inner) {
      return { url: String((inner as { url: unknown }).url) };
    }
  }
  if (data && typeof data === "object" && data !== null && "url" in data) {
    return { url: String((data as { url: unknown }).url) };
  }
  throw new Error("Invalid upload response");
}

/**
 * Upload a single portfolio image to the backend, reporting upload progress.
 */
export async function uploadPortfolioImage(
  token: string | null,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string }> {
  const validationError = validatePortfolioImageFile(file);
  if (validationError) throw new Error(validationError);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/portfolio/images/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${token ?? ""}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText) as unknown;
          resolve(parseUploadPayload(json));
        } catch {
          reject(new Error("Upload failed — invalid server response"));
        }
      } else {
        let msg = "Upload failed — please try again";
        try {
          const json = JSON.parse(xhr.responseText) as { message?: string };
          if (json.message) msg = json.message;
        } catch {
          /* ignore */
        }
        reject(new Error(msg));
      }
    };

    xhr.onerror = () =>
      reject(new Error("Network error — check your connection and try again"));

    const body = new FormData();
    body.append("file", file);
    xhr.send(body);
  });
}

/**
 * Optional: delete an image on the server by URL (e.g. after replacing assets).
 */
export async function deletePortfolioImage(
  token: string | null,
  imageUrl: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/portfolio/images`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? "Failed to remove image"
    );
  }
}

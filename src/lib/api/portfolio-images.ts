import { API_URL } from "@/config/api";
import { validatePortfolioImageFile } from "@/data/portfolio.data";

const API_BASE_URL = API_URL;

/** Match portfolio mock flag in `portfolio.ts` until backend is wired. */
const USE_MOCK = true;

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
 * Upload a single portfolio image. Mock mode returns a data URL after simulated progress.
 */
export async function uploadPortfolioImage(
  token: string | null,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string }> {
  const validationError = validatePortfolioImageFile(file);
  if (validationError) throw new Error(validationError);

  if (USE_MOCK) {
    for (let step = 0; step <= 10; step++) {
      await simulateDelay(45);
      onProgress?.(step * 10);
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result;
        if (typeof url === "string") resolve({ url });
        else reject(new Error("Upload failed — could not read image"));
      };
      reader.onerror = () =>
        reject(new Error("Upload failed — could not read image"));
      reader.readAsDataURL(file);
    });
  }

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
 * Mock is a no-op.
 */
export async function deletePortfolioImage(
  token: string | null,
  imageUrl: string
): Promise<void> {
  if (USE_MOCK) {
    await simulateDelay(100);
    return;
  }

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

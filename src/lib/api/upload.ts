import { API_URL } from "@/config/api";

/**
 * Upload response interface
 */
export interface UploadResponse {
  url: string;
  publicId: string;
}

/**
 * Upload an image file to the server
 *
 * @param file - Image file to upload
 * @param token - Authentication token
 * @param folder - Optional folder name (default: 'avatars')
 * @returns Upload response with URL and public ID
 */
export async function uploadImage(
  file: File,
  token: string,
  folder: string = "avatars"
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload/image?folder=${folder}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to upload image");
  }

  const data = await response.json();
  return data.data;
}

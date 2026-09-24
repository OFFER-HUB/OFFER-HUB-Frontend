export interface UploadedFile {
  id: string;
  file: File;
  type: "image" | "document";
  preview?: string;
  name: string;
  size: number;
}

export interface ImageUploadProps {
  variant: "single" | "multiple";
  maxSize?: number; // In bytes
  allowedTypes?: string[];
  currentImage?: string | null; // For single variant
  onUpload: (files: File[]) => void;
  onRemove?: (id: string) => void;
  className?: string;
  aspectRatio?: "square" | "wide" | "free"; // Default: square
  label?: string;
  error?: string;
}

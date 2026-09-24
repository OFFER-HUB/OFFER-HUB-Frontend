"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_INSET, ACTION_BUTTON_SUBTLE } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/auth-store";
import { uploadImage } from "@/lib/api/upload";

export interface KycFileUploadFieldProps {
  label: string;
  value: string | undefined;
  onChange: (url: string) => void;
  error?: string;
  optional?: boolean;
}

/**
 * A single KYC document/selfie upload — wraps the existing Cloudinary upload
 * endpoint (same one avatars use) so the form only ever submits public HTTPS
 * URLs. BlindPay rejects `data:` URIs outright.
 */
export function KycFileUploadField({
  label,
  value,
  onChange,
  error,
  optional,
}: KycFileUploadFieldProps): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !token) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      const result = await uploadImage(file, token, "kyc");
      onChange(result.url);
    } catch (uploadErr) {
      setUploadError(uploadErr instanceof Error ? uploadErr.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-2">
        {label} {optional && <span className="text-text-secondary font-normal">(optional)</span>}
      </label>

      <div className={cn(NEUMORPHIC_INSET, "rounded-xl p-3 flex items-center gap-3")}>
        {value ? (
          <>
            <img src={value} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
            <p className="text-xs text-success flex items-center gap-1 min-w-0 truncate">
              <Icon path={ICON_PATHS.check} size="sm" className="shrink-0" />
              Uploaded
            </p>
          </>
        ) : (
          <p className="text-xs text-text-secondary">No file uploaded yet</p>
        )}

        <label
          htmlFor={inputId}
          className={cn(ACTION_BUTTON_SUBTLE, "w-auto ml-auto px-3 py-2 text-xs cursor-pointer shrink-0")}
        >
          {isUploading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Icon path={ICON_PATHS.upload} size="sm" />
          )}
          {value ? "Replace" : "Upload"}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          disabled={isUploading}
          onChange={handleFileChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
      </div>

      {(error || uploadError) && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-error">
          {error ?? uploadError}
        </p>
      )}
    </div>
  );
}

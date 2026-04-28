"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useModeStore } from "@/stores/mode-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INPUT,
  ICON_BUTTON,
  INPUT_ERROR_STYLES,
  PRIMARY_BUTTON,
} from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { FormField } from "@/components/ui/FormField";
import { AttachmentPreview } from "@/components/offers/AttachmentPreview";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { DatePicker } from "@/components/ui/DatePicker";
import { createOffer, uploadAttachment, type OfferCategory } from "@/lib/api/offers";
import type { Attachment, FormErrors, OfferFormData } from "@/types/client-offer.types";
import {
  INITIAL_FORM_DATA,
  MIN_BUDGET,
  MIN_DESCRIPTION_LENGTH,
  MAX_ATTACHMENTS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOC_TYPES,
  validateOfferForm,
} from "@/data/client-offer.data";

const API_CATEGORIES: { value: OfferCategory | ""; label: string }[] = [
  { value: "", label: "Select a category" },
  { value: "WEB_DEVELOPMENT", label: "Web Development" },
  { value: "MOBILE_DEVELOPMENT", label: "Mobile Development" },
  { value: "DESIGN", label: "Design & Creative" },
  { value: "WRITING", label: "Writing & Translation" },
  { value: "MARKETING", label: "Marketing & Sales" },
  { value: "VIDEO", label: "Video & Animation" },
  { value: "MUSIC", label: "Music & Audio" },
  { value: "DATA", label: "Data & Analytics" },
  { value: "OTHER", label: "Other" },
];

export default function CreateOfferPage(): React.JSX.Element {
  const router = useRouter();
  const { setMode } = useModeStore();
  const token = useAuthStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OfferFormData>(INITIAL_FORM_DATA);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  useEffect(() => {
    setMode("client");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleUpload(files: File[]): void {

    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      setAttachmentError(`Maximum ${MAX_ATTACHMENTS} attachments allowed`);
      return;
    }

    setAttachmentError(null);
    const newAttachments: Attachment[] = files.map((file) => {
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: isImage ? "image" : "document",
        preview: isImage ? URL.createObjectURL(file) : undefined,
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
  }

  function removeAttachment(id: string): void {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter((a) => a.id !== id);
    });
    setAttachmentError(null);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validateOfferForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!token) {
      setApiError("You must be logged in to create an offer");
      return;
    }

    setIsLoading(true);

    try {
      const budgetValue = parseFloat(formData.budget);
      const offer = await createOffer(token, {
        title: formData.title,
        description: formData.description,
        category: formData.category as OfferCategory,
        budget: budgetValue.toFixed(2),
        deadline: formData.deadline,
      });

      // Upload attachments if any
      if (attachments.length > 0) {
        const uploadErrors: string[] = [];
        for (const attachment of attachments) {
          try {
            await uploadAttachment(token, offer.id, attachment.file);
          } catch (err) {
            uploadErrors.push(
              `Failed to upload "${attachment.file.name}": ${err instanceof Error ? err.message : "Unknown error"}`
            );
          }
        }
        if (uploadErrors.length > 0) {
          console.warn("Some attachments failed to upload:", uploadErrors);
        }
      }

      router.push("/app/client/offers?created=true");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Failed to create offer");
    } finally {
      setIsLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/client/dashboard" className={ICON_BUTTON}>
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Create New Offer</h1>
          <p className="text-text-secondary mt-1">Post a job opportunity for freelancers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className={NEUMORPHIC_CARD}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Basic Information</h2>
              <div className="space-y-5">
                <FormField label="Offer Title" error={errors.title}>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={cn(NEUMORPHIC_INPUT, errors.title && INPUT_ERROR_STYLES)}
                    placeholder="e.g., Build a responsive website for my business"
                  />
                </FormField>

                <FormField label="Category" error={errors.category}>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={cn(
                      NEUMORPHIC_INPUT,
                      "cursor-pointer",
                      errors.category && INPUT_ERROR_STYLES
                    )}
                  >
                    {API_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Description"
                  error={errors.description}
                  hint={`${formData.description.length} / ${MIN_DESCRIPTION_LENGTH} minimum characters`}
                >
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={8}
                    className={cn(
                      NEUMORPHIC_INPUT,
                      "resize-none",
                      errors.description && INPUT_ERROR_STYLES
                    )}
                    placeholder="Describe your project in detail. Include requirements, deliverables, and any specific skills needed..."
                  />
                </FormField>
              </div>
            </div>

            <div className={NEUMORPHIC_CARD}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Attachments</h2>
              <p className="text-sm text-text-secondary mb-4">
                Add images or documents to help freelancers understand your project better.
              </p>

              <ImageUpload
                variant="multiple"
                allowedTypes={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]}
                onUpload={handleUpload}
                error={attachmentError || undefined}
              />

              {attachments.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {attachments.map((attachment) => (
                    <AttachmentPreview
                      key={attachment.id}
                      attachment={attachment}
                      onRemove={() => removeAttachment(attachment.id)}
                    />
                  ))}
                </div>
              )}

              <p className="mt-3 text-xs text-text-secondary">
                {attachments.length} / {MAX_ATTACHMENTS} files attached
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className={NEUMORPHIC_CARD}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Budget & Timeline</h2>
              <div className="space-y-5">
                <FormField label="Budget (USD)" error={errors.budget}>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                      $
                    </span>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      min={MIN_BUDGET}
                      step="1"
                      className={cn(NEUMORPHIC_INPUT, "pl-8", errors.budget && INPUT_ERROR_STYLES)}
                      placeholder="500"
                    />
                  </div>
                </FormField>

                <FormField label="Deadline" error={errors.deadline}>
                  <DatePicker
                    value={formData.deadline}
                    onChange={(date) => {
                      setFormData((prev) => ({ ...prev, deadline: date }));
                      if (errors.deadline) {
                        setErrors((prev) => ({ ...prev, deadline: undefined }));
                      }
                    }}
                    minDate={today}
                    error={!!errors.deadline}
                    placeholder="Select deadline"
                  />
                </FormField>
              </div>
            </div>

            <div className={NEUMORPHIC_CARD}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Actions</h2>
              <div className="space-y-3">
                {apiError && (
                  <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
                    {apiError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(PRIMARY_BUTTON, "w-full justify-center")}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <LoadingSpinner />
                      Publishing...
                    </span>
                  ) : (
                    "Publish Offer"
                  )}
                </button>
                <Link
                  href="/app/client/dashboard"
                  className={cn(
                    "block w-full px-6 py-3 rounded-xl font-medium text-center",
                    "bg-background text-text-secondary",
                    "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                    "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                    "transition-all duration-200"
                  )}
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

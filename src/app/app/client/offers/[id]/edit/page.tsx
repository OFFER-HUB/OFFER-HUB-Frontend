"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useModeStore } from "@/stores/mode-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INPUT,
  NEUMORPHIC_INSET,
  ICON_BUTTON,
  INPUT_ERROR_STYLES,
  PRIMARY_BUTTON,
} from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { FormField } from "@/components/ui/FormField";
import { DatePicker } from "@/components/ui/DatePicker";
import { AttachmentPreview } from "@/components/offers/AttachmentPreview";
import { getOfferById, updateOffer, uploadAttachment, deleteAttachment, type OfferCategory, type OfferAttachment } from "@/lib/api/offers";
import type { Attachment, FormErrors, OfferFormData } from "@/types/client-offer.types";
import {
  INITIAL_FORM_DATA,
  MIN_BUDGET,
  MIN_DESCRIPTION_LENGTH,
  MAX_FILE_SIZE,
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

export default function EditOfferPage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams();
  const offerId = params.id as string;
  const { setMode } = useModeStore();
  const token = useAuthStore((state) => state.token);
  const [mounted, setMounted] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<OfferFormData>(INITIAL_FORM_DATA);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<OfferAttachment[]>([]);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [originalDeadline, setOriginalDeadline] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode("client");
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function fetchOffer() {
      if (!token) {
        setIsFetching(false);
        setIsNotFound(true);
        return;
      }

      try {
        const offer = await getOfferById(token, offerId);
        const deadline = offer.deadline.split("T")[0];
        setFormData({
          title: offer.title,
          description: offer.description,
          budget: offer.budget,
          category: offer.category,
          deadline,
        });
        setOriginalDeadline(deadline);
        setExistingAttachments(offer.attachments || []);
      } catch (error) {
        console.error("Failed to fetch offer:", error);
        setIsNotFound(true);
      } finally {
        setIsFetching(false);
      }
    }

    fetchOffer();
  }, [mounted, offerId, token]);

  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => {
        if (attachment.preview) {
          URL.revokeObjectURL(attachment.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setAttachmentError(null);

    if (existingAttachments.length + attachments.length + files.length > MAX_ATTACHMENTS) {
      setAttachmentError(`Maximum ${MAX_ATTACHMENTS} attachments allowed`);
      return;
    }

    const newAttachments: Attachment[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setAttachmentError(`File "${file.name}" exceeds 10MB limit`);
        return;
      }

      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isDoc = ALLOWED_DOC_TYPES.includes(file.type);

      if (!isImage && !isDoc) {
        setAttachmentError(`File "${file.name}" is not a supported format`);
        return;
      }

      const attachment: Attachment = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: isImage ? "image" : "document",
        preview: isImage ? URL.createObjectURL(file) : undefined,
      };

      newAttachments.push(attachment);
    });

    setAttachments((prev) => [...prev, ...newAttachments]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  async function handleDeleteExistingAttachment(attachmentId: string): Promise<void> {
    if (!token) return;
    setDeletingAttachmentId(attachmentId);
    try {
      await deleteAttachment(token, attachmentId);
      setExistingAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      setAttachmentError(error instanceof Error ? error.message : "Failed to delete attachment");
    } finally {
      setDeletingAttachmentId(null);
    }
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

  const handleToastClose = useCallback(() => {
    setShowToast(false);
  }, []);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validateOfferForm(formData, originalDeadline);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!token) {
      setApiError("You must be logged in to update an offer");
      return;
    }

    setIsSubmitting(true);

    try {
      const budgetValue = parseFloat(formData.budget);
      await updateOffer(token, offerId, {
        title: formData.title,
        description: formData.description,
        category: formData.category as OfferCategory,
        budget: budgetValue.toFixed(2),
        deadline: formData.deadline,
      });

      // Upload new attachments if any
      if (attachments.length > 0) {
        const uploadErrors: string[] = [];
        for (const attachment of attachments) {
          try {
            await uploadAttachment(token, offerId, attachment.file);
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

      setShowToast(true);
      setTimeout(() => {
        router.push(`/app/client/offers/${offerId}`);
      }, 1000);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Failed to update offer");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-text-secondary">Loading offer...</span>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon={ICON_PATHS.briefcase}
          message="Offer not found"
          linkHref="/app/client/offers"
          linkText="Back to offers"
        />
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const totalAttachments = existingAttachments.length + attachments.length;
  const canAddMoreFiles = totalAttachments < MAX_ATTACHMENTS;
  const detailHref = `/app/client/offers/${offerId}`;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:4000";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={detailHref} className={ICON_BUTTON}>
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Edit Offer</h1>
          <p className="text-text-secondary mt-1">Update your job offer details</p>
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

              <div
                onClick={() => canAddMoreFiles && fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed border-border-light rounded-xl p-8",
                  "flex flex-col items-center justify-center gap-3",
                  "cursor-pointer",
                  "hover:border-primary/50 hover:bg-primary/5",
                  "transition-all duration-200",
                  !canAddMoreFiles && "opacity-50 pointer-events-none"
                )}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon path={ICON_PATHS.image} size="lg" className="text-primary" />
                </div>
                <p className="text-sm text-text-primary font-medium">Click to upload files</p>
                <p className="text-xs text-text-secondary">PNG, JPG, GIF, PDF, DOC up to 10MB each</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />

              {attachmentError && <p className="mt-3 text-sm text-error">{attachmentError}</p>}

              {existingAttachments.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-text-primary mb-2">Current attachments</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {existingAttachments.map((attachment) => {
                      const isImage = attachment.mimeType.startsWith("image/");
                      const fileUrl = `${backendUrl}${attachment.url}`;
                      const isDeleting = deletingAttachmentId === attachment.id;

                      return (
                        <div
                          key={attachment.id}
                          className={cn(
                            "relative rounded-xl overflow-hidden",
                            NEUMORPHIC_INSET
                          )}
                        >
                          {isImage ? (
                            <div className="aspect-square">
                              <img
                                src={fileUrl}
                                alt={attachment.filename}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-square flex flex-col items-center justify-center p-4 bg-background">
                              <Icon path={ICON_PATHS.document} size="xl" className="text-text-secondary mb-2" />
                              <p className="text-xs text-text-secondary text-center truncate w-full">
                                {attachment.filename}
                              </p>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteExistingAttachment(attachment.id)}
                            disabled={isDeleting}
                            className={cn(
                              "absolute top-2 right-2 w-6 h-6 rounded-full",
                              "bg-error/90 text-white flex items-center justify-center",
                              "hover:bg-error transition-colors",
                              isDeleting && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {isDeleting ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Icon path={ICON_PATHS.close} size="sm" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {attachments.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-text-primary mb-2">New attachments</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {attachments.map((attachment) => (
                      <AttachmentPreview
                        key={attachment.id}
                        attachment={attachment}
                        onRemove={() => removeAttachment(attachment.id)}
                        displaySize={attachment.displaySize}
                      />
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-3 text-xs text-text-secondary">
                {totalAttachments} / {MAX_ATTACHMENTS} files attached
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
                <button type="submit" disabled={isSubmitting} className={cn(PRIMARY_BUTTON, "w-full justify-center")}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <LoadingSpinner />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <Link
                  href={detailHref}
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

      {showToast && (
        <Toast
          message="Offer updated successfully!"
          type="success"
          onClose={handleToastClose}
        />
      )}
    </div>
  );
}

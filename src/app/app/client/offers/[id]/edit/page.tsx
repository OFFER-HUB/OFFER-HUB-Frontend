"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { BACKEND_URL } from "@/config/api";
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
import { DatePicker } from "@/components/ui/DatePicker";
import { AttachmentPreview } from "@/components/offers/AttachmentPreview";
import {
  getOfferById,
  updateOffer,
  uploadAttachment,
  deleteAttachment,
  type OfferCategory,
  type OfferAttachment,
} from "@/lib/api/offers";
import type { Attachment, FormErrors, OfferFormData } from "@/types/client-offer.types";
import {
  INITIAL_FORM_DATA,
  MIN_TITLE_LENGTH,
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

const BUDGET_PRESETS = [100, 250, 500, 1000, 2500];

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
  }, [setMode]);

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
  }, [attachments]);

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

  const handleDeleteExistingAttachment = useCallback(
    async (attachmentId: string) => {
      if (!token) return;

      setDeletingAttachmentId(attachmentId);
      setAttachmentError(null);

      try {
        await deleteAttachment(token, attachmentId);
        setExistingAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      } catch (err) {
        setAttachmentError(
          `Failed to delete attachment: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setDeletingAttachmentId(null);
      }
    },
    [token, offerId]
  );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  const selectedCategoryLabel = useMemo(() => {
    return API_CATEGORIES.find((c) => c.value === formData.category)?.label || "Category";
  }, [formData.category]);

  const hasImage = useMemo(() => {
    const hasExistingImage = existingAttachments.some((a) => a.mimeType.startsWith("image/"));
    const hasNewImage = attachments.some((a) => a.type === "image");
    return hasExistingImage || hasNewImage;
  }, [existingAttachments, attachments]);

  const checklist = useMemo(() => {
    return {
      title: formData.title.trim().length >= MIN_TITLE_LENGTH,
      category: Boolean(formData.category),
      description: formData.description.trim().length >= MIN_DESCRIPTION_LENGTH,
      image: hasImage,
      budget: Boolean(formData.budget && parseFloat(formData.budget) >= MIN_BUDGET),
      deadline: Boolean(formData.deadline),
    };
  }, [formData, hasImage]);

  const allChecksPassed = Object.values(checklist).every(Boolean);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validateOfferForm(formData, originalDeadline);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!hasImage) {
      setAttachmentError("At least one image is required for an offer");
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
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category as OfferCategory,
        budget: budgetValue.toFixed(2),
        deadline: formData.deadline,
      });

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
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-background rounded-xl" />
          <div className="space-y-2">
            <div className="h-7 bg-background rounded w-48" />
            <div className="h-4 bg-background rounded w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className={cn(NEUMORPHIC_CARD, "h-48 bg-background")} />
            <div className={cn(NEUMORPHIC_CARD, "h-64 bg-background")} />
          </div>
          <div className="lg:col-span-4">
            <div className={cn(NEUMORPHIC_CARD, "h-96 bg-background")} />
          </div>
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon={ICON_PATHS.briefcase}
          title="Offer Not Found"
          message="The job offer you are trying to edit does not exist or has been removed."
          linkHref="/app/client/offers"
          linkText="Back to Offers"
        />
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const totalAttachments = existingAttachments.length + attachments.length;
  const canAddMoreFiles = totalAttachments < MAX_ATTACHMENTS;
  const detailHref = `/app/client/offers/${offerId}`;
  const backendUrl = BACKEND_URL;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={detailHref} className={ICON_BUTTON} title="Back to Offer Details">
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Edit Job Offer
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Update your job requirements, attachments, budget, or timeline
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form (8 Columns) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 min-w-0">
            {/* Project Overview Card */}
            <div className={cn(NEUMORPHIC_CARD, "space-y-5")}>
              <div className="flex items-center gap-3 pb-3 border-b border-border-light/60 dark:border-border-light/10">
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center bg-background text-primary shrink-0",
                    "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
                  )}
                >
                  <Icon path={ICON_PATHS.briefcase} size="sm" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Project Overview</h2>
                  <p className="text-xs text-text-secondary">Keep your project title clear and compelling</p>
                </div>
              </div>

              {/* Title Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="offer-title" className="text-sm font-semibold text-text-primary">
                    Offer Title <span className="text-error">*</span>
                  </label>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      formData.title.length < MIN_TITLE_LENGTH ? "text-text-secondary" : "text-success"
                    )}
                  >
                    {formData.title.length}/{MIN_TITLE_LENGTH} min chars
                  </span>
                </div>
                <input
                  id="offer-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={cn(NEUMORPHIC_INPUT, errors.title && INPUT_ERROR_STYLES)}
                  placeholder="e.g., Build a Modern Responsive Web Application with Next.js"
                />
                {errors.title && <p className="mt-1.5 text-xs text-error font-medium">{errors.title}</p>}
              </div>

              {/* Category Field */}
              <div>
                <label htmlFor="offer-category" className="block text-sm font-semibold text-text-primary mb-1.5">
                  Category <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="offer-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={cn(
                      NEUMORPHIC_INPUT,
                      "cursor-pointer appearance-none pr-10",
                      errors.category && INPUT_ERROR_STYLES,
                      !formData.category && "text-text-secondary"
                    )}
                  >
                    {API_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary">
                    <Icon path={ICON_PATHS.chevronDown} size="sm" />
                  </div>
                </div>
                {errors.category && <p className="mt-1.5 text-xs text-error font-medium">{errors.category}</p>}
              </div>
            </div>

            {/* Scope & Description Card */}
            <div className={cn(NEUMORPHIC_CARD, "space-y-5")}>
              <div className="flex items-center gap-3 pb-3 border-b border-border-light/60 dark:border-border-light/10">
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center bg-background text-primary shrink-0",
                    "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
                  )}
                >
                  <Icon path={ICON_PATHS.document} size="sm" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Scope of Work</h2>
                  <p className="text-xs text-text-secondary">Ensure freelancers understand every requirement</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="offer-description" className="text-sm font-semibold text-text-primary">
                    Project Description <span className="text-error">*</span>
                  </label>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      formData.description.length < MIN_DESCRIPTION_LENGTH
                        ? "text-text-secondary"
                        : "text-success"
                    )}
                  >
                    {formData.description.length} / {MIN_DESCRIPTION_LENGTH} min chars
                  </span>
                </div>
                <textarea
                  id="offer-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={8}
                  className={cn(
                    NEUMORPHIC_INPUT,
                    "resize-y min-h-[160px]",
                    errors.description && INPUT_ERROR_STYLES
                  )}
                  placeholder="Describe your project in detail..."
                />
                {errors.description && (
                  <p className="mt-1.5 text-xs text-error font-medium">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Attachments Card */}
            <div className={cn(NEUMORPHIC_CARD, "space-y-5")}>
              <div className="flex items-center justify-between pb-3 border-b border-border-light/60 dark:border-border-light/10">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center bg-background text-primary shrink-0",
                      "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
                    )}
                  >
                    <Icon path={ICON_PATHS.image} size="sm" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-primary">Visuals & Attachments</h2>
                    <p className="text-xs text-text-secondary">
                      Current and newly uploaded reference files
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full",
                    hasImage
                      ? "bg-success/15 text-success border border-success/30"
                      : "bg-warning/15 text-warning border border-warning/30"
                  )}
                >
                  {hasImage ? "Image Included" : "At least 1 image required"}
                </span>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => canAddMoreFiles && fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed border-border-light dark:border-border-light/20 rounded-2xl p-6",
                  "flex flex-col items-center justify-center gap-2",
                  "cursor-pointer bg-background/50 hover:bg-background hover:border-primary/50 transition-all",
                  !canAddMoreFiles && "opacity-50 pointer-events-none"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl bg-background flex items-center justify-center text-primary",
                    "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
                  )}
                >
                  <Icon path={ICON_PATHS.upload} size="md" />
                </div>
                <p className="text-xs font-bold text-text-primary">Click to upload files</p>
                <p className="text-[11px] text-text-secondary">PNG, JPG, GIF, PDF, DOC up to 10MB each</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />

              {attachmentError && <p className="text-xs text-error font-medium">{attachmentError}</p>}

              {/* Existing attachments */}
              {existingAttachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Current Attachments
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {existingAttachments.map((attachment) => {
                      const isImg = attachment.mimeType.startsWith("image/");
                      const fileUrl = attachment.url.startsWith("http")
                        ? attachment.url
                        : `${backendUrl}${attachment.url}`;
                      const isDeleting = deletingAttachmentId === attachment.id;

                      return (
                        <div
                          key={attachment.id}
                          className={cn("relative rounded-xl overflow-hidden group", NEUMORPHIC_INSET)}
                        >
                          {isImg ? (
                            <div className="aspect-square">
                              <img
                                src={fileUrl}
                                alt={attachment.filename}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-square flex flex-col items-center justify-center p-3 bg-background">
                              <Icon path={ICON_PATHS.document} size="lg" className="text-text-secondary mb-1" />
                              <p className="text-[11px] text-text-secondary text-center truncate w-full px-1">
                                {attachment.filename}
                              </p>
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5">
                            <p className="text-[10px] text-white truncate">{attachment.filename}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteExistingAttachment(attachment.id)}
                            disabled={isDeleting}
                            className={cn(
                              "absolute top-2 right-2 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center",
                              "hover:brightness-110 transition-all cursor-pointer shadow-sm",
                              isDeleting && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {isDeleting ? <LoadingSpinner size="sm" /> : <Icon path={ICON_PATHS.close} size="sm" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Newly added attachments */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    New Attachments
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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

              <p className="text-xs text-text-secondary">
                {totalAttachments} / {MAX_ATTACHMENTS} total files attached
              </p>
            </div>
          </div>

          {/* Sticky Sidebar: Budget, Preview & Save (4 Columns) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-6 min-w-0">
            {/* Budget & Timeline Card */}
            <div className={cn(NEUMORPHIC_CARD, "space-y-5")}>
              <div className="flex items-center gap-3 pb-3 border-b border-border-light/60 dark:border-border-light/10">
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center bg-background text-primary shrink-0",
                    "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
                  )}
                >
                  <Icon path={ICON_PATHS.currency} size="sm" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                    Budget & Timeline
                  </h3>
                  <p className="text-xs text-text-secondary">Adjust escrow budget or due date</p>
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <label htmlFor="offer-budget" className="block text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Total Budget (USD) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">
                    $
                  </span>
                  <input
                    id="offer-budget"
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    min={MIN_BUDGET}
                    step="1"
                    className={cn(NEUMORPHIC_INPUT, "pl-8 text-base font-bold", errors.budget && INPUT_ERROR_STYLES)}
                    placeholder="500"
                  />
                </div>
                {errors.budget && <p className="text-xs text-error font-medium">{errors.budget}</p>}

                {/* Preset chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {BUDGET_PRESETS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, budget: String(amt) }))}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                        formData.budget === String(amt)
                          ? "bg-primary text-white shadow-sm"
                          : "bg-background text-text-secondary hover:text-primary hover:bg-white"
                      )}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2 pt-2 border-t border-border-light/60 dark:border-border-light/10">
                <label htmlFor="offer-deadline" className="block text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Project Deadline <span className="text-error">*</span>
                </label>
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
                {errors.deadline && <p className="text-xs text-error font-medium">{errors.deadline}</p>}
              </div>
            </div>

            {/* Live Feed Preview */}
            <div className={cn(NEUMORPHIC_CARD, "space-y-4")}>
              <div className="flex items-center justify-between pb-3 border-b border-border-light/60 dark:border-border-light/10">
                <div className="flex items-center gap-2">
                  <Icon path={ICON_PATHS.eye} size="sm" className="text-primary" />
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Offer Feed Preview
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                  Live View
                </span>
              </div>

              <div
                className={cn(
                  "p-5 rounded-2xl bg-background",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
                  "space-y-3"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/15 text-primary truncate max-w-[160px]">
                    {formData.category ? selectedCategoryLabel : "Category"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/15 text-success border border-success/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    Open
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-text-primary line-clamp-1">
                    {formData.title.trim() || "Your Offer Title will appear here"}
                  </h4>
                  <p className="mt-1 text-xs text-text-secondary line-clamp-2 min-h-[2rem]">
                    {formData.description.trim() ||
                      "Detailed project brief, scope of work, and requirements will be visible to freelancers."}
                  </p>
                </div>

                <div className="pt-3 border-t border-border-light/60 dark:border-border-light/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-text-secondary block">
                      Target Budget
                    </span>
                    <span className="text-base font-black text-primary">
                      ${formData.budget ? Number(formData.budget).toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-text-secondary block">
                      Deadline
                    </span>
                    <span className="text-xs font-semibold text-text-primary flex items-center justify-end gap-1">
                      <Icon path={ICON_PATHS.calendar} size="sm" className="text-text-secondary" />
                      {formData.deadline ? formData.deadline : "TBD"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className={cn(NEUMORPHIC_CARD, "p-5 space-y-3")}>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Offer Checklist
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Icon
                    path={ICON_PATHS.check}
                    size="sm"
                    className={checklist.title ? "text-success" : "text-border"}
                  />
                  <span className={checklist.title ? "text-text-primary font-medium" : "text-text-secondary"}>
                    Project title (min 10 chars)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    path={ICON_PATHS.check}
                    size="sm"
                    className={checklist.category ? "text-success" : "text-border"}
                  />
                  <span className={checklist.category ? "text-text-primary font-medium" : "text-text-secondary"}>
                    Category chosen
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    path={ICON_PATHS.check}
                    size="sm"
                    className={checklist.description ? "text-success" : "text-border"}
                  />
                  <span className={checklist.description ? "text-text-primary font-medium" : "text-text-secondary"}>
                    Scope description (min 50 chars)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    path={ICON_PATHS.check}
                    size="sm"
                    className={checklist.image ? "text-success" : "text-border"}
                  />
                  <span className={checklist.image ? "text-text-primary font-medium" : "text-text-secondary"}>
                    At least 1 image attached
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    path={ICON_PATHS.check}
                    size="sm"
                    className={checklist.budget ? "text-success" : "text-border"}
                  />
                  <span className={checklist.budget ? "text-text-primary font-medium" : "text-text-secondary"}>
                    Budget (min $10)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    path={ICON_PATHS.check}
                    size="sm"
                    className={checklist.deadline ? "text-success" : "text-border"}
                  />
                  <span className={checklist.deadline ? "text-text-primary font-medium" : "text-text-secondary"}>
                    Target deadline selected
                  </span>
                </div>
              </div>
            </div>

            {/* Save Actions Box */}
            <div className={cn(NEUMORPHIC_CARD, "p-5 space-y-3")}>
              {apiError && (
                <div className="p-3 rounded-xl bg-error/10 text-error text-xs font-medium border border-error/20">
                  {apiError}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !allChecksPassed}
                className={cn(PRIMARY_BUTTON, "w-full justify-center text-sm py-3.5 font-bold")}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2 justify-center">
                    <LoadingSpinner size="sm" />
                    Saving Changes...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>

              <Link
                href={detailHref}
                className={cn(
                  "block w-full py-3 rounded-xl font-medium text-xs text-center",
                  "bg-background text-text-secondary hover:text-text-primary",
                  "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#0a0f1a,-3px_-3px_6px_#1e2a4a]",
                  "hover:shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff] dark:hover:shadow-[1px_1px_3px_#0a0f1a,-1px_-1px_3px_#1e2a4a]",
                  "transition-all duration-200"
                )}
              >
                Cancel & Revert
              </Link>
            </div>
          </div>
        </div>
      </form>

      {showToast && (
        <Toast
          message="Offer updated successfully!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

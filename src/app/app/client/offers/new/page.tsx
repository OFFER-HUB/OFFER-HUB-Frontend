"use client";

import { useState, useEffect, useMemo } from "react";
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
import { AttachmentPreview } from "@/components/offers/AttachmentPreview";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { DatePicker } from "@/components/ui/DatePicker";
import { createOffer, uploadAttachment, type OfferCategory } from "@/lib/api/offers";
import type { Attachment, FormErrors, OfferFormData } from "@/types/client-offer.types";
import {
  INITIAL_FORM_DATA,
  MIN_TITLE_LENGTH,
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

const BUDGET_PRESETS = [100, 250, 500, 1000, 2500];

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
  }, [setMode]);

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

  const selectedCategoryLabel = useMemo(() => {
    return API_CATEGORIES.find((c) => c.value === formData.category)?.label || "Category";
  }, [formData.category]);

  const hasImageAttachment = useMemo(() => {
    return attachments.some((a) => a.type === "image");
  }, [attachments]);

  const checklist = useMemo(() => {
    return {
      title: formData.title.trim().length >= MIN_TITLE_LENGTH,
      category: Boolean(formData.category),
      description: formData.description.trim().length >= MIN_DESCRIPTION_LENGTH,
      image: hasImageAttachment,
      budget: Boolean(formData.budget && parseFloat(formData.budget) >= MIN_BUDGET),
      deadline: Boolean(formData.deadline),
    };
  }, [formData, hasImageAttachment]);

  const allChecksPassed = Object.values(checklist).every(Boolean);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validateOfferForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!hasImageAttachment) {
      setAttachmentError("At least one image is required to publish an offer");
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
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/client/dashboard" className={ICON_BUTTON} title="Back to Dashboard">
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Create Job Offer
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Post your project scope and budget to receive proposals from vetted freelancers
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content (8 Columns) */}
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
                  <p className="text-xs text-text-secondary">Provide a headline and select the industry domain</p>
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
                  <p className="text-xs text-text-secondary">Detail your requirements, goals, and expectations</p>
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
                  placeholder="Describe your project in detail:&#10;• What are the core deliverables?&#10;• What technical skills or background are required?&#10;• Do you have existing designs or APIs ready?"
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
                    <h2 className="text-base font-bold text-text-primary">Visuals & Documents</h2>
                    <p className="text-xs text-text-secondary">
                      Attach mockups, wireframes, or reference files
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full",
                    hasImageAttachment
                      ? "bg-success/15 text-success border border-success/30"
                      : "bg-warning/15 text-warning border border-warning/30"
                  )}
                >
                  {hasImageAttachment ? "Image Included" : "At least 1 image required"}
                </span>
              </div>

              <ImageUpload
                variant="multiple"
                allowedTypes={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]}
                onUpload={handleUpload}
                error={attachmentError || undefined}
              />

              {attachments.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
                  {attachments.map((attachment) => (
                    <AttachmentPreview
                      key={attachment.id}
                      attachment={attachment}
                      onRemove={() => removeAttachment(attachment.id)}
                    />
                  ))}
                </div>
              )}

              <p className="text-xs text-text-secondary">
                {attachments.length} / {MAX_ATTACHMENTS} files attached (PNG, JPG, PDF, DOC up to 10MB each)
              </p>
            </div>
          </div>

          {/* Sticky Sidebar: Budget, Preview & Publish (4 Columns) */}
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
                  <p className="text-xs text-text-secondary">Set your escrow budget and due date</p>
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

                {/* Budget preset chips */}
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
                  placeholder="Select completion deadline"
                />
                {errors.deadline && <p className="text-xs text-error font-medium">{errors.deadline}</p>}
              </div>
            </div>

            {/* Live Job Offer Preview */}
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

            {/* Actions Box */}
            <div className={cn(NEUMORPHIC_CARD, "p-5 space-y-3")}>
              {apiError && (
                <div className="p-3 rounded-xl bg-error/10 text-error text-xs font-medium border border-error/20">
                  {apiError}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading || !allChecksPassed}
                className={cn(PRIMARY_BUTTON, "w-full justify-center text-sm py-3.5 font-bold")}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <LoadingSpinner size="sm" />
                    Publishing Offer...
                  </span>
                ) : (
                  "Publish Job Offer"
                )}
              </button>

              <Link
                href="/app/client/dashboard"
                className={cn(
                  "block w-full py-3 rounded-xl font-medium text-xs text-center",
                  "bg-background text-text-secondary hover:text-text-primary",
                  "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#0a0f1a,-3px_-3px_6px_#1e2a4a]",
                  "hover:shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff] dark:hover:shadow-[1px_1px_3px_#0a0f1a,-1px_-1px_3px_#1e2a4a]",
                  "transition-all duration-200"
                )}
              >
                Cancel & Discard
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

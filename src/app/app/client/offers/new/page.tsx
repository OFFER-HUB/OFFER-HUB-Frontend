"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useModeStore } from "@/stores/mode-store";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INPUT,
  ICON_BUTTON,
  INPUT_ERROR_STYLES,
  PRIMARY_BUTTON,
} from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";

interface Attachment {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "document";
}

interface OfferFormData {
  title: string;
  description: string;
  budget: string;
  category: string;
  deadline: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  budget?: string;
  category?: string;
  deadline?: string;
}

const CATEGORIES = [
  { value: "", label: "Select a category" },
  { value: "web-development", label: "Web Development" },
  { value: "mobile-development", label: "Mobile Development" },
  { value: "design", label: "Design & Creative" },
  { value: "writing", label: "Writing & Translation" },
  { value: "marketing", label: "Marketing & Sales" },
  { value: "video", label: "Video & Animation" },
  { value: "music", label: "Music & Audio" },
  { value: "data", label: "Data & Analytics" },
  { value: "other", label: "Other" },
];

const INITIAL_FORM_DATA: OfferFormData = {
  title: "",
  description: "",
  budget: "",
  category: "",
  deadline: "",
};

const MIN_TITLE_LENGTH = 10;
const MIN_DESCRIPTION_LENGTH = 50;
const MIN_BUDGET = 10;
const MOCK_API_DELAY = 1500;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

function validateOfferForm(formData: OfferFormData): FormErrors {
  const errors: FormErrors = {};

  if (!formData.title.trim()) {
    errors.title = "Title is required";
  } else if (formData.title.length < MIN_TITLE_LENGTH) {
    errors.title = `Title must be at least ${MIN_TITLE_LENGTH} characters`;
  }

  if (!formData.description.trim()) {
    errors.description = "Description is required";
  } else if (formData.description.length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`;
  }

  if (!formData.budget.trim()) {
    errors.budget = "Budget is required";
  } else {
    const budgetNum = parseFloat(formData.budget);
    if (isNaN(budgetNum) || budgetNum < MIN_BUDGET) {
      errors.budget = `Budget must be at least $${MIN_BUDGET}`;
    }
  }

  if (!formData.category) {
    errors.category = "Please select a category";
  }

  if (!formData.deadline) {
    errors.deadline = "Deadline is required";
  } else {
    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate < today) {
      errors.deadline = "Deadline must be in the future";
    }
  }

  return errors;
}

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}

function FormField({
  label,
  error,
  hint,
  optional,
  children,
}: FormFieldProps): React.JSX.Element {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">
        {label}
        {optional && <span className="text-text-secondary font-normal"> (Optional)</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-text-secondary">{hint}</p>}
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove: () => void;
}

function AttachmentPreview({ attachment, onRemove }: AttachmentPreviewProps): React.JSX.Element {
  const iconPath = attachment.type === "image" ? ICON_PATHS.image : ICON_PATHS.document;

  return (
    <div
      className={cn(
        "relative group rounded-xl overflow-hidden",
        "bg-background",
        "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
      )}
    >
      {attachment.type === "image" && attachment.preview ? (
        <div className="aspect-square">
          <img
            src={attachment.preview}
            alt={attachment.file.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square flex flex-col items-center justify-center p-3">
          <Icon path={iconPath} size="xl" className="text-primary mb-2" />
          <p className="text-xs text-text-primary text-center truncate w-full px-1">
            {attachment.file.name.split(".").pop()?.toUpperCase()}
          </p>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2">
        <p className="text-xs text-white truncate">{attachment.file.name}</p>
        <p className="text-xs text-white/70">{formatFileSize(attachment.file.size)}</p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className={cn(
          "absolute top-2 right-2",
          "w-6 h-6 rounded-full",
          "bg-error text-white",
          "flex items-center justify-center",
          "opacity-0 group-hover:opacity-100",
          "transition-opacity duration-200",
          "cursor-pointer"
        )}
      >
        <Icon path={ICON_PATHS.close} size="sm" />
      </button>
    </div>
  );
}

export default function CreateOfferPage(): React.JSX.Element {
  const router = useRouter();
  const { setMode } = useModeStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<OfferFormData>(INITIAL_FORM_DATA);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode("client");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setAttachmentError(null);

    if (attachments.length + files.length > MAX_ATTACHMENTS) {
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

    const validationErrors = validateOfferForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    setIsLoading(false);

    router.push("/app/client/dashboard");
  }

  const today = new Date().toISOString().split("T")[0];
  const canAddMoreFiles = attachments.length < MAX_ATTACHMENTS;

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
                    {CATEGORIES.map((cat) => (
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
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    min={today}
                    className={cn(
                      NEUMORPHIC_INPUT,
                      "cursor-pointer",
                      errors.deadline && INPUT_ERROR_STYLES
                    )}
                  />
                </FormField>
              </div>
            </div>

            <div className={NEUMORPHIC_CARD}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Actions</h2>
              <div className="space-y-3">
                <button type="submit" disabled={isLoading} className={cn(PRIMARY_BUTTON, "w-full justify-center")}>
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

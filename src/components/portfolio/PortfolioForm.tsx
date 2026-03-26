"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INPUT,
  NEUMORPHIC_INSET,
  INPUT_ERROR_STYLES,
} from "@/lib/styles";
import {
  PORTFOLIO_CATEGORY_LABELS,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_IMAGES_PER_ITEM,
  MAX_TAGS,
  MAX_TAG_LENGTH,
  type PortfolioFormData,
  type PortfolioFormErrors,
  type PortfolioCategory,
} from "@/types/portfolio.types";
import { MAX_FILE_SIZE } from "@/data/portfolio.data";

// ─── Tip content ──────────────────────────────────────────────────────────────

const PORTFOLIO_TIPS = [
  "Add a high-quality thumbnail — it's the first thing clients see.",
  "Describe the problem you solved, not just what you built.",
  "Include measurable outcomes: 'increased conversion by 30%'.",
  "Tag your projects well to surface them in the right searches.",
  "Public projects are visible on your profile; keep private ones for drafts.",
];

// ─── Validation ───────────────────────────────────────────────────────────────

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validatePortfolioForm(data: PortfolioFormData): PortfolioFormErrors {
  const errors: PortfolioFormErrors = {};

  if (!data.title.trim()) {
    errors.title = "Title is required";
  } else if (data.title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
  }

  if (data.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
  }

  if (data.projectUrl && !isValidUrl(data.projectUrl)) {
    errors.projectUrl = "Please enter a valid URL (e.g. https://example.com)";
  }

  if (data.repoUrl && !isValidUrl(data.repoUrl)) {
    errors.repoUrl = "Please enter a valid URL (e.g. https://github.com/...)";
  }

  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    errors.endDate = "End date must be after start date";
  }

  return errors;
}

// ─── Default form data ────────────────────────────────────────────────────────

export const INITIAL_FORM_DATA: PortfolioFormData = {
  title: "",
  description: "",
  category: "web_development",
  tags: [],
  images: [],
  projectUrl: "",
  repoUrl: "",
  startDate: "",
  endDate: "",
  isPublic: true,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function FormField({ label, required, error, hint, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">
        {label}
        {required && <span className="text-error ml-1">*</span>}
        {hint && <span className="ml-1 text-xs text-text-secondary font-normal">({hint})</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-error flex items-center gap-1">
          <Icon path={ICON_PATHS.alertCircle} size="sm" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Preview panel ────────────────────────────────────────────────────────────

interface PreviewPanelProps {
  data: PortfolioFormData;
}

function PreviewPanel({ data }: PreviewPanelProps) {
  return (
    <div className={cn(NEUMORPHIC_CARD, "overflow-hidden p-0")}>
      {/* Thumbnail */}
      <div className="relative h-40 bg-gray-100">
        {data.images.length > 0 ? (
          <img
            src={data.images[0]}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon path={ICON_PATHS.image} size="xl" className="text-gray-300" />
          </div>
        )}
        <span
          className={cn(
            "absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded-lg",
            data.isPublic ? "bg-success/90 text-white" : "bg-black/60 text-white"
          )}
        >
          {data.isPublic ? "Public" : "Private"}
        </span>
      </div>

      <div className="p-4 space-y-2">
        {data.category && (
          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {PORTFOLIO_CATEGORY_LABELS[data.category]}
          </span>
        )}
        <h3 className="font-semibold text-text-primary text-sm line-clamp-1">
          {data.title || <span className="text-text-secondary italic">Project title</span>}
        </h3>
        <p className="text-xs text-text-secondary line-clamp-3">
          {data.description || <span className="italic">Description will appear here...</span>}
        </p>
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {data.tags.slice(0, 4).map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tag input ────────────────────────────────────────────────────────────────

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  error?: string;
}

function TagInput({ tags, onChange, error }: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(value: string) {
    const trimmed = value.trim().replace(/,/g, "");
    if (!trimmed || tags.length >= MAX_TAGS || tags.includes(trimmed)) return;
    if (trimmed.length > MAX_TAG_LENGTH) return;
    onChange([...tags, trimmed]);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div>
      <div
        className={cn(
          NEUMORPHIC_INPUT,
          "flex flex-wrap gap-1.5 cursor-text min-h-[46px] h-auto py-2",
          error && INPUT_ERROR_STYLES
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-error transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              <Icon path={ICON_PATHS.close} size="sm" />
            </button>
          </span>
        ))}
        {tags.length < MAX_TAGS && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(input)}
            placeholder={tags.length === 0 ? "Type a tag and press Enter..." : ""}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-text-primary placeholder:text-text-secondary/60"
          />
        )}
      </div>
      <p className="mt-1 text-xs text-text-secondary">
        {tags.length}/{MAX_TAGS} tags · Press Enter or comma to add
      </p>
    </div>
  );
}

// ─── Main form component ──────────────────────────────────────────────────────

export interface PortfolioFormProps {
  initialData?: PortfolioFormData;
  isEditing?: boolean;
  isLoading?: boolean;
  onSubmit: (data: PortfolioFormData) => Promise<void>;
  onCancel: () => void;
}

export function PortfolioForm({
  initialData = INITIAL_FORM_DATA,
  isEditing = false,
  isLoading = false,
  onSubmit,
  onCancel,
}: PortfolioFormProps): React.JSX.Element {
  const [formData, setFormData] = useState<PortfolioFormData>(initialData);
  const [errors, setErrors] = useState<PortfolioFormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [activeTip] = useState(() => Math.floor(Math.random() * PORTFOLIO_TIPS.length));

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name as keyof PortfolioFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleUpload(files: File[]) {
    const remaining = MAX_IMAGES_PER_ITEM - formData.images.length;
    files.slice(0, remaining).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
  }

  function handleRemoveImage(index: number) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validatePortfolioForm(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await onSubmit(formData);
  }

  const FILLED_PRIMARY = cn(
    "px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2",
    "bg-primary text-white",
    "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
    "hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
  );

  const SECONDARY = cn(
    "px-5 py-2.5 rounded-xl font-medium text-sm",
    "bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
    "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
    "text-text-secondary transition-all duration-200"
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* ── Form ── */}
      <div className="xl:col-span-2">
        <form onSubmit={handleSubmit} className={cn(NEUMORPHIC_CARD, "space-y-5")}>
          <h2 className="text-lg font-semibold text-text-primary">
            {isEditing ? "Edit Project" : "Add New Project"}
          </h2>

          {/* Tip banner */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Icon path={ICON_PATHS.infoCircle} size="md" className="text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-primary">{PORTFOLIO_TIPS[activeTip]}</p>
          </div>

          {/* Title */}
          <FormField label="Title" required error={errors.title}>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={cn(NEUMORPHIC_INPUT, errors.title && INPUT_ERROR_STYLES)}
              placeholder="e.g. E-Commerce Platform Redesign"
              maxLength={MAX_TITLE_LENGTH}
            />
            <p className="mt-1 text-xs text-text-secondary text-right">
              {formData.title.length}/{MAX_TITLE_LENGTH}
            </p>
          </FormField>

          {/* Description */}
          <FormField label="Description" error={errors.description}>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={cn(NEUMORPHIC_INPUT, "resize-none", errors.description && INPUT_ERROR_STYLES)}
              placeholder="Describe the project, what problem it solved, and the outcome..."
            />
            <p className="mt-1 text-xs text-text-secondary text-right">
              {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
            </p>
          </FormField>

          {/* Category */}
          <FormField label="Category" required error={errors.category}>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={cn(NEUMORPHIC_INPUT, "appearance-none pr-10 cursor-pointer")}
              >
                {(Object.keys(PORTFOLIO_CATEGORY_LABELS) as PortfolioCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {PORTFOLIO_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                <Icon path={ICON_PATHS.chevronDown} size="sm" />
              </span>
            </div>
          </FormField>

          {/* Tags */}
          <FormField label="Tags" hint={`up to ${MAX_TAGS}`} error={errors.tags}>
            <TagInput
              tags={formData.tags}
              onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
              error={errors.tags}
            />
          </FormField>

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Project URL" error={errors.projectUrl} hint="live demo">
              <input
                type="url"
                name="projectUrl"
                value={formData.projectUrl}
                onChange={handleChange}
                className={cn(NEUMORPHIC_INPUT, errors.projectUrl && INPUT_ERROR_STYLES)}
                placeholder="https://example.com"
              />
            </FormField>
            <FormField label="Repository URL" error={errors.repoUrl} hint="optional">
              <input
                type="url"
                name="repoUrl"
                value={formData.repoUrl}
                onChange={handleChange}
                className={cn(NEUMORPHIC_INPUT, errors.repoUrl && INPUT_ERROR_STYLES)}
                placeholder="https://github.com/..."
              />
            </FormField>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Start Date" error={errors.startDate} hint="optional">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                  <Icon path={ICON_PATHS.calendar} size="sm" />
                </span>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={cn(NEUMORPHIC_INPUT, "pl-10", errors.startDate && INPUT_ERROR_STYLES)}
                />
              </div>
            </FormField>
            <FormField label="End Date" error={errors.endDate} hint="leave blank if ongoing">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                  <Icon path={ICON_PATHS.calendar} size="sm" />
                </span>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={cn(NEUMORPHIC_INPUT, "pl-10", errors.endDate && INPUT_ERROR_STYLES)}
                />
              </div>
            </FormField>
          </div>

          {/* Images */}
          <FormField label="Images" hint={`up to ${MAX_IMAGES_PER_ITEM}`} error={errors.images}>
            <ImageUpload
              variant="multiple"
              label={`Upload images (${formData.images.length}/${MAX_IMAGES_PER_ITEM})`}
              onUpload={handleUpload}
              error={errors.images}
            />
            {formData.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon path={ICON_PATHS.close} size="sm" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-black/50 text-white rounded-b-lg py-0.5">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </FormField>

          {/* Public toggle */}
          <div className={cn("flex items-center justify-between p-4 rounded-xl", NEUMORPHIC_INSET)}>
            <div>
              <p className="text-sm font-medium text-text-primary">Visible on public profile</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {formData.isPublic
                  ? "This project is visible to clients browsing your profile."
                  : "This project is hidden from your public profile."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.isPublic}
              onClick={() => setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
                formData.isPublic ? "bg-primary" : "bg-gray-300"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                  formData.isPublic ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className={cn(SECONDARY, "flex items-center gap-2 xl:hidden")}
            >
              <Icon path={ICON_PATHS.eye} size="sm" />
              {showPreview ? "Hide Preview" : "Preview"}
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <button type="button" onClick={onCancel} disabled={isLoading} className={SECONDARY}>
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className={FILLED_PRIMARY}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    {isEditing ? "Saving..." : "Adding..."}
                  </>
                ) : (
                  <>
                    <Icon path={isEditing ? ICON_PATHS.check : ICON_PATHS.plus} size="sm" />
                    {isEditing ? "Save Changes" : "Add Project"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Preview sidebar ── */}
      <div className={cn("space-y-4", !showPreview && "hidden xl:block")}>
        <div className={cn(NEUMORPHIC_CARD)}>
          <p className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Icon path={ICON_PATHS.eye} size="sm" className="text-text-secondary" />
            Card Preview
          </p>
          <PreviewPanel data={formData} />
        </div>

        {/* Tips list */}
        <div className={cn(NEUMORPHIC_CARD, "space-y-2")}>
          <p className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Icon path={ICON_PATHS.infoCircle} size="sm" className="text-primary" />
            Portfolio Tips
          </p>
          {PORTFOLIO_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <p className="text-xs text-text-secondary">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

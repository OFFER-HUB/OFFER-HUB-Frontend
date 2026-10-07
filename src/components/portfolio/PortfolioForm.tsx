"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/auth-store";
import { ImageUploader } from "@/components/portfolio/ImageUploader";
import { ImageGallery } from "@/components/portfolio/ImageGallery";
import { TagInput } from "@/components/portfolio/TagInput";
import {
  usePortfolioForm,
  isValidUrl,
  validatePortfolioForm,
  INITIAL_FORM_DATA,
} from "@/hooks/usePortfolioForm";
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
  type PortfolioFormData,
  type PortfolioCategory,
} from "@/types/portfolio.types";

export { isValidUrl, validatePortfolioForm, INITIAL_FORM_DATA };

// ─── Tip content ──────────────────────────────────────────────────────────────

const PORTFOLIO_TIPS = [
  "Add a high-quality thumbnail — it's the first thing clients see.",
  "Describe the problem you solved, not just what you built.",
  "Include measurable outcomes: 'increased conversion by 30%'.",
  "Tag your projects well to surface them in the right searches.",
  "Public projects are visible on your profile; keep private ones for drafts.",
];

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
            src={data.images[0].url}
            alt={data.images[0].caption || "Preview"}
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
  const { token } = useAuthStore();
  const [showPreview, setShowPreview] = useState(false);
  const [activeTip, setActiveTip] = useState(0);

  const {
    formData,
    setFormData,
    errors,
    handleChange,
    handleImagesAdded,
    handleRemoveImage,
    handleReorder,
    handleCaptionChange,
    handleSubmit,
  } = usePortfolioForm(initialData, onSubmit);

  useEffect(() => {
    setActiveTip(Math.floor(Math.random() * PORTFOLIO_TIPS.length));
  }, []);

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
          <FormField
            label="Images"
            required
            hint={`${formData.images.length}/${MAX_IMAGES_PER_ITEM} · drag to reorder`}
            error={errors.images}
          >
            <ImageUploader
              token={token}
              maxTotal={MAX_IMAGES_PER_ITEM}
              currentCount={formData.images.length}
              onImagesAdded={handleImagesAdded}
              error={errors.images}
              disabled={isLoading}
            />
            <ImageGallery
              images={formData.images}
              onReorder={handleReorder}
              onRemove={handleRemoveImage}
              onCaptionChange={handleCaptionChange}
              disabled={isLoading}
              className="mt-4"
            />
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

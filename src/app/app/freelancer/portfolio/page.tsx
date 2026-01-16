"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INPUT,
  INPUT_ERROR_STYLES,
  PRIMARY_BUTTON,
  ICON_BUTTON,
} from "@/lib/styles";
import {
  MOCK_PORTFOLIO_ITEMS,
  MAX_IMAGES_PER_ITEM,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
} from "@/data/portfolio.data";
import type {
  PortfolioItem,
  PortfolioFormData,
  PortfolioFormErrors,
} from "@/types/portfolio.types";

const MOCK_API_DELAY = 1000;
const SUCCESS_MESSAGE_DURATION = 3000;

const SECONDARY_BUTTON_STYLES = cn(
  "px-4 py-2 text-sm font-medium rounded-xl",
  "bg-background text-text-primary",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
  "transition-all duration-200 cursor-pointer"
);

const DANGER_BUTTON_STYLES = cn(
  "px-3 py-2 text-sm font-medium rounded-xl",
  "bg-error/10 text-error",
  "hover:bg-error/20",
  "transition-all duration-200 cursor-pointer"
);

const INITIAL_FORM_DATA: PortfolioFormData = {
  title: "",
  description: "",
  images: [],
  link: "",
};

function validateForm(data: PortfolioFormData): PortfolioFormErrors {
  const errors: PortfolioFormErrors = {};

  if (!data.title.trim()) {
    errors.title = "Title is required";
  } else if (data.title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
  }

  if (data.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
  }

  if (data.link && !isValidUrl(data.link)) {
    errors.link = "Please enter a valid URL";
  }

  return errors;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

interface PortfolioCardProps {
  item: PortfolioItem;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function PortfolioCard({
  item,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: PortfolioCardProps): React.JSX.Element {
  return (
    <div className={cn(NEUMORPHIC_CARD, "overflow-hidden p-0")}>
      {item.images.length > 0 ? (
        <div className="relative h-48 bg-gray-100">
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          {item.images.length > 1 && (
            <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg">
              +{item.images.length - 1} more
            </span>
          )}
        </div>
      ) : (
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <Icon path={ICON_PATHS.image} size="xl" className="text-gray-300" />
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-text-primary mb-1 line-clamp-1">
          {item.title}
        </h3>
        <p className="text-sm text-text-secondary line-clamp-2 mb-3">
          {item.description || "No description"}
        </p>

        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover mb-3"
          >
            <Icon path={ICON_PATHS.externalLink} size="sm" />
            View Project
          </a>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border-light">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isFirst}
              className={cn(
                ICON_BUTTON,
                "w-8 h-8",
                isFirst && "opacity-40 cursor-not-allowed"
              )}
              title="Move up"
            >
              <Icon path={ICON_PATHS.arrowUp} size="sm" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isLast}
              className={cn(
                ICON_BUTTON,
                "w-8 h-8",
                isLast && "opacity-40 cursor-not-allowed"
              )}
              title="Move down"
            >
              <Icon path={ICON_PATHS.arrowDown} size="sm" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className={cn(ICON_BUTTON, "w-8 h-8")}
              title="Edit"
            >
              <Icon path={ICON_PATHS.edit} size="sm" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className={cn(
                ICON_BUTTON,
                "w-8 h-8 text-error hover:bg-error/10"
              )}
              title="Delete"
            >
              <Icon path={ICON_PATHS.trash} size="sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PortfolioFormProps {
  formData: PortfolioFormData;
  errors: PortfolioFormErrors;
  isEditing: boolean;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onCancel: () => void;
}

function PortfolioForm({
  formData,
  errors,
  isEditing,
  isLoading,
  onSubmit,
  onChange,
  onImageUpload,
  onRemoveImage,
  onCancel,
}: PortfolioFormProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn(NEUMORPHIC_CARD, "mb-6")}>
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        {isEditing ? "Edit Project" : "Add New Project"}
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Title <span className="text-error">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            className={cn(NEUMORPHIC_INPUT, errors.title && INPUT_ERROR_STYLES)}
            placeholder="Project title"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-error">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            rows={3}
            className={cn(
              NEUMORPHIC_INPUT,
              "resize-none",
              errors.description && INPUT_ERROR_STYLES
            )}
            placeholder="Describe your project..."
          />
          <div className="flex justify-between mt-1">
            {errors.description && (
              <p className="text-xs text-error">{errors.description}</p>
            )}
            <p className="text-xs text-text-secondary ml-auto">
              {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Project Link
          </label>
          <input
            type="url"
            name="link"
            value={formData.link}
            onChange={onChange}
            className={cn(NEUMORPHIC_INPUT, errors.link && INPUT_ERROR_STYLES)}
            placeholder="https://example.com/project"
          />
          {errors.link && (
            <p className="mt-1 text-xs text-error">{errors.link}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Images ({formData.images.length}/{MAX_IMAGES_PER_ITEM})
          </label>

          {formData.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Icon path={ICON_PATHS.close} size="sm" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {formData.images.length < MAX_IMAGES_PER_ITEM && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                onChange={onImageUpload}
                className="hidden"
                multiple
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  SECONDARY_BUTTON_STYLES,
                  "flex items-center gap-2"
                )}
              >
                <Icon path={ICON_PATHS.upload} size="sm" />
                Upload Images
              </button>
              <p className="mt-1 text-xs text-text-secondary">
                JPG, PNG, GIF or WebP. Max {MAX_FILE_SIZE / 1024 / 1024}MB each.
              </p>
            </>
          )}
          {errors.images && (
            <p className="mt-1 text-xs text-error">{errors.images}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className={SECONDARY_BUTTON_STYLES}>
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className={PRIMARY_BUTTON}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner />
                {isEditing ? "Saving..." : "Adding..."}
              </span>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Add Project"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

interface DeleteConfirmModalProps {
  itemTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({
  itemTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={cn(NEUMORPHIC_CARD, "max-w-md w-full mx-4")}>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Delete Project
        </h3>
        <p className="text-text-secondary mb-4">
          Are you sure you want to delete &quot;{itemTitle}&quot;? This action cannot be
          undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel} className={SECONDARY_BUTTON_STYLES}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className={DANGER_BUTTON_STYLES}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage(): React.JSX.Element {
  const [items, setItems] = useState<PortfolioItem[]>(MOCK_PORTFOLIO_ITEMS);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState<PortfolioFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<PortfolioFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function showSuccessNotification(message: string): void {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), SUCCESS_MESSAGE_DURATION);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof PortfolioFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>): void {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_IMAGES_PER_ITEM - formData.images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          images: "Invalid file type. Please upload JPG, PNG, GIF or WebP.",
        }));
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          images: `File too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  }

  function handleRemoveImage(index: number): void {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function handleEdit(item: PortfolioItem): void {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      images: item.images,
      link: item.link || "",
    });
    setShowForm(true);
    setErrors({});
  }

  function handleCancelForm(): void {
    setShowForm(false);
    setEditingItem(null);
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));

    if (editingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                title: formData.title,
                description: formData.description,
                images: formData.images,
                link: formData.link || undefined,
              }
            : item
        )
      );
      showSuccessNotification("Project updated successfully!");
    } else {
      const newItem: PortfolioItem = {
        id: generateId(),
        title: formData.title,
        description: formData.description,
        images: formData.images,
        link: formData.link || undefined,
        order: items.length,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setItems((prev) => [...prev, newItem]);
      showSuccessNotification("Project added successfully!");
    }

    setIsLoading(false);
    handleCancelForm();
  }

  function handleDeleteConfirm(): void {
    if (!deleteItem) return;
    setItems((prev) => prev.filter((item) => item.id !== deleteItem.id));
    setDeleteItem(null);
    showSuccessNotification("Project deleted successfully!");
  }

  function handleMoveUp(index: number): void {
    if (index === 0) return;
    setItems((prev) => {
      const newItems = [...prev];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      return newItems.map((item, i) => ({ ...item, order: i }));
    });
  }

  function handleMoveDown(index: number): void {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const newItems = [...prev];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      return newItems.map((item, i) => ({ ...item, order: i }));
    });
  }

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Portfolio</h1>
          <p className="text-text-secondary text-sm">
            Showcase your best work to attract clients
          </p>
        </div>
        <div className="flex items-center gap-3">
          {showSuccess && (
            <div
              className={cn(
                "px-4 py-2 rounded-xl",
                "bg-success/10 border border-success/20",
                "animate-scale-in"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon path={ICON_PATHS.check} size="sm" className="text-success" />
                <p className="text-sm text-success font-medium">{successMessage}</p>
              </div>
            </div>
          )}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className={cn(PRIMARY_BUTTON, "flex items-center gap-2")}
            >
              <Icon path={ICON_PATHS.plus} size="sm" />
              Add Project
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <PortfolioForm
          formData={formData}
          errors={errors}
          isEditing={!!editingItem}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onImageUpload={handleImageUpload}
          onRemoveImage={handleRemoveImage}
          onCancel={handleCancelForm}
        />
      )}

      {sortedItems.length === 0 ? (
        <div className={cn(NEUMORPHIC_CARD, "text-center py-12")}>
          <Icon
            path={ICON_PATHS.image}
            size="xl"
            className="text-gray-300 mx-auto mb-4"
          />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No projects yet
          </h3>
          <p className="text-text-secondary mb-4">
            Start building your portfolio by adding your first project.
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className={cn(PRIMARY_BUTTON, "inline-flex items-center gap-2")}
            >
              <Icon path={ICON_PATHS.plus} size="sm" />
              Add Your First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedItems.map((item, index) => (
            <PortfolioCard
              key={item.id}
              item={item}
              isFirst={index === 0}
              isLast={index === sortedItems.length - 1}
              onEdit={() => handleEdit(item)}
              onDelete={() => setDeleteItem(item)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
            />
          ))}
        </div>
      )}

      {deleteItem && (
        <DeleteConfirmModal
          itemTitle={deleteItem.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteItem(null)}
        />
      )}
    </div>
  );
}

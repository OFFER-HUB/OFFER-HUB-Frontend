"use client";

import { useState, useCallback } from "react";
import {
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_IMAGES_PER_ITEM,
  type PortfolioFormData,
  type PortfolioFormErrors,
  type PortfolioImageEntry,
} from "@/types/portfolio.types";

export function isValidUrl(url: string): boolean {
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

  if (!data.images || data.images.length === 0) {
    errors.images = "At least one image is required";
  }

  return errors;
}

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

export function usePortfolioForm(
  initialData: PortfolioFormData = INITIAL_FORM_DATA,
  onSubmit?: (data: PortfolioFormData) => Promise<void>
) {
  const [formData, setFormData] = useState<PortfolioFormData>(initialData);
  const [errors, setErrors] = useState<PortfolioFormErrors>({});

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
      if (errors[name as keyof PortfolioFormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const handleImagesAdded = useCallback((entries: PortfolioImageEntry[]) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...entries].slice(0, MAX_IMAGES_PER_ITEM),
    }));
    setErrors((e) => ({ ...e, images: undefined }));
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setFormData((prev) => {
      const next = [...prev.images];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return { ...prev, images: next };
    });
  }, []);

  const handleCaptionChange = useCallback((index: number, caption: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((im, i) => (i === index ? { ...im, caption } : im)),
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const errs = validatePortfolioForm(formData);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
      if (onSubmit) {
        await onSubmit(formData);
      }
    },
    [formData, onSubmit]
  );

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    handleChange,
    handleImagesAdded,
    handleRemoveImage,
    handleReorder,
    handleCaptionChange,
    handleSubmit,
    validate: () => validatePortfolioForm(formData),
  };
}

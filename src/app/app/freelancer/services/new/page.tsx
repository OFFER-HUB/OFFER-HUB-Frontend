"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  SERVICE_CATEGORIES,
  MIN_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MIN_PRICE,
  MIN_DELIVERY_DAYS,
  MAX_DELIVERY_DAYS,
} from "@/data/service.data";
import type { ServiceFormData, ServiceFormErrors } from "@/types/service.types";

const MOCK_API_DELAY = 1500;

const INITIAL_FORM_DATA: ServiceFormData = {
  title: "",
  description: "",
  category: "",
  price: 0,
  deliveryDays: 1,
};

function validateForm(data: ServiceFormData): ServiceFormErrors {
  const errors: ServiceFormErrors = {};

  if (!data.title.trim()) {
    errors.title = "Title is required";
  } else if (data.title.trim().length < MIN_TITLE_LENGTH) {
    errors.title = `Title must be at least ${MIN_TITLE_LENGTH} characters`;
  }

  if (!data.description.trim()) {
    errors.description = "Description is required";
  } else if (data.description.trim().length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`;
  } else if (data.description.trim().length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
  }

  if (!data.category) {
    errors.category = "Please select a category";
  }

  if (!data.price || data.price < MIN_PRICE) {
    errors.price = `Price must be at least $${MIN_PRICE}`;
  }

  if (!data.deliveryDays || data.deliveryDays < MIN_DELIVERY_DAYS) {
    errors.deliveryDays = `Delivery time must be at least ${MIN_DELIVERY_DAYS} day`;
  } else if (data.deliveryDays > MAX_DELIVERY_DAYS) {
    errors.deliveryDays = `Delivery time cannot exceed ${MAX_DELIVERY_DAYS} days`;
  }

  return errors;
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, required, error, children }: FormFieldProps): React.JSX.Element {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

export default function CreateServicePage(): React.JSX.Element {
  const router = useRouter();
  const [formData, setFormData] = useState<ServiceFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "deliveryDays" ? Number(value) || 0 : value,
    }));
    if (errors[name as keyof ServiceFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
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
    setIsLoading(false);
    router.push("/app/freelancer/services");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/app/freelancer/services" className={ICON_BUTTON}>
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Create New Service</h1>
          <p className="text-text-secondary text-sm">
            Define your service offering to attract clients
          </p>
        </div>
      </div>

      <div className={NEUMORPHIC_CARD}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Service Title" required error={errors.title}>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={cn(NEUMORPHIC_INPUT, errors.title && INPUT_ERROR_STYLES)}
              placeholder="e.g., Professional Web Development Services"
            />
            <p className="mt-1 text-xs text-text-secondary">
              {formData.title.length}/{MIN_TITLE_LENGTH} min characters
            </p>
          </FormField>

          <FormField label="Category" required error={errors.category}>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={cn(
                NEUMORPHIC_INPUT,
                "cursor-pointer",
                errors.category && INPUT_ERROR_STYLES,
                !formData.category && "text-text-secondary"
              )}
            >
              <option value="">Select a category</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Description" required error={errors.description}>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={cn(
                NEUMORPHIC_INPUT,
                "resize-none",
                errors.description && INPUT_ERROR_STYLES
              )}
              placeholder="Describe your service in detail. What do you offer? What makes your service unique? What will the client receive?"
            />
            <p className="mt-1 text-xs text-text-secondary">
              {formData.description.length}/{MIN_DESCRIPTION_LENGTH} min, {MAX_DESCRIPTION_LENGTH} max characters
            </p>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Price (USD)" required error={errors.price}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                  $
                </span>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleChange}
                  min={MIN_PRICE}
                  className={cn(
                    NEUMORPHIC_INPUT,
                    "pl-8",
                    errors.price && INPUT_ERROR_STYLES
                  )}
                  placeholder="0"
                />
              </div>
            </FormField>

            <FormField label="Delivery Time (days)" required error={errors.deliveryDays}>
              <div className="relative">
                <input
                  type="number"
                  name="deliveryDays"
                  value={formData.deliveryDays || ""}
                  onChange={handleChange}
                  min={MIN_DELIVERY_DAYS}
                  max={MAX_DELIVERY_DAYS}
                  className={cn(
                    NEUMORPHIC_INPUT,
                    errors.deliveryDays && INPUT_ERROR_STYLES
                  )}
                  placeholder="1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                  {formData.deliveryDays === 1 ? "day" : "days"}
                </span>
              </div>
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light">
            <Link
              href="/app/freelancer/services"
              className={cn(
                "px-6 py-3 rounded-xl font-medium",
                "bg-background text-text-primary",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                "transition-all duration-200"
              )}
            >
              Cancel
            </Link>
            <button type="submit" disabled={isLoading} className={PRIMARY_BUTTON}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  Creating...
                </span>
              ) : (
                "Create Service"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INPUT, INPUT_ERROR_STYLES, PRIMARY_BUTTON, ICON_BUTTON } from "@/lib/styles";
import {
  SERVICE_CATEGORIES,
  MIN_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MIN_PRICE,
  MIN_DELIVERY_DAYS,
  MAX_DELIVERY_DAYS,
} from "@/data/service.data";
import { getServiceById, updateService } from "@/lib/api/services";
import { useAuthStore } from "@/stores/auth-store";
import type { Service, ServiceFormData, ServiceFormErrors } from "@/types/service.types";

interface PageProps {
  params: Promise<{ id: string }>;
}

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

export default function EditServicePage({ params }: PageProps): React.JSX.Element {
  const { id } = use(params);
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [isFetchingService, setIsFetchingService] = useState(true);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    description: "",
    category: "",
    price: 0,
    deliveryDays: 1,
  });

  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    useAuthStore.persist.rehydrate();

    setTimeout(() => {
      setHydrated(true);
      setMounted(true);
    }, 100);
  }, []);

  useEffect(() => {
    if (!mounted || !hydrated) return;

    if (token) {
      getServiceById(token, id)
        .then((data) => {
          setService(data);
          setFormData({
            title: data.title,
            description: data.description,
            category: data.category,
            price: parseFloat(data.price),
            deliveryDays: data.deliveryDays,
          });
        })
        .catch((error) => {
          console.error('Failed to fetch service:', error);
        })
        .finally(() => {
          setIsFetchingService(false);
        });
    } else {
      setIsFetchingService(false);
    }
  }, [mounted, hydrated, token, id]);

  const detailHref = `/app/freelancer/services/${id}`;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void {
    const { name, value } = e.target;

    const nextData: ServiceFormData = {
      ...formData,
      [name]: name === "price" || name === "deliveryDays" ? Number(value) || 0 : value,
    } as ServiceFormData;

    setFormData(nextData);

    const validationErrors = validateForm(nextData);
    setErrors((prev) => ({
      ...prev,
      [name]: validationErrors[name as keyof ServiceFormErrors],
    }));
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!token) {
      setErrors({ title: "Authentication required" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert form data to API payload format
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        price: formData.price.toFixed(2), // Convert number to decimal string
        deliveryDays: formData.deliveryDays,
      };

      await updateService(token, id, payload);
      router.push(`${detailHref}?updated=true`);
    } catch (error) {
      console.error('Failed to update service:', error);
      setErrors({ title: 'Failed to update service. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading state while fetching service
  if (isFetchingService) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
        </div>
        <div className={cn(NEUMORPHIC_CARD, "p-6 space-y-5 animate-pulse")}>
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Show not found if service doesn't exist after loading
  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className={cn(NEUMORPHIC_CARD, "text-center max-w-md")}>
          <div
            className={cn(
              "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center",
              "bg-background",
              "shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
            )}
          >
            <Icon path={ICON_PATHS.briefcase} size="xl" className="text-text-secondary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Service not found</h2>
          <p className="text-text-secondary mb-4">
            The service you are trying to edit does not exist or has been removed.
          </p>
          <button
            type="button"
            onClick={() => router.push("/app/freelancer/services")}
            className={PRIMARY_BUTTON}
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <Link href={detailHref} className={ICON_BUTTON}>
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Edit Service</h1>
          <p className="text-text-secondary text-sm">Update your service offering details</p>
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
              className={cn(NEUMORPHIC_INPUT, "resize-none", errors.description && INPUT_ERROR_STYLES)}
              placeholder="Describe your service in detail. What do you offer? What makes your service unique? What will the client receive?"
            />
            <p className="mt-1 text-xs text-text-secondary">
              {formData.description.length}/{MIN_DESCRIPTION_LENGTH} min, {MAX_DESCRIPTION_LENGTH} max characters
            </p>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Price (USD)" required error={errors.price}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleChange}
                  min={MIN_PRICE}
                  className={cn(NEUMORPHIC_INPUT, "pl-8", errors.price && INPUT_ERROR_STYLES)}
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
                  className={cn(NEUMORPHIC_INPUT, errors.deliveryDays && INPUT_ERROR_STYLES)}
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
              href={detailHref}
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

            <button type="submit" disabled={isSubmitting} className={PRIMARY_BUTTON}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { use, useState, useEffect, useMemo } from "react";
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
import { getServiceById, updateService } from "@/lib/api/services";
import { useAuthStore } from "@/stores/auth-store";
import type { Service, ServiceFormData, ServiceFormErrors } from "@/types/service.types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const PRICE_PRESETS = [25, 50, 100, 250, 500, 1000];
const DELIVERY_PRESETS = [
  { days: 1, label: "1 day (Express)" },
  { days: 3, label: "3 days" },
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
];

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

export default function EditServicePage({ params }: PageProps): React.JSX.Element {
  const { id } = use(params);
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

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
    if (!hasHydrated) return;

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
          console.error("Failed to fetch service:", error);
        })
        .finally(() => {
          setIsFetchingService(false);
        });
    } else {
      setIsFetchingService(false);
    }
  }, [hasHydrated, token, id]);

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

  const selectedCategoryLabel = useMemo(() => {
    return SERVICE_CATEGORIES.find((c) => c.value === formData.category)?.label || "Select Category";
  }, [formData.category]);

  const checklist = useMemo(() => {
    return {
      title: formData.title.trim().length >= MIN_TITLE_LENGTH,
      category: Boolean(formData.category),
      description:
        formData.description.trim().length >= MIN_DESCRIPTION_LENGTH &&
        formData.description.trim().length <= MAX_DESCRIPTION_LENGTH,
      price: formData.price >= MIN_PRICE,
      delivery: formData.deliveryDays >= MIN_DELIVERY_DAYS && formData.deliveryDays <= MAX_DELIVERY_DAYS,
    };
  }, [formData]);

  const allChecksPassed = Object.values(checklist).every(Boolean);

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
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category as any,
        price: formData.price.toFixed(2),
        deliveryDays: formData.deliveryDays,
      };

      await updateService(token, id, payload);
      router.push(`${detailHref}?updated=true`);
    } catch (error) {
      console.error("Failed to update service:", error);
      setErrors({ title: "Failed to update service. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isFetchingService) {
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

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className={cn(NEUMORPHIC_CARD, "text-center max-w-md p-8 space-y-4")}>
          <div
            className={cn(
              "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center bg-background text-text-secondary",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
            )}
          >
            <Icon path={ICON_PATHS.briefcase} size="xl" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Service Not Found</h2>
          <p className="text-xs text-text-secondary">
            The service you are attempting to edit does not exist or has already been removed.
          </p>
          <button
            type="button"
            onClick={() => router.push("/app/freelancer/services")}
            className={cn(PRIMARY_BUTTON, "w-full justify-center")}
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={detailHref} className={ICON_BUTTON} title="Back to Service Details">
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Edit Service
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Update your service offering details, pricing, and turnaround
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Fields (8 Columns) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 min-w-0">
            {/* General Info Card */}
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
                  <h2 className="text-base font-bold text-text-primary">General Information</h2>
                  <p className="text-xs text-text-secondary">Keep your title attractive and relevant</p>
                </div>
              </div>

              {/* Title Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="service-title" className="text-sm font-semibold text-text-primary">
                    Service Title <span className="text-error">*</span>
                  </label>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      formData.title.length < MIN_TITLE_LENGTH
                        ? "text-text-secondary"
                        : "text-success"
                    )}
                  >
                    {formData.title.length}/{MIN_TITLE_LENGTH} min chars
                  </span>
                </div>
                <input
                  id="service-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={cn(NEUMORPHIC_INPUT, errors.title && INPUT_ERROR_STYLES)}
                  placeholder="e.g., Professional Next.js Web Development & Redesign"
                />
                {errors.title && <p className="mt-1.5 text-xs text-error font-medium">{errors.title}</p>}
              </div>

              {/* Category Field */}
              <div>
                <label htmlFor="service-category" className="block text-sm font-semibold text-text-primary mb-1.5">
                  Category <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="service-category"
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
                    <option value="">Select a professional category</option>
                    {SERVICE_CATEGORIES.map((cat) => (
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
                  <h2 className="text-base font-bold text-text-primary">Service Scope & Details</h2>
                  <p className="text-xs text-text-secondary">Provide clear expectations and deliverable items</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="service-description" className="text-sm font-semibold text-text-primary">
                    Detailed Description <span className="text-error">*</span>
                  </label>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      formData.description.length < MIN_DESCRIPTION_LENGTH
                        ? "text-text-secondary"
                        : formData.description.length > MAX_DESCRIPTION_LENGTH
                        ? "text-error"
                        : "text-success"
                    )}
                  >
                    {formData.description.length} / {MIN_DESCRIPTION_LENGTH} min ({MAX_DESCRIPTION_LENGTH} max)
                  </span>
                </div>
                <textarea
                  id="service-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className={cn(
                    NEUMORPHIC_INPUT,
                    "resize-y min-h-[140px]",
                    errors.description && INPUT_ERROR_STYLES
                  )}
                  placeholder="Describe your service in detail..."
                />
                {errors.description && (
                  <p className="mt-1.5 text-xs text-error font-medium">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Pricing & Timeline Card */}
            <div className={cn(NEUMORPHIC_CARD, "space-y-6")}>
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
                  <h2 className="text-base font-bold text-text-primary">Pricing & Delivery Schedule</h2>
                  <p className="text-xs text-text-secondary">Adjust pricing or delivery speed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Price input & quick presets */}
                <div className="space-y-3">
                  <label htmlFor="service-price" className="block text-sm font-semibold text-text-primary">
                    Fixed Price (USD) <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">
                      $
                    </span>
                    <input
                      id="service-price"
                      type="number"
                      name="price"
                      value={formData.price || ""}
                      onChange={handleChange}
                      min={MIN_PRICE}
                      step="1"
                      className={cn(NEUMORPHIC_INPUT, "pl-8 text-base font-bold", errors.price && INPUT_ERROR_STYLES)}
                      placeholder="50"
                    />
                  </div>
                  {errors.price && <p className="text-xs text-error font-medium">{errors.price}</p>}

                  {/* Preset chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {PRICE_PRESETS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, price: amount }))
                        }
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                          formData.price === amount
                            ? "bg-primary text-white shadow-sm"
                            : "bg-background text-text-secondary hover:text-primary hover:bg-white"
                        )}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery days & presets */}
                <div className="space-y-3">
                  <label htmlFor="service-delivery" className="block text-sm font-semibold text-text-primary">
                    Estimated Delivery Time <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="service-delivery"
                      type="number"
                      name="deliveryDays"
                      value={formData.deliveryDays || ""}
                      onChange={handleChange}
                      min={MIN_DELIVERY_DAYS}
                      max={MAX_DELIVERY_DAYS}
                      className={cn(NEUMORPHIC_INPUT, "pr-16 text-base font-bold", errors.deliveryDays && INPUT_ERROR_STYLES)}
                      placeholder="3"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-medium">
                      {formData.deliveryDays === 1 ? "day" : "days"}
                    </span>
                  </div>
                  {errors.deliveryDays && <p className="text-xs text-error font-medium">{errors.deliveryDays}</p>}

                  {/* Preset chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {DELIVERY_PRESETS.map((preset) => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, deliveryDays: preset.days }))
                        }
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                          formData.deliveryDays === preset.days
                            ? "bg-primary text-white shadow-sm"
                            : "bg-background text-text-secondary hover:text-primary hover:bg-white"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar: Live Preview & Save Box (4 Columns) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-6 min-w-0">
            {/* Live Preview Card */}
            <div className={cn(NEUMORPHIC_CARD, "space-y-4")}>
              <div className="flex items-center justify-between pb-3 border-b border-border-light/60 dark:border-border-light/10">
                <div className="flex items-center gap-2">
                  <Icon path={ICON_PATHS.eye} size="sm" className="text-primary" />
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                    Marketplace Preview
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                  Live View
                </span>
              </div>

              {/* Mock Marketplace Card */}
              <div
                className={cn(
                  "p-5 rounded-2xl bg-background",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
                  "space-y-3"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/15 text-primary truncate max-w-[160px]">
                    {formData.category ? selectedCategoryLabel : "Category Name"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/15 text-success border border-success/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    {service.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-text-primary line-clamp-1">
                    {formData.title.trim() || "Your Service Title will appear here"}
                  </h4>
                  <p className="mt-1 text-xs text-text-secondary line-clamp-2 min-h-[2rem]">
                    {formData.description.trim() ||
                      "Detailed scope and deliverables will be shown here for prospective clients to read."}
                  </p>
                </div>

                <div className="pt-3 border-t border-border-light/60 dark:border-border-light/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-text-secondary block">
                      Starting at
                    </span>
                    <span className="text-base font-black text-primary">
                      ${formData.price ? Number(formData.price).toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-text-secondary block">
                      Turnaround
                    </span>
                    <span className="text-xs font-semibold text-text-primary flex items-center justify-end gap-1">
                      <Icon path={ICON_PATHS.clock} size="sm" className="text-text-secondary" />
                      {formData.deliveryDays || 1} {formData.deliveryDays === 1 ? "day" : "days"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality / Readiness Checklist */}
            <div className={cn(NEUMORPHIC_CARD, "p-5 space-y-3")}>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Listing Checklist
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Icon
                    path={ICON_PATHS.check}
                    size="sm"
                    className={checklist.title ? "text-success" : "text-border"}
                  />
                  <span className={checklist.title ? "text-text-primary font-medium" : "text-text-secondary"}>
                    Clear title (min 5 chars)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    path={ICON_PATHS.check}
                    size="sm"
                    className={checklist.category ? "text-success" : "text-border"}
                  />
                  <span className={checklist.category ? "text-text-primary font-medium" : "text-text-secondary"}>
                    Category selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    path={ICON_PATHS.check}
                    size="sm"
                    className={checklist.description ? "text-success" : "text-border"}
                  />
                  <span className={checklist.description ? "text-text-primary font-medium" : "text-text-secondary"}>
                    Scope description (min 20 chars)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    path={ICON_PATHS.check}
                    size="sm"
                    className={checklist.price ? "text-success" : "text-border"}
                  />
                  <span className={checklist.price ? "text-text-primary font-medium" : "text-text-secondary"}>
                    Price at least $5
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    path={ICON_PATHS.check}
                    size="sm"
                    className={checklist.delivery ? "text-success" : "text-border"}
                  />
                  <span className={checklist.delivery ? "text-text-primary font-medium" : "text-text-secondary"}>
                    Delivery time specified
                  </span>
                </div>
              </div>
            </div>

            {/* Save Actions Box */}
            <div className={cn(NEUMORPHIC_CARD, "p-5 space-y-3")}>
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
    </div>
  );
}

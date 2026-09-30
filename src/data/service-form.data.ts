import type {
  ServiceCategory,
  ServiceFormData,
  ServiceFormErrors,
} from "@/types/service.types";
import {
  MIN_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MIN_PRICE,
  MIN_DELIVERY_DAYS,
  MAX_DELIVERY_DAYS,
} from "./service.data";

export const PRICE_PRESETS = [25, 50, 100, 250, 500, 1000];

export const DELIVERY_PRESETS = [
  { days: 1, label: "1 day (Express)" },
  { days: 3, label: "3 days" },
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
];

export const INITIAL_SERVICE_FORM_DATA: ServiceFormData = {
  title: "",
  description: "",
  category: "",
  price: 50,
  deliveryDays: 3,
};

/**
 * Shared client-side validation for the create/edit service forms.
 * Mirrors the `*.data.ts` validation pattern used by `@/data/client-offer.data`.
 */
export function validateServiceForm(data: ServiceFormData): ServiceFormErrors {
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

/** Live "Listing Checklist" state shared by the create/edit sidebars. */
export function getServiceFormChecklist(data: ServiceFormData): {
  title: boolean;
  category: boolean;
  description: boolean;
  price: boolean;
  delivery: boolean;
} {
  return {
    title: data.title.trim().length >= MIN_TITLE_LENGTH,
    category: Boolean(data.category),
    description:
      data.description.trim().length >= MIN_DESCRIPTION_LENGTH &&
      data.description.trim().length <= MAX_DESCRIPTION_LENGTH,
    price: data.price >= MIN_PRICE,
    delivery:
      data.deliveryDays >= MIN_DELIVERY_DAYS && data.deliveryDays <= MAX_DELIVERY_DAYS,
  };
}

/** Category as typed by the backend (`ServiceCategory | ""` for the untouched select). */
export function toServiceCategory(category: string): ServiceCategory {
  return category as ServiceCategory;
}

import { describe, it, expect } from "vitest";
import {
  validateServiceForm,
  getServiceFormChecklist,
  toServiceCategory,
} from "@/data/service-form.data";
import type { ServiceFormData } from "@/types/service.types";

const validFormData: ServiceFormData = {
  title: "Professional Next.js Development",
  description:
    "I will build modern, responsive web applications using React and Next.js with TypeScript.",
  category: "WEB_DEVELOPMENT",
  price: 150,
  deliveryDays: 7,
};

describe("validateServiceForm", () => {
  it("returns no errors for valid form data", () => {
    expect(validateServiceForm(validFormData)).toEqual({});
  });

  it("requires a title", () => {
    const errors = validateServiceForm({ ...validFormData, title: "   " });
    expect(errors.title).toBe("Title is required");
  });

  it("enforces the minimum title length", () => {
    const errors = validateServiceForm({ ...validFormData, title: "short" });
    expect(errors.title).toContain("at least");
  });

  it("requires a description", () => {
    const errors = validateServiceForm({ ...validFormData, description: "" });
    expect(errors.description).toBe("Description is required");
  });

  it("enforces minimum description length", () => {
    const errors = validateServiceForm({ ...validFormData, description: "too short" });
    expect(errors.description).toContain("at least");
  });

  it("requires a category", () => {
    const errors = validateServiceForm({ ...validFormData, category: "" });
    expect(errors.category).toBe("Please select a category");
  });

  it("enforces minimum price", () => {
    const errors = validateServiceForm({ ...validFormData, price: 1 });
    expect(errors.price).toContain("at least $5");
  });

  it("enforces minimum delivery days", () => {
    const errors = validateServiceForm({ ...validFormData, deliveryDays: 0 });
    expect(errors.deliveryDays).toContain("at least 1 day");
  });

  it("enforces maximum delivery days", () => {
    const errors = validateServiceForm({ ...validFormData, deliveryDays: 91 });
    expect(errors.deliveryDays).toContain("cannot exceed 90 days");
  });
});

describe("getServiceFormChecklist", () => {
  it("passes all checks for valid data", () => {
    const checklist = getServiceFormChecklist(validFormData);
    expect(Object.values(checklist).every(Boolean)).toBe(true);
  });

  it("fails category when empty", () => {
    const checklist = getServiceFormChecklist({ ...validFormData, category: "" });
    expect(checklist.category).toBe(false);
  });
});

describe("toServiceCategory", () => {
  it("narrows a selected category string to ServiceCategory", () => {
    expect(toServiceCategory("DESIGN")).toBe("DESIGN");
  });
});

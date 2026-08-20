import { z } from "zod";

export const ONBOARDING_ACCOUNT_TYPES = ["BUYER", "SELLER", "BOTH"] as const;

export type OnboardingAccountType = (typeof ONBOARDING_ACCOUNT_TYPES)[number];

export const onboardingStep1Schema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  type: z.enum(ONBOARDING_ACCOUNT_TYPES, {
    error: "Select how you want to use OfferHub",
  }),
  country: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
});

export const onboardingStep2Schema = z.object({
  professionalTitle: z.string().trim().max(100, "Title must be less than 100 characters").optional().default(""),
  bio: z.string().trim().max(500, "Bio must be less than 500 characters").optional().default(""),
});

export const onboardingSchema = onboardingStep1Schema.merge(onboardingStep2Schema);

export type OnboardingStep1Values = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2Values = z.infer<typeof onboardingStep2Schema>;
export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

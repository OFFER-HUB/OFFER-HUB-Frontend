import { z } from "zod";

export const ONBOARDING_ACCOUNT_TYPES = ["BUYER", "SELLER", "BOTH"] as const;

export type OnboardingAccountType = (typeof ONBOARDING_ACCOUNT_TYPES)[number];

export const onboardingSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  type: z.enum(ONBOARDING_ACCOUNT_TYPES, {
    error: "Select how you want to use OfferHub",
  }),
  bio: z.string().trim().max(500, "Bio must be less than 500 characters"),
  country: z.string().trim(),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

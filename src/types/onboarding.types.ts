import { z } from "zod";

export const ONBOARDING_ACCOUNT_TYPES = ["BUYER", "SELLER", "BOTH"] as const;

export type OnboardingAccountType = (typeof ONBOARDING_ACCOUNT_TYPES)[number];

export const onboardingStep1Schema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name to continue"),
  lastName: z.string().trim().min(1, "Enter your last name to continue"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscores"),
  type: z.enum(ONBOARDING_ACCOUNT_TYPES, {
    error: "Select how you want to use OfferHub to continue",
  }),
  country: z.string().trim().min(1, "Enter your country to continue"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number to continue")
    .max(20, "Phone number is too long"),
  // Only rendered/collected when the user has no email yet (see
  // WalletOnboardingForm.tsx). z.string().optional() only treats `undefined`
  // as "not provided" - an empty string still runs through .email() and
  // fails - so blank/whitespace-only input is normalized to undefined
  // before validation instead of silently blocking submission.
  email: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().trim().email("Enter a valid email address").optional()
  ),
});

export const onboardingStep2Schema = z.object({
  professionalTitle: z
    .string()
    .trim()
    .min(1, "Enter your professional title to continue")
    .max(100, "Title must be less than 100 characters"),
  bio: z
    .string()
    .trim()
    .min(20, "Write at least 20 characters describing your work")
    .max(500, "Bio must be less than 500 characters"),
});

export const onboardingSchema = onboardingStep1Schema.merge(onboardingStep2Schema);

export type OnboardingStep1Values = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2Values = z.infer<typeof onboardingStep2Schema>;
export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

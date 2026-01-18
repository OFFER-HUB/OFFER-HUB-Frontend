import { z } from "zod";

// ============================================
// VALIDATION CONSTANTS
// ============================================

export const VALIDATION_LIMITS = {
  // Authentication
  USERNAME_MIN: 3,
  USERNAME_MAX: 30,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  EMAIL_MAX: 254,

  // General text
  NAME_MIN: 2,
  NAME_MAX: 100,
  TITLE_MIN: 10,
  TITLE_MAX: 200,
  DESCRIPTION_MIN: 50,
  DESCRIPTION_MAX: 2000,
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 5000,
  SHORT_TEXT_MAX: 500,

  // Numeric
  MIN_PRICE: 5,
  MAX_PRICE: 1000000,
  MIN_BUDGET: 10,
  MAX_BUDGET: 10000000,
  MIN_DELIVERY_DAYS: 1,
  MAX_DELIVERY_DAYS: 365,

  // Files
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_ATTACHMENTS: 5,
} as const;

export const ALLOWED_FILE_TYPES = {
  images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
} as const;

// ============================================
// REUSABLE SCHEMA PARTS
// ============================================

const emailSchema = z
  .string()
  .min(1, "Email is required")
  .max(VALIDATION_LIMITS.EMAIL_MAX, `Email must be less than ${VALIDATION_LIMITS.EMAIL_MAX} characters`)
  .email("Please enter a valid email address");

const usernameSchema = z
  .string()
  .min(VALIDATION_LIMITS.USERNAME_MIN, `Username must be at least ${VALIDATION_LIMITS.USERNAME_MIN} characters`)
  .max(VALIDATION_LIMITS.USERNAME_MAX, `Username must be less than ${VALIDATION_LIMITS.USERNAME_MAX} characters`)
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens");

const passwordSchema = z
  .string()
  .min(VALIDATION_LIMITS.PASSWORD_MIN, `Password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN} characters`)
  .max(VALIDATION_LIMITS.PASSWORD_MAX, `Password must be less than ${VALIDATION_LIMITS.PASSWORD_MAX} characters`);

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ============================================
// CONTACT FORM SCHEMA
// ============================================

export const contactSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_LIMITS.NAME_MIN, `Name must be at least ${VALIDATION_LIMITS.NAME_MIN} characters`)
    .max(VALIDATION_LIMITS.NAME_MAX, `Name must be less than ${VALIDATION_LIMITS.NAME_MAX} characters`),
  email: emailSchema,
  subject: z.string().min(1, "Please select a subject"),
  message: z
    .string()
    .min(VALIDATION_LIMITS.MESSAGE_MIN, `Message must be at least ${VALIDATION_LIMITS.MESSAGE_MIN} characters`)
    .max(VALIDATION_LIMITS.MESSAGE_MAX, `Message must be less than ${VALIDATION_LIMITS.MESSAGE_MAX} characters`),
});

// ============================================
// SERVICE SCHEMAS
// ============================================

export const serviceSchema = z.object({
  title: z
    .string()
    .min(VALIDATION_LIMITS.TITLE_MIN, `Title must be at least ${VALIDATION_LIMITS.TITLE_MIN} characters`)
    .max(VALIDATION_LIMITS.TITLE_MAX, `Title must be less than ${VALIDATION_LIMITS.TITLE_MAX} characters`),
  description: z
    .string()
    .min(VALIDATION_LIMITS.DESCRIPTION_MIN, `Description must be at least ${VALIDATION_LIMITS.DESCRIPTION_MIN} characters`)
    .max(VALIDATION_LIMITS.DESCRIPTION_MAX, `Description must be less than ${VALIDATION_LIMITS.DESCRIPTION_MAX} characters`),
  category: z.string().min(1, "Please select a category"),
  price: z
    .number()
    .min(VALIDATION_LIMITS.MIN_PRICE, `Price must be at least $${VALIDATION_LIMITS.MIN_PRICE}`)
    .max(VALIDATION_LIMITS.MAX_PRICE, `Price must be less than $${VALIDATION_LIMITS.MAX_PRICE.toLocaleString()}`),
  deliveryDays: z
    .number()
    .min(VALIDATION_LIMITS.MIN_DELIVERY_DAYS, `Delivery must be at least ${VALIDATION_LIMITS.MIN_DELIVERY_DAYS} day`)
    .max(VALIDATION_LIMITS.MAX_DELIVERY_DAYS, `Delivery must be less than ${VALIDATION_LIMITS.MAX_DELIVERY_DAYS} days`),
});

// ============================================
// OFFER SCHEMAS
// ============================================

export const offerSchema = z.object({
  title: z
    .string()
    .min(VALIDATION_LIMITS.TITLE_MIN, `Title must be at least ${VALIDATION_LIMITS.TITLE_MIN} characters`)
    .max(VALIDATION_LIMITS.TITLE_MAX, `Title must be less than ${VALIDATION_LIMITS.TITLE_MAX} characters`),
  description: z
    .string()
    .min(VALIDATION_LIMITS.DESCRIPTION_MIN, `Description must be at least ${VALIDATION_LIMITS.DESCRIPTION_MIN} characters`)
    .max(VALIDATION_LIMITS.DESCRIPTION_MAX, `Description must be less than ${VALIDATION_LIMITS.DESCRIPTION_MAX} characters`),
  category: z.string().min(1, "Please select a category"),
  budget: z
    .number()
    .min(VALIDATION_LIMITS.MIN_BUDGET, `Budget must be at least $${VALIDATION_LIMITS.MIN_BUDGET}`)
    .max(VALIDATION_LIMITS.MAX_BUDGET, `Budget must be less than $${VALIDATION_LIMITS.MAX_BUDGET.toLocaleString()}`),
  deadline: z.string().min(1, "Please select a deadline").refine(
    (date) => new Date(date) > new Date(),
    "Deadline must be in the future"
  ),
});

// ============================================
// MESSAGE SCHEMA
// ============================================

export const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(VALIDATION_LIMITS.MESSAGE_MAX, `Message must be less than ${VALIDATION_LIMITS.MESSAGE_MAX} characters`),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type OfferInput = z.infer<typeof offerSchema>;
export type MessageInput = z.infer<typeof messageSchema>;

// ============================================
// VALIDATION HELPER
// ============================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}

// ============================================
// FILE VALIDATION
// ============================================

export function validateFile(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const maxSize = options.maxSize ?? VALIDATION_LIMITS.MAX_FILE_SIZE;
  const allowedTypes = options.allowedTypes ?? [
    ...ALLOWED_FILE_TYPES.images,
    ...ALLOWED_FILE_TYPES.documents,
  ];

  if (file.size > maxSize) {
    const sizeMB = Math.round(maxSize / (1024 * 1024));
    return { valid: false, error: `File size must be less than ${sizeMB}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "File type not allowed" };
  }

  return { valid: true };
}

export function validateFiles(
  files: File[],
  options: {
    maxFiles?: number;
    maxSize?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; errors: string[] } {
  const maxFiles = options.maxFiles ?? VALIDATION_LIMITS.MAX_ATTACHMENTS;
  const errors: string[] = [];

  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
  }

  for (const file of files) {
    const result = validateFile(file, options);
    if (!result.valid && result.error) {
      errors.push(`${file.name}: ${result.error}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

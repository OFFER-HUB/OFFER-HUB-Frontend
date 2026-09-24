import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(JSON.stringify(parsed.error.issues, null, 2));
  throw new Error("Invalid environment variables. Check the console for details.");
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;

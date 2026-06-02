import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().default("postgresql://postgres:password@localhost:5432/projectflow"),
  DATABASE_POOL_MIN: z.coerce.number().default(2),
  DATABASE_POOL_MAX: z.coerce.number().default(10),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  JWT_SECRET: z.string().min(32).default("dev-secret-key-minimum-32-chars-long!!"),
  JWT_REFRESH_SECRET: z.string().min(32).default("dev-refresh-secret-key-minimum-32-chars!!"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  R2_ACCOUNT_ID: z.string().optional().default(""),
  R2_ACCESS_KEY_ID: z.string().optional().default(""),
  R2_SECRET_ACCESS_KEY: z.string().optional().default(""),
  R2_BUCKET: z.string().optional().default("projectflow-files"),
  R2_PUBLIC_URL: z.string().default("http://localhost:4000/files"),
  RESEND_API_KEY: z.string().optional().default("re_placeholder"),
  EMAIL_FROM: z.string().default("noreply@projectflow.app"),
  SENTRY_DSN: z.string().url().optional(),
  LOGTAIL_TOKEN: z.string().optional(),
  API_PORT: z.coerce.number().default(4000),
  API_URL: z.string().url().default("http://localhost:4000"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

export function validateServerEnv() {
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid server environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return result.data;
}

export function validateClientEnv() {
  const result = clientEnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid client environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return result.data;
}

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

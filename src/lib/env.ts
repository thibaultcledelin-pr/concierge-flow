import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DIRECT_URL: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validates required environment variables at import time.
 * Throws a clear error listing all missing/invalid variables.
 */
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n")
    throw new Error(
      `\n❌ Invalid environment variables:\n${issues}\n\n` +
      `Copy .env.example to .env and fill in the required values.\n`
    )
  }
  return result.data
}

/**
 * Safe accessor — returns validated env or throws on first use.
 * Import and call validateEnv() in entry points (middleware, server-only modules)
 * to fail fast if config is missing.
 */
export const env = (() => {
  try {
    return envSchema.parse(process.env)
  } catch {
    // Deferred validation — caller must invoke validateEnv() explicitly
    return null as unknown as Env
  }
})()

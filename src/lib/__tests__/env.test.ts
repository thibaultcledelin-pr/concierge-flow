import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { validateEnv } from "../env"

describe("validateEnv", () => {
  const original = { ...process.env }

  beforeEach(() => {
    // Clear relevant env vars
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    delete process.env.DATABASE_URL
  })

  afterEach(() => {
    process.env = { ...original }
  })

  it("throws a clear error when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test"
    process.env.DATABASE_URL = "postgresql://test"
    expect(() => validateEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/)
  })

  it("throws when SUPABASE_URL is not a valid URL", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "not-a-url"
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test"
    process.env.DATABASE_URL = "postgresql://test"
    expect(() => validateEnv()).toThrow(/valid URL/)
  })

  it("throws when DATABASE_URL is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test"
    expect(() => validateEnv()).toThrow(/DATABASE_URL/)
  })

  it("returns validated env when all required vars are set", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key"
    process.env.DATABASE_URL = "postgresql://localhost/test"

    const env = validateEnv()
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://test.supabase.co")
    expect(env.DATABASE_URL).toBe("postgresql://localhost/test")
  })

  it("lists all missing variables in the error message", () => {
    expect(() => validateEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL[\s\S]*DATABASE_URL/)
  })
})

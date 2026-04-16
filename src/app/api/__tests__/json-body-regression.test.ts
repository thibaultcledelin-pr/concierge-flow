import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFindMany = vi.fn()
const mockCreate = vi.fn()
const mockPropertyFindFirst = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: { findFirst: (...args: unknown[]) => mockPropertyFindFirst(...args), findMany: vi.fn() },
    expense: { findMany: (...args: unknown[]) => mockFindMany(...args), count: vi.fn().mockResolvedValue(0), create: (...args: unknown[]) => mockCreate(...args) },
  },
}))

const mockGetUser = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mockGetUser } }),
}))

import { POST as postProperties } from "../properties/route"
import { POST as postExpenses } from "../expenses/route"

describe("request.json() non-regression", () => {
  beforeEach(() => { vi.clearAllMocks() })

  // Non-regression: PR #9, bug #18 — malformed JSON body must return 400
  it("POST /api/properties with invalid JSON returns 400", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })

    const req = new Request("http://localhost/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not valid json{{{",
    })
    const res = await postProperties(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("JSON")
  })

  // Non-regression: PR #9, bug #18 — empty body must return 400
  it("POST /api/properties with empty body returns 400", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })

    const req = new Request("http://localhost/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "",
    })
    const res = await postProperties(req)
    expect(res.status).toBe(400)
  })

  // Non-regression: PR #9, bug #19 — expenses malformed JSON
  it("POST /api/expenses with invalid JSON returns 400", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })

    const req = new Request("http://localhost/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{broken",
    })
    const res = await postExpenses(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("JSON")
  })
})

import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFindMany = vi.fn()
const mockCount = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    expense: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
    },
  },
}))

const mockGetUser = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mockGetUser } }),
}))

import { GET } from "../route"

describe("expenses pagination non-regression", () => {
  beforeEach(() => { vi.clearAllMocks() })

  // Non-regression: PR #10, bug #5 — findMany must have take/skip
  it("source code uses take and skip for pagination", async () => {
    const { readFileSync } = await import("fs")
    const source = readFileSync("src/app/api/expenses/route.ts", "utf-8")
    expect(source).toContain("take:")
    expect(source).toContain("skip:")
  })

  // Non-regression: PR #10, bug #5 — response includes total
  it("response includes total count", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockFindMany.mockResolvedValue([])
    mockCount.mockResolvedValue(25)

    const req = new Request("http://localhost/api/expenses")
    const res = await GET(req)
    const data = await res.json()

    expect(data).toHaveProperty("total")
    expect(data).toHaveProperty("expenses")
  })
})

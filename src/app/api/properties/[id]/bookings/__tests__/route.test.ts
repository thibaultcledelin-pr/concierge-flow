import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPropertyFindFirst = vi.fn()
const mockBookingFindMany = vi.fn()
const mockBookingCount = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: { findFirst: (...args: unknown[]) => mockPropertyFindFirst(...args) },
    booking: {
      findMany: (...args: unknown[]) => mockBookingFindMany(...args),
      count: (...args: unknown[]) => mockBookingCount(...args),
    },
  },
}))

const mockGetUser = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mockGetUser } }),
}))

import { GET } from "../route"

describe("bookings pagination non-regression", () => {
  beforeEach(() => { vi.clearAllMocks() })

  // Non-regression: PR #10, bug #4 — findMany must have take/skip (pagination)
  it("source code uses take and skip for pagination", async () => {
    const { readFileSync } = await import("fs")
    const source = readFileSync("src/app/api/properties/[id]/bookings/route.ts", "utf-8")
    expect(source).toContain("take:")
    expect(source).toContain("skip:")
  })

  // Non-regression: PR #10, bug #4 — response includes total count
  it("response includes total count for pagination", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindFirst.mockResolvedValue({ id: "p1", userId: "u1" })
    mockBookingFindMany.mockResolvedValue([{ id: "b1" }])
    mockBookingCount.mockResolvedValue(50)

    const req = new Request("http://localhost/api/properties/p1/bookings")
    const res = await GET(req, { params: Promise.resolve({ id: "p1" }) })
    const data = await res.json()

    expect(data).toHaveProperty("total")
    expect(data.total).toBe(50)
    expect(data).toHaveProperty("bookings")
  })

  // Non-regression: PR #10, bug #4 — page parameter works
  it("respects page query parameter", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindFirst.mockResolvedValue({ id: "p1", userId: "u1" })
    mockBookingFindMany.mockResolvedValue([])
    mockBookingCount.mockResolvedValue(0)

    const req = new Request("http://localhost/api/properties/p1/bookings?page=2&limit=10")
    await GET(req, { params: Promise.resolve({ id: "p1" }) })

    expect(mockBookingFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, skip: 20 })
    )
  })

  // Non-regression: PR #10, bug #4 — limit capped at 100
  it("caps limit at 100", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindFirst.mockResolvedValue({ id: "p1", userId: "u1" })
    mockBookingFindMany.mockResolvedValue([])
    mockBookingCount.mockResolvedValue(0)

    const req = new Request("http://localhost/api/properties/p1/bookings?limit=500")
    await GET(req, { params: Promise.resolve({ id: "p1" }) })

    expect(mockBookingFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    )
  })
})

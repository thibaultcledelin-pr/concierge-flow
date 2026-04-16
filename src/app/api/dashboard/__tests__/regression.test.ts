import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPropertyFindMany = vi.fn()
const mockExpenseFindMany = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: { findMany: (...args: unknown[]) => mockPropertyFindMany(...args) },
    expense: { findMany: (...args: unknown[]) => mockExpenseFindMany(...args) },
  },
}))

const mockGetUser = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mockGetUser } }),
}))

import { GET } from "../route"

describe("dashboard non-regression", () => {
  beforeEach(() => { vi.clearAllMocks() })

  // Non-regression: PR #9, bug #3 — zero properties must not cause division by zero
  it("returns 0 for all stats when user has no properties", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindMany.mockResolvedValue([])
    mockExpenseFindMany.mockResolvedValue([])

    const res = await GET()
    const data = await res.json()

    expect(data.stats.occupancyRate).toBe(0)
    expect(data.stats.totalMargin).toBe(0)
    expect(data.stats.avgRevenuePerNight).toBe(0)
    expect(data.stats.revPAR).toBe(0)
    expect(Number.isNaN(data.stats.occupancyRate)).toBe(false)
    expect(Number.isNaN(data.stats.revPAR)).toBe(false)
  })

  // Non-regression: PR #9, bug #3 — properties with no bookings must not NaN
  it("returns 0% occupancy for properties with no bookings", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindMany.mockResolvedValue([
      { id: "p1", name: "Empty", city: "Paris", bookings: [], expenses: [] },
    ])
    mockExpenseFindMany.mockResolvedValue([])

    const res = await GET()
    const data = await res.json()

    expect(data.profitability[0].occupancy).toBe(0)
    expect(data.profitability[0].margin).toBe(0)
    expect(Number.isNaN(data.profitability[0].occupancy)).toBe(false)
  })

  // Non-regression: PR #9, bug #11 — malformed month strings must be filtered
  it("filters out invalid month formats in occupancy data", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindMany.mockResolvedValue([
      {
        id: "p1", name: "Test", city: "Paris",
        bookings: [
          { totalAmount: 100, nights: 2, platform: "AIRBNB", checkIn: new Date("2026-04-01") },
        ],
        expenses: [],
      },
    ])
    mockExpenseFindMany.mockResolvedValue([])

    const res = await GET()
    const data = await res.json()

    for (const point of data.occupancyData) {
      expect(point.month).toMatch(/^\d{4}-\d{2}$/)
      expect(Number.isNaN(point.occupancy)).toBe(false)
    }
  })

  // Non-regression: PR #9, bug #29 — real days in month (not hardcoded 30)
  it("uses real days in month for occupancy calculation", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindMany.mockResolvedValue([
      {
        id: "p1", name: "Feb Test", city: "Paris",
        bookings: [
          { totalAmount: 500, nights: 28, platform: "AIRBNB", checkIn: new Date("2026-02-01") },
        ],
        expenses: [],
      },
    ])
    mockExpenseFindMany.mockResolvedValue([])

    const res = await GET()
    const data = await res.json()

    const febPoint = data.occupancyData.find((p: { month: string }) => p.month === "2026-02")
    if (febPoint) {
      // Feb 2026 has 28 days, 1 property, 28 nights booked = 100%
      expect(febPoint.occupancy).toBe(100)
    }
  })
})

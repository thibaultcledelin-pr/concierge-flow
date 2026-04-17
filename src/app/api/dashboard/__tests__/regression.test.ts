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

function mockRequest(params?: Record<string, string>) {
  const url = new URL("http://localhost/api/dashboard")
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  }
  return new Request(url)
}

describe("dashboard non-regression", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("returns 0 for all stats when user has no properties", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindMany.mockResolvedValue([])
    mockExpenseFindMany.mockResolvedValue([])

    const res = await GET(mockRequest())
    const data = await res.json()

    expect(data.stats.occupancyRate).toBe(0)
    expect(data.stats.totalMargin).toBe(0)
    expect(data.stats.avgRevenuePerNight).toBe(0)
    expect(data.stats.revPAR).toBe(0)
    expect(Number.isNaN(data.stats.occupancyRate)).toBe(false)
    expect(Number.isNaN(data.stats.revPAR)).toBe(false)
  })

  it("returns 0% occupancy for properties with no bookings", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindMany.mockResolvedValue([
      { id: "p1", name: "Empty", city: "Paris", bookings: [], expenses: [] },
    ])
    mockExpenseFindMany.mockResolvedValue([])

    const res = await GET(mockRequest())
    const data = await res.json()

    expect(data.profitability[0].occupancy).toBe(0)
    expect(data.profitability[0].margin).toBe(0)
    expect(Number.isNaN(data.profitability[0].occupancy)).toBe(false)
  })

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

    const res = await GET(mockRequest())
    const data = await res.json()

    for (const point of data.occupancyData) {
      expect(point.month).toMatch(/^\d{4}-\d{2}$/)
      expect(Number.isNaN(point.occupancy)).toBe(false)
    }
  })

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

    const res = await GET(mockRequest())
    const data = await res.json()

    const febPoint = data.occupancyData.find((p: { month: string }) => p.month === "2026-02")
    if (febPoint) {
      expect(febPoint.occupancy).toBe(100)
    }
  })
})

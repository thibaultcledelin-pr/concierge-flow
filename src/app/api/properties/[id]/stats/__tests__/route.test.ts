import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPropertyFindFirst = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: { findFirst: (...args: unknown[]) => mockPropertyFindFirst(...args) },
  },
}))

const mockGetUser = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mockGetUser } }),
}))

import { GET } from "../route"

function mockRequest() {
  return new Request("http://localhost/api/properties/p1/stats")
}

function mockParams() {
  return { params: Promise.resolve({ id: "p1" }) }
}

describe("Property Stats API", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("returns 401 if not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await GET(mockRequest(), mockParams())
    expect(res.status).toBe(401)
  })

  it("returns 404 if property not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindFirst.mockResolvedValue(null)

    const res = await GET(mockRequest(), mockParams())
    expect(res.status).toBe(404)
  })

  it("returns stats for property with bookings and expenses", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindFirst.mockResolvedValue({
      id: "p1", name: "Test", address: "1 rue", city: "Paris",
      type: "APARTMENT", rooms: 2, surface: 40, monthlyRent: 800,
      bookings: [
        { id: "b1", guestName: "Alice", checkIn: new Date("2026-04-01"), checkOut: new Date("2026-04-04"), nights: 3, totalAmount: 450, platform: "AIRBNB" },
        { id: "b2", guestName: "Bob", checkIn: new Date("2026-04-10"), checkOut: new Date("2026-04-12"), nights: 2, totalAmount: 300, platform: "BOOKING" },
      ],
      expenses: [
        { id: "e1", label: "Ménage", amount: 80, category: "CLEANING", date: new Date("2026-04-05") },
      ],
    })

    const res = await GET(mockRequest(), mockParams())
    const data = await res.json()

    expect(data.stats.revenue).toBe(750)
    expect(data.stats.expenses).toBe(80)
    expect(data.stats.profit).toBe(670)
    expect(data.stats.nights).toBe(5)
    expect(data.stats.bookingCount).toBe(2)
    expect(data.stats.expenseCount).toBe(1)
    expect(data.recentBookings).toHaveLength(2)
    expect(data.recentExpenses).toHaveLength(1)
    expect(data.chartData.length).toBeGreaterThan(0)
  })

  it("returns 0 stats for empty property", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindFirst.mockResolvedValue({
      id: "p1", name: "Empty", address: "1 rue", city: "Lyon",
      type: "STUDIO", rooms: 1, surface: null, monthlyRent: null,
      bookings: [], expenses: [],
    })

    const res = await GET(mockRequest(), mockParams())
    const data = await res.json()

    expect(data.stats.revenue).toBe(0)
    expect(data.stats.margin).toBe(0)
    expect(data.stats.occupancy).toBe(0)
    expect(Number.isNaN(data.stats.adr)).toBe(false)
  })
})

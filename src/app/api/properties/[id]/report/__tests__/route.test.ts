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

function mockRequest(month?: string) {
  const url = new URL("http://localhost/api/properties/p1/report")
  if (month) url.searchParams.set("month", month)
  return new Request(url)
}

function mockParams() {
  return { params: Promise.resolve({ id: "p1" }) }
}

const sampleProperty = {
  id: "p1", name: "Studio Marais", address: "12 rue", city: "Paris", type: "STUDIO",
  bookings: [
    { id: "b1", guestName: "Alice", checkIn: new Date("2026-04-01"), checkOut: new Date("2026-04-04"), nights: 3, totalAmount: 450, platform: "AIRBNB" },
    { id: "b2", guestName: "Bob", checkIn: new Date("2026-03-10"), checkOut: new Date("2026-03-12"), nights: 2, totalAmount: 300, platform: "BOOKING" },
  ],
  expenses: [
    { id: "e1", label: "Ménage", category: "CLEANING", amount: 60, date: new Date("2026-04-02") },
    { id: "e2", label: "Assurance", category: "INSURANCE", amount: 120, date: new Date("2026-03-15") },
  ],
}

describe("Property Report API", () => {
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

  it("returns full report data without month filter", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindFirst.mockResolvedValue(sampleProperty)

    const res = await GET(mockRequest(), mockParams())
    const data = await res.json()

    expect(data.property.name).toBe("Studio Marais")
    expect(data.period).toBe("all")
    expect(data.stats.totalRevenue).toBe(750)
    expect(data.stats.totalExpenses).toBe(180)
    expect(data.stats.profit).toBe(570)
    expect(data.bookingDetails).toHaveLength(2)
    expect(data.expenseDetails).toHaveLength(2)
    expect(data.expensesByCategory).toHaveProperty("CLEANING")
    expect(data.generatedAt).toBeDefined()
  })

  it("filters by month when param is provided", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindFirst.mockResolvedValue(sampleProperty)

    const res = await GET(mockRequest("2026-04"), mockParams())
    const data = await res.json()

    expect(data.period).toBe("2026-04")
    expect(data.stats.totalRevenue).toBe(450)
    expect(data.bookingDetails).toHaveLength(1)
    expect(data.bookingDetails[0].guestName).toBe("Alice")
    expect(data.expenseDetails).toHaveLength(1)
  })

  it("returns 0 stats for month with no data", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindFirst.mockResolvedValue(sampleProperty)

    const res = await GET(mockRequest("2026-12"), mockParams())
    const data = await res.json()

    expect(data.stats.totalRevenue).toBe(0)
    expect(data.bookingDetails).toHaveLength(0)
  })
})

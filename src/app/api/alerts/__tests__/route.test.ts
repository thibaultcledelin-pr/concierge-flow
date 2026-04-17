import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPropertyFindMany = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: { findMany: (...args: unknown[]) => mockPropertyFindMany(...args) },
  },
}))

const mockGetUser = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mockGetUser } }),
}))

import { GET } from "../route"

describe("Alerts API", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("returns 401 if not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it("returns empty alerts when no properties", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindMany.mockResolvedValue([])

    const res = await GET()
    const data = await res.json()
    expect(data.alerts).toHaveLength(0)
  })

  it("generates danger alert for negative margin", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindMany.mockResolvedValue([
      {
        id: "p1", name: "Loss Property",
        bookings: [{ totalAmount: 100, nights: 2, checkIn: new Date() }],
        expenses: [{ amount: 500 }],
      },
    ])

    const res = await GET()
    const data = await res.json()
    const danger = data.alerts.find((a: { type: string }) => a.type === "danger")
    expect(danger).toBeDefined()
    expect(danger.title).toBe("Marge négative")
  })

  it("generates warning alert for low occupancy", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindMany.mockResolvedValue([
      {
        id: "p1", name: "Low Occ",
        bookings: [{ totalAmount: 500, nights: 3, checkIn: new Date() }],
        expenses: [{ amount: 100 }],
      },
    ])

    const res = await GET()
    const data = await res.json()
    const warning = data.alerts.find((a: { title: string }) => a.title === "Occupation basse")
    expect(warning).toBeDefined()
  })

  it("generates warning for no bookings", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindMany.mockResolvedValue([
      { id: "p1", name: "Empty", bookings: [], expenses: [] },
    ])

    const res = await GET()
    const data = await res.json()
    const noBooking = data.alerts.find((a: { title: string }) => a.title === "Aucune réservation")
    expect(noBooking).toBeDefined()
  })

  it("sorts alerts by severity: danger first", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindMany.mockResolvedValue([
      {
        id: "p1", name: "Loss",
        bookings: [{ totalAmount: 100, nights: 1, checkIn: new Date() }],
        expenses: [{ amount: 500 }],
      },
      { id: "p2", name: "Empty", bookings: [], expenses: [] },
    ])

    const res = await GET()
    const data = await res.json()
    expect(data.alerts[0].type).toBe("danger")
  })
})

import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPropertyFindMany = vi.fn()
const mockBookingFindUnique = vi.fn()
const mockBookingCreate = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: { findMany: (...args: unknown[]) => mockPropertyFindMany(...args) },
    booking: {
      findUnique: (...args: unknown[]) => mockBookingFindUnique(...args),
      create: (...args: unknown[]) => mockBookingCreate(...args),
    },
  },
}))

const mockGetUser = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mockGetUser } }),
}))

vi.mock("@/lib/ical-parser", () => ({
  parseIcal: () => [
    { externalId: "ext-1", guestName: "Alice", checkIn: new Date(), checkOut: new Date(), nights: 3 },
  ],
  detectPlatform: (url: string) => url.includes("airbnb") ? "AIRBNB" as const : "OTHER" as const,
}))

import { POST } from "../route"

describe("Sync-all API", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("returns 401 if not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await POST()
    expect(res.status).toBe(401)
  })

  it("returns results for properties without iCal URLs", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindMany.mockResolvedValue([
      { id: "p1", name: "No iCal", icalUrl: null, icalUrlBooking: null },
    ])

    const res = await POST()
    const data = await res.json()

    expect(data.totalCreated).toBe(0)
    expect(data.results).toHaveLength(1)
    expect(data.results[0].error).toBe("Pas d'URL iCal")
  })

  it("skips properties with unsafe URLs", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindMany.mockResolvedValue([
      { id: "p1", name: "Bad URL", icalUrl: "http://localhost/evil", icalUrlBooking: null },
    ])

    const res = await POST()
    const data = await res.json()

    expect(data.totalCreated).toBe(0)
  })

  it("returns empty results for user with no properties", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindMany.mockResolvedValue([])

    const res = await POST()
    const data = await res.json()

    expect(data.totalCreated).toBe(0)
    expect(data.totalSkipped).toBe(0)
    expect(data.results).toHaveLength(0)
  })
})

import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../route"

const mockFindFirst = vi.fn()
const mockFindUnique = vi.fn()
const mockCreate = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    booking: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}))

const mockGetUser = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mockGetUser } }),
}))

vi.mock("@/lib/ical-parser", () => ({
  parseIcal: () => [
    { guestName: "Test", checkIn: new Date(), checkOut: new Date(Date.now() + 86400000), nights: 1, externalId: "ext-1" },
  ],
  detectPlatform: () => "AIRBNB",
}))

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

describe("sync-ical non-regression", () => {
  beforeEach(() => { vi.clearAllMocks() })

  // Non-regression: PR #9, bug #1 — errors must be logged server-side, generic message to client
  it("logs error to console.error and returns generic message", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockFindFirst.mockResolvedValue({
      id: "p1", userId: "u1",
      icalUrl: "https://airbnb.com/cal.ics", icalUrlBooking: null,
    })
    mockFetch.mockRejectedValue(new Error("Network failure"))
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})

    const req = new Request("http://localhost/api/properties/p1/sync-ical", { method: "POST" })
    const res = await POST(req, { params: Promise.resolve({ id: "p1" }) })
    const data = await res.json()

    expect(spy).toHaveBeenCalled()
    expect(data.errors[0]).not.toContain("Network failure")
    expect(data.errors[0]).toBe("Error processing AIRBNB iCal")
    spy.mockRestore()
  })

  // Non-regression: PR #9, bug #7 — fetch timeout must not hang
  it("returns error when iCal fetch times out (AbortSignal.timeout)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockFindFirst.mockResolvedValue({
      id: "p1", userId: "u1",
      icalUrl: "https://airbnb.com/cal.ics", icalUrlBooking: null,
    })
    mockFetch.mockRejectedValue(new DOMException("The operation was aborted", "AbortError"))
    vi.spyOn(console, "error").mockImplementation(() => {})

    const req = new Request("http://localhost/api/properties/p1/sync-ical", { method: "POST" })
    const res = await POST(req, { params: Promise.resolve({ id: "p1" }) })
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.errors).toHaveLength(1)
    expect(data.created).toBe(0)
  })
})

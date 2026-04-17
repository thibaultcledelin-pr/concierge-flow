import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../route"

const mockFindFirst = vi.fn()
const mockFindUnique = vi.fn()
const mockCreate = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
    booking: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}))

const mockGetUser = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
  }),
}))

vi.mock("@/lib/ical-parser", () => ({
  parseIcal: () => [
    {
      guestName: "Jean Dupont",
      checkIn: new Date("2026-05-01"),
      checkOut: new Date("2026-05-04"),
      nights: 3,
      externalId: "booking-001",
    },
  ],
  detectPlatform: () => "AIRBNB",
}))

// Mock fetch for iCal URL
const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

describe("POST /api/properties/[id]/sync-ical", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 if not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const req = new Request("http://localhost/api/properties/1/sync-ical", { method: "POST" })
    const res = await POST(req, { params: Promise.resolve({ id: "1" }) })
    expect(res.status).toBe(401)
  })

  it("returns 404 if property not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
    mockFindFirst.mockResolvedValue(null)
    const req = new Request("http://localhost/api/properties/1/sync-ical", { method: "POST" })
    const res = await POST(req, { params: Promise.resolve({ id: "1" }) })
    expect(res.status).toBe(404)
  })

  it("returns 400 if no iCal URL configured", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
    mockFindFirst.mockResolvedValue({
      id: "1",
      userId: "user-1",
      icalUrl: null,
      icalUrlBooking: null,
    })
    const req = new Request("http://localhost/api/properties/1/sync-ical", { method: "POST" })
    const res = await POST(req, { params: Promise.resolve({ id: "1" }) })
    expect(res.status).toBe(400)
  })

  it("creates new bookings from iCal", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
    mockFindFirst.mockResolvedValue({
      id: "prop-1",
      userId: "user-1",
      icalUrl: "https://www.airbnb.com/calendar/ical/123.ics",
      icalUrlBooking: null,
    })
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => "BEGIN:VCALENDAR\nEND:VCALENDAR",
    })
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockResolvedValue({})

    const req = new Request("http://localhost/api/properties/prop-1/sync-ical", { method: "POST" })
    const res = await POST(req, { params: Promise.resolve({ id: "prop-1" }) })
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.created).toBe(1)
    expect(data.skipped).toBe(0)
  })

  it("skips existing bookings (deduplication)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
    mockFindFirst.mockResolvedValue({
      id: "prop-1",
      userId: "user-1",
      icalUrl: "https://www.airbnb.com/calendar/ical/123.ics",
      icalUrlBooking: null,
    })
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => "BEGIN:VCALENDAR\nEND:VCALENDAR",
    })
    mockFindUnique.mockResolvedValue({ id: "existing-booking" })

    const req = new Request("http://localhost/api/properties/prop-1/sync-ical", { method: "POST" })
    const res = await POST(req, { params: Promise.resolve({ id: "prop-1" }) })
    const data = await res.json()

    expect(data.created).toBe(0)
    expect(data.skipped).toBe(1)
  })

  it("logs error to console.error and returns generic message", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
    mockFindFirst.mockResolvedValue({
      id: "p1", userId: "user-1",
      icalUrl: "https://airbnb.com/cal.ics", icalUrlBooking: null,
    })
    mockFetch.mockRejectedValue(new Error("Network failure"))
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})

    const req = new Request("http://localhost/api/properties/p1/sync-ical", { method: "POST" })
    const res = await POST(req, { params: Promise.resolve({ id: "p1" }) })
    const data = await res.json()

    expect(spy).toHaveBeenCalled()
    expect(data.errors[0]).toBe("Error processing AIRBNB iCal")
    spy.mockRestore()
  })

  it("handles fetch timeout gracefully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
    mockFindFirst.mockResolvedValue({
      id: "p1", userId: "user-1",
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

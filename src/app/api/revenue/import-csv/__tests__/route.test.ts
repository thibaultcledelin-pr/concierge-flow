import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../route"

const mockPropertyFindFirst = vi.fn()
const mockBookingFindFirst = vi.fn()
const mockBookingCreate = vi.fn()
const mockBookingUpdate = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: {
      findFirst: (...args: unknown[]) => mockPropertyFindFirst(...args),
    },
    booking: {
      findFirst: (...args: unknown[]) => mockBookingFindFirst(...args),
      create: (...args: unknown[]) => mockBookingCreate(...args),
      update: (...args: unknown[]) => mockBookingUpdate(...args),
    },
  },
}))

const mockGetUser = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
  }),
}))

const mockParseAirbnb = vi.fn()
const mockParseBooking = vi.fn()
vi.mock("@/lib/csv-parser", () => ({
  parseAirbnbCsv: (...args: unknown[]) => mockParseAirbnb(...args),
  parseBookingCsv: (...args: unknown[]) => mockParseBooking(...args),
  detectCsvPlatform: () => "AIRBNB",
}))

describe("POST /api/revenue/import-csv", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 if not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const formData = new FormData()
    const req = new Request("http://localhost/api/revenue/import-csv", {
      method: "POST",
      body: formData,
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it("returns 400 if no file provided", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
    const formData = new FormData()
    formData.append("propertyId", "prop-1")
    const req = new Request("http://localhost/api/revenue/import-csv", {
      method: "POST",
      body: formData,
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("creates bookings from valid CSV", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
    mockPropertyFindFirst.mockResolvedValue({ id: "prop-1", userId: "user-1" })
    mockParseAirbnb.mockReturnValue([
      {
        guestName: "Jean",
        checkIn: new Date("2026-05-01"),
        checkOut: new Date("2026-05-04"),
        nights: 3,
        totalAmount: 450,
        netAmount: null,
        platform: "AIRBNB",
      },
    ])
    mockBookingFindFirst.mockResolvedValue(null)
    mockBookingCreate.mockResolvedValue({})

    const file = new File(["csv-data"], "airbnb.csv", { type: "text/csv" })
    const formData = new FormData()
    formData.append("file", file)
    formData.append("propertyId", "prop-1")

    const req = new Request("http://localhost/api/revenue/import-csv", {
      method: "POST",
      body: formData,
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.created).toBe(1)
    expect(mockBookingCreate).toHaveBeenCalledOnce()
  })

  it("enriches existing iCal bookings with CSV amounts", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
    mockPropertyFindFirst.mockResolvedValue({ id: "prop-1", userId: "user-1" })
    mockParseAirbnb.mockReturnValue([
      {
        guestName: "Jean",
        checkIn: new Date("2026-05-01"),
        checkOut: new Date("2026-05-04"),
        nights: 3,
        totalAmount: 450,
        netAmount: null,
        platform: "AIRBNB",
      },
    ])
    mockBookingFindFirst.mockResolvedValue({
      id: "existing-1",
      totalAmount: 0,
      guestName: null,
    })
    mockBookingUpdate.mockResolvedValue({})

    const file = new File(["csv-data"], "airbnb.csv", { type: "text/csv" })
    const formData = new FormData()
    formData.append("file", file)
    formData.append("propertyId", "prop-1")

    const req = new Request("http://localhost/api/revenue/import-csv", {
      method: "POST",
      body: formData,
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.matched).toBe(1)
    expect(data.created).toBe(0)
    expect(mockBookingUpdate).toHaveBeenCalledOnce()
  })
})

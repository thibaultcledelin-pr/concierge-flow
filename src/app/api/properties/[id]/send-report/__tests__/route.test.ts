import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPropertyFindFirst = vi.fn()
const mockResendSend = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: { findFirst: (...args: unknown[]) => mockPropertyFindFirst(...args) },
  },
}))

const mockGetUser = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mockGetUser } }),
}))

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: (...args: unknown[]) => mockResendSend(...args) }
  },
}))

import { POST } from "../route"

function mockRequest(body: object = {}) {
  return new Request("http://localhost/api/properties/p1/send-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function mockParams() {
  return { params: Promise.resolve({ id: "p1" }) }
}

describe("POST /api/properties/[id]/send-report", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.RESEND_API_KEY = "test-key"
  })

  it("returns 401 if not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await POST(mockRequest(), mockParams())
    expect(res.status).toBe(401)
  })

  it("returns 404 if property not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindFirst.mockResolvedValue(null)
    const res = await POST(mockRequest(), mockParams())
    expect(res.status).toBe(404)
  })

  it("returns 400 if no ownerEmail configured", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindFirst.mockResolvedValue({
      id: "p1", name: "Test", address: "1 rue", city: "Paris",
      ownerEmail: null, ownerName: null,
      bookings: [], expenses: [],
    })
    const res = await POST(mockRequest(), mockParams())
    expect(res.status).toBe(400)
  })

  it("returns 500 if RESEND_API_KEY is missing", async () => {
    delete process.env.RESEND_API_KEY
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindFirst.mockResolvedValue({
      id: "p1", name: "Test", address: "1 rue", city: "Paris",
      ownerEmail: "owner@test.com", ownerName: "Jean",
      bookings: [], expenses: [],
    })
    const res = await POST(mockRequest(), mockParams())
    expect(res.status).toBe(500)
  })

  it("sends email successfully with stats", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    mockPropertyFindFirst.mockResolvedValue({
      id: "p1", name: "Studio", address: "1 rue", city: "Paris",
      ownerEmail: "owner@test.com", ownerName: "Jean",
      bookings: [
        { totalAmount: 500, nights: 3, checkIn: new Date("2026-04-01") },
      ],
      expenses: [
        { amount: 80, date: new Date("2026-04-02") },
      ],
    })
    mockResendSend.mockResolvedValue({ id: "email-1" })

    const res = await POST(mockRequest({ month: "2026-04" }), mockParams())
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.sentTo).toBe("owner@test.com")
    expect(mockResendSend).toHaveBeenCalledOnce()
  })
})

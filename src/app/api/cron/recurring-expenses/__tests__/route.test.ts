import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFindMany = vi.fn()
const mockFindFirst = vi.fn()
const mockCreate = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    expense: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}))

import { nextOccurrence, POST, GET } from "../route"

describe("nextOccurrence", () => {
  it("advances by 7 days for WEEKLY", () => {
    const result = nextOccurrence(new Date("2026-01-01"), "WEEKLY")
    expect(result.toISOString().slice(0, 10)).toBe("2026-01-08")
  })

  it("advances by 1 month for MONTHLY", () => {
    const result = nextOccurrence(new Date("2026-01-15"), "MONTHLY")
    expect(result.toISOString().slice(0, 10)).toBe("2026-02-15")
  })

  it("advances by 3 months for QUARTERLY", () => {
    const result = nextOccurrence(new Date("2026-01-15"), "QUARTERLY")
    expect(result.toISOString().slice(0, 10)).toBe("2026-04-15")
  })

  it("advances by 1 year for YEARLY", () => {
    const result = nextOccurrence(new Date("2026-03-01"), "YEARLY")
    expect(result.toISOString().slice(0, 10)).toBe("2027-03-01")
  })

  it("handles month rollover (Jan 31 → Feb 28/29)", () => {
    const result = nextOccurrence(new Date("2026-01-31"), "MONTHLY")
    // Date auto-rolls (Jan 31 + 1 month = March 3 in JS)
    expect(result.getTime()).toBeGreaterThan(new Date("2026-01-31").getTime())
  })
})

const CRON = "secret123"
const authReq = (method: "GET" | "POST" = "POST") =>
  new Request("http://localhost/api/cron/recurring-expenses", {
    method,
    headers: { authorization: `Bearer ${CRON}` },
  })

describe("POST /api/cron/recurring-expenses", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("returns 401 when CRON_SECRET is set and the Bearer token is wrong", async () => {
    process.env.CRON_SECRET = CRON
    const req = new Request("http://localhost/api/cron/recurring-expenses", {
      method: "POST",
      headers: { authorization: "Bearer wrong" },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
    delete process.env.CRON_SECRET
  })

  it("fails closed (503) when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET
    const res = await POST(authReq())
    expect(res.status).toBe(503)
  })

  it("accepts a GET with the correct Bearer token (Vercel Cron)", async () => {
    process.env.CRON_SECRET = CRON
    mockFindMany.mockResolvedValue([])
    const res = await GET(authReq("GET"))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.created).toBe(0)
    delete process.env.CRON_SECRET
  })

  it("creates missing monthly occurrences up to today", async () => {
    process.env.CRON_SECRET = CRON
    const oldDate = new Date()
    oldDate.setMonth(oldDate.getMonth() - 3)

    mockFindMany.mockResolvedValue([
      {
        id: "e1", userId: "u1", propertyId: null,
        category: "INSURANCE", label: "Assurance",
        amount: 80, date: oldDate, isRecurring: true, frequency: "MONTHLY", notes: null,
      },
    ])
    mockFindFirst.mockResolvedValue(null)
    mockCreate.mockResolvedValue({})

    const res = await POST(authReq())
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.created).toBeGreaterThan(0)
    delete process.env.CRON_SECRET
  })

  it("skips creating duplicates when occurrence already exists", async () => {
    process.env.CRON_SECRET = CRON
    const oldDate = new Date()
    oldDate.setMonth(oldDate.getMonth() - 2)

    mockFindMany.mockResolvedValue([
      {
        id: "e1", userId: "u1", propertyId: null,
        category: "INSURANCE", label: "Assurance",
        amount: 80, date: oldDate, isRecurring: true, frequency: "MONTHLY", notes: null,
      },
    ])
    mockFindFirst.mockResolvedValue({ id: "already-exists" })

    await POST(authReq())

    expect(mockCreate).not.toHaveBeenCalled()
    delete process.env.CRON_SECRET
  })
})

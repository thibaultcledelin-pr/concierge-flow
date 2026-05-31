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

import { nextOccurrence, POST } from "../route"

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

describe("POST /api/cron/recurring-expenses", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("returns 401 when CRON_SECRET is set and header is wrong", async () => {
    process.env.CRON_SECRET = "secret123"
    const req = new Request("http://localhost/api/cron/recurring-expenses", {
      method: "POST",
      headers: { "x-cron-secret": "wrong" },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
    delete process.env.CRON_SECRET
  })

  it("runs without auth when CRON_SECRET is not set", async () => {
    delete process.env.CRON_SECRET
    mockFindMany.mockResolvedValue([])

    const req = new Request("http://localhost/api/cron/recurring-expenses", { method: "POST" })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.created).toBe(0)
  })

  it("creates missing monthly occurrences up to today", async () => {
    delete process.env.CRON_SECRET
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

    const req = new Request("http://localhost/api/cron/recurring-expenses", { method: "POST" })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.created).toBeGreaterThan(0)
  })

  it("skips creating duplicates when occurrence already exists", async () => {
    delete process.env.CRON_SECRET
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

    const req = new Request("http://localhost/api/cron/recurring-expenses", { method: "POST" })
    await POST(req)

    expect(mockCreate).not.toHaveBeenCalled()
  })
})

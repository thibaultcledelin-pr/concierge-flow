import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFindMany = vi.fn()
const mockCount = vi.fn()
const mockCreate = vi.fn()
const mockPropertyFindFirst = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    expense: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
    property: {
      findFirst: (...args: unknown[]) => mockPropertyFindFirst(...args),
    },
  },
}))

const mockGetUser = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
  }),
}))

import { GET, POST } from "../route"

describe("Expenses API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("GET /api/expenses", () => {
    it("returns 401 if not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const req = new Request("http://localhost/api/expenses")
      const res = await GET(req)
      expect(res.status).toBe(401)
    })

    it("returns expenses for authenticated user", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
      const mockExpenses = [{ id: "1", label: "Ménage", amount: 50 }]
      mockFindMany.mockResolvedValue(mockExpenses)
      mockCount.mockResolvedValue(1)

      const req = new Request("http://localhost/api/expenses")
      const res = await GET(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.expenses).toEqual(mockExpenses)
      expect(data.total).toBe(1)
    })

    it("filters by propertyId", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
      mockFindMany.mockResolvedValue([])
      mockCount.mockResolvedValue(0)

      const req = new Request("http://localhost/api/expenses?propertyId=prop-1")
      await GET(req)

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1", propertyId: "prop-1" },
        })
      )
    })

    it("filters by category", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
      mockFindMany.mockResolvedValue([])
      mockCount.mockResolvedValue(0)

      const req = new Request("http://localhost/api/expenses?category=CLEANING")
      await GET(req)

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1", category: "CLEANING" },
        })
      )
    })
  })

  describe("POST /api/expenses", () => {
    it("returns 401 if not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const req = new Request("http://localhost/api/expenses", {
        method: "POST",
        body: JSON.stringify({}),
      })
      const res = await POST(req)
      expect(res.status).toBe(401)
    })

    it("returns 400 for invalid data", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
      const req = new Request("http://localhost/api/expenses", {
        method: "POST",
        body: JSON.stringify({ label: "" }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it("creates expense with valid data", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
      const data = {
        category: "CLEANING",
        label: "Ménage studio",
        amount: 50,
        date: "2026-05-01",
      }
      mockCreate.mockResolvedValue({ id: "exp-1", ...data })

      const req = new Request("http://localhost/api/expenses", {
        method: "POST",
        body: JSON.stringify(data),
      })
      const res = await POST(req)

      expect(res.status).toBe(201)
    })

    it("validates property ownership when propertyId given", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
      mockPropertyFindFirst.mockResolvedValue(null)

      const req = new Request("http://localhost/api/expenses", {
        method: "POST",
        body: JSON.stringify({
          category: "CLEANING",
          label: "Ménage",
          amount: 50,
          date: "2026-05-01",
          propertyId: "00000000-0000-0000-0000-000000000000",
        }),
      })
      const res = await POST(req)
      expect(res.status).toBe(404)
    })
  })

  describe("pagination", () => {
    it("uses take and skip for pagination", async () => {
      const { readFileSync } = await import("fs")
      const source = readFileSync("src/app/api/expenses/route.ts", "utf-8")
      expect(source).toContain("take:")
      expect(source).toContain("skip:")
    })

    it("response includes total count", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } })
      mockFindMany.mockResolvedValue([])
      mockCount.mockResolvedValue(25)

      const req = new Request("http://localhost/api/expenses")
      const res = await GET(req)
      const data = await res.json()

      expect(data).toHaveProperty("total")
      expect(data).toHaveProperty("expenses")
    })
  })
})

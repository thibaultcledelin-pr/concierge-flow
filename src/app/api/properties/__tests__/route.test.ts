import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFindMany = vi.fn()
const mockCreate = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
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

import { GET, POST } from "../route"

describe("Properties API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("GET /api/properties", () => {
    it("returns 401 if not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const res = await GET()
      expect(res.status).toBe(401)
    })

    it("returns properties for authenticated user", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      })
      const mockProperties = [
        { id: "1", name: "Studio Marais", city: "Paris" },
      ]
      mockFindMany.mockResolvedValue(mockProperties)

      const res = await GET()
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual(mockProperties)
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        orderBy: { createdAt: "desc" },
      })
    })
  })

  describe("POST /api/properties", () => {
    it("returns 401 if not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const req = new Request("http://localhost/api/properties", {
        method: "POST",
        body: JSON.stringify({}),
      })
      const res = await POST(req)
      expect(res.status).toBe(401)
    })

    it("returns 400 for invalid data", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      })
      const req = new Request("http://localhost/api/properties", {
        method: "POST",
        body: JSON.stringify({ name: "" }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it("creates property with valid data", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      })
      const propertyData = {
        name: "Studio Marais",
        address: "12 rue de Rivoli",
        city: "Paris",
        type: "STUDIO",
        rooms: 1,
      }
      mockCreate.mockResolvedValue({ id: "new-1", ...propertyData })

      const req = new Request("http://localhost/api/properties", {
        method: "POST",
        body: JSON.stringify(propertyData),
      })
      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data.name).toBe("Studio Marais")
    })
  })
})

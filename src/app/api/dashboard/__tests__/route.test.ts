import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPropertyFindMany = vi.fn()
const mockExpenseFindMany = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: {
      findMany: (...args: unknown[]) => mockPropertyFindMany(...args),
    },
    expense: {
      findMany: (...args: unknown[]) => mockExpenseFindMany(...args),
    },
  },
}))

const mockGetUser = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
  }),
}))

import { GET } from "../route"

function mockRequest(params?: Record<string, string>) {
  const url = new URL("http://localhost/api/dashboard")
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  }
  return new Request(url)
}

describe("Dashboard API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 if not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await GET(mockRequest())
    expect(res.status).toBe(401)
  })

  it("returns dashboard data with stats", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
    mockPropertyFindMany.mockResolvedValue([
      {
        id: "prop-1",
        name: "Studio Marais",
        city: "Paris",
        bookings: [
          { totalAmount: 500, nights: 3, platform: "AIRBNB", checkIn: new Date("2026-05-01") },
          { totalAmount: 300, nights: 2, platform: "BOOKING", checkIn: new Date("2026-05-10") },
        ],
        expenses: [
          { amount: 100, date: new Date("2026-05-01") },
        ],
      },
    ])
    mockExpenseFindMany.mockResolvedValue([
      { amount: 50, date: new Date("2026-05-01") },
    ])

    const res = await GET(mockRequest())
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.stats.totalRevenue).toBe(800)
    expect(data.stats.totalExpenses).toBe(150)
    expect(data.stats.totalProfit).toBe(650)
    expect(data.stats.propertyCount).toBe(1)
  })

  it("returns profitability sorted by margin desc", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
    mockPropertyFindMany.mockResolvedValue([
      {
        id: "1", name: "Low", city: "Lyon",
        bookings: [{ totalAmount: 100, nights: 1, platform: "AIRBNB", checkIn: new Date() }],
        expenses: [{ amount: 80, date: new Date() }],
      },
      {
        id: "2", name: "High", city: "Paris",
        bookings: [{ totalAmount: 1000, nights: 5, platform: "AIRBNB", checkIn: new Date() }],
        expenses: [{ amount: 100, date: new Date() }],
      },
    ])
    mockExpenseFindMany.mockResolvedValue([])

    const res = await GET(mockRequest())
    const data = await res.json()

    expect(data.profitability[0].propertyName).toBe("High")
    expect(data.profitability[1].propertyName).toBe("Low")
  })

  it("returns platform breakdown", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
    mockPropertyFindMany.mockResolvedValue([
      {
        id: "1", name: "Test", city: "Paris",
        bookings: [
          { totalAmount: 500, nights: 3, platform: "AIRBNB", checkIn: new Date() },
          { totalAmount: 300, nights: 2, platform: "BOOKING", checkIn: new Date() },
        ],
        expenses: [],
      },
    ])
    mockExpenseFindMany.mockResolvedValue([])

    const res = await GET(mockRequest())
    const data = await res.json()

    expect(data.platformData).toHaveLength(2)
    const airbnb = data.platformData.find((p: { name: string }) => p.name === "AIRBNB")
    expect(airbnb.value).toBe(500)
  })

  it("returns empty state for user with no properties", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
    mockPropertyFindMany.mockResolvedValue([])
    mockExpenseFindMany.mockResolvedValue([])

    const res = await GET(mockRequest())
    const data = await res.json()

    expect(data.stats.totalRevenue).toBe(0)
    expect(data.profitability).toHaveLength(0)
    expect(data.chartData).toHaveLength(0)
  })

  describe("revenu net par nuitée (par logement)", () => {
    it("calcule le revenu net par nuitée de chaque logement", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
      mockPropertyFindMany.mockResolvedValue([
        {
          id: "p1", name: "Studio", city: "Paris",
          bookings: [{ totalAmount: 1000, nights: 10, platform: "AIRBNB", checkIn: new Date("2026-05-10") }],
          expenses: [],
        },
        {
          id: "p2", name: "Villa", city: "Cannes",
          bookings: [{ totalAmount: 2000, nights: 10, platform: "AIRBNB", checkIn: new Date("2026-05-10") }],
          expenses: [{ amount: 500, date: new Date("2026-05-15") }],
        },
      ])
      mockExpenseFindMany.mockResolvedValue([])

      const res = await GET(mockRequest())
      const data = await res.json()

      const may = data.revenuePerNightData.find((p: { month: string }) => p.month === "2026-05")
      // Studio = 1000/10 = 100€, Villa = (2000-500)/10 = 150€
      expect(may.Studio).toBe(100)
      expect(may.Villa).toBe(150)
    })

    it("exclut les logements sans aucune nuit et met null pour les mois sans données", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
      mockPropertyFindMany.mockResolvedValue([
        {
          id: "p1", name: "Actif", city: "Paris",
          bookings: [
            { totalAmount: 900, nights: 9, platform: "AIRBNB", checkIn: new Date("2026-04-10") },
            { totalAmount: 1000, nights: 10, platform: "AIRBNB", checkIn: new Date("2026-05-10") },
          ],
          expenses: [],
        },
        {
          id: "p2", name: "Recent", city: "Lyon",
          bookings: [{ totalAmount: 800, nights: 8, platform: "AIRBNB", checkIn: new Date("2026-05-10") }],
          expenses: [],
        },
        { id: "p3", name: "Vide", city: "Nice", bookings: [], expenses: [] },
      ])
      mockExpenseFindMany.mockResolvedValue([])

      const res = await GET(mockRequest())
      const data = await res.json()

      // "Vide" (aucune nuit) ne doit pas apparaître dans les courbes
      expect(data.propertyNames).toContain("Actif")
      expect(data.propertyNames).toContain("Recent")
      expect(data.propertyNames).not.toContain("Vide")

      // En avril, "Recent" n'a pas de données → null (pas un faux zéro)
      const april = data.revenuePerNightData.find((p: { month: string }) => p.month === "2026-04")
      expect(april.Recent).toBeNull()
      expect(april.Actif).toBe(100)
    })
  })
})

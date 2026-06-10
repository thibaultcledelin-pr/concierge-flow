import { describe, it, expect, vi, beforeEach } from "vitest"

const mockUpdate = vi.fn()
const mockGetUser = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { update: (...a: unknown[]) => mockUpdate(...a) } },
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: () => mockGetUser() } }),
}))

import { PUT } from "../route"

const req = (body: unknown) =>
  new Request("http://localhost/api/profile", {
    method: "PUT",
    body: JSON.stringify(body),
  })

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
  mockUpdate.mockResolvedValue({ id: "user-1", name: "Thibault", company: "Co" })
})

describe("PUT /api/profile", () => {
  it("renvoie 401 si non authentifié", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await PUT(req({ name: "X" }))
    expect(res.status).toBe(401)
  })

  it("renvoie 400 sur JSON invalide", async () => {
    const bad = new Request("http://localhost/api/profile", { method: "PUT", body: "{not-json" })
    const res = await PUT(bad)
    expect(res.status).toBe(400)
  })

  it("renvoie 400 si le nom est vide", async () => {
    const res = await PUT(req({ name: "   " }))
    expect(res.status).toBe(400)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("renvoie 400 si le nom dépasse la longueur max", async () => {
    const res = await PUT(req({ name: "a".repeat(200) }))
    expect(res.status).toBe(400)
  })

  it("met à jour le profil avec des données valides", async () => {
    const res = await PUT(req({ name: "Thibault", company: "Co" }))
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "Thibault", company: "Co" },
    })
  })
})

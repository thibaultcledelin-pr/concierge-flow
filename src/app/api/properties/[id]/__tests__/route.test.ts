import { describe, it, expect, vi, beforeEach } from "vitest"

const mockDeleteMany = vi.fn()
const mockGetUser = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: { property: { deleteMany: (...a: unknown[]) => mockDeleteMany(...a) } },
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: () => mockGetUser() } }),
}))

import { DELETE } from "../route"

const params = { params: Promise.resolve({ id: "prop-1" }) }

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
})

describe("DELETE /api/properties/[id]", () => {
  it("renvoie 401 si non authentifié", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await DELETE(new Request("http://localhost"), params)
    expect(res.status).toBe(401)
    expect(mockDeleteMany).not.toHaveBeenCalled()
  })

  it("supprime en filtrant par id ET userId (atomique)", async () => {
    mockDeleteMany.mockResolvedValue({ count: 1 })
    const res = await DELETE(new Request("http://localhost"), params)
    expect(res.status).toBe(200)
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { id: "prop-1", userId: "user-1" } })
  })

  it("renvoie 404 si le logement n'appartient pas à l'utilisateur (count 0)", async () => {
    mockDeleteMany.mockResolvedValue({ count: 0 })
    const res = await DELETE(new Request("http://localhost"), params)
    expect(res.status).toBe(404)
  })
})

import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useProfile } from "../use-profile"

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ name: "Sophie Martin", email: "sophie@test.fr", company: "Conciergerie Lyon" }),
      })
    )
  )
})

describe("useProfile", () => {
  it("charge le profil depuis /api/profile", async () => {
    const { result } = renderHook(() => useProfile())
    await waitFor(() => expect(result.current).not.toBeNull())
    expect(result.current).toEqual({
      name: "Sophie Martin",
      email: "sophie@test.fr",
      company: "Conciergerie Lyon",
    })
  })

  it("retourne null si le fetch échoue", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false }))
    )
    const { result } = renderHook(() => useProfile())
    // Petit délai pour laisser le fetch résoudre
    await new Promise((r) => setTimeout(r, 50))
    expect(result.current).toBeNull()
  })
})

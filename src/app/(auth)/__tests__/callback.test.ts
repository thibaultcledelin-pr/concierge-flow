import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "../callback/route"

const mockExchangeCode = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCode,
    },
  }),
}))

describe("Auth Callback", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("exchanges code and redirects to dashboard", async () => {
    mockExchangeCode.mockResolvedValue({ error: null })

    const request = new Request("http://localhost:3000/callback?code=test-code")
    const response = await GET(request)

    expect(mockExchangeCode).toHaveBeenCalledWith("test-code")
    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard")
  })

  it("redirects to custom next path when provided", async () => {
    mockExchangeCode.mockResolvedValue({ error: null })

    const request = new Request("http://localhost:3000/callback?code=test-code&next=/properties")
    const response = await GET(request)

    expect(response.headers.get("location")).toBe("http://localhost:3000/properties")
  })

  it("redirects to login when no code is provided", async () => {
    const request = new Request("http://localhost:3000/callback")
    const response = await GET(request)

    expect(response.headers.get("location")).toBe("http://localhost:3000/login")
  })

  it("redirects to login when code exchange fails", async () => {
    mockExchangeCode.mockResolvedValue({ error: { message: "Invalid code" } })

    const request = new Request("http://localhost:3000/callback?code=bad-code")
    const response = await GET(request)

    expect(response.headers.get("location")).toBe("http://localhost:3000/login")
  })
})

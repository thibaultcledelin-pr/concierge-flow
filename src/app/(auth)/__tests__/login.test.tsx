import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import LoginPage from "../login/page"

const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

const mockSignIn = vi.fn()
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignIn,
    },
  }),
}))

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders login form with email and password fields", () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument()
  })

  it("renders link to register page", () => {
    render(<LoginPage />)
    const link = screen.getByRole("link", { name: /cr\u00e9er un compte/i })
    expect(link).toHaveAttribute("href", "/register")
  })

  it("shows error message on failed login", async () => {
    mockSignIn.mockResolvedValue({ error: { message: "Invalid credentials" } })

    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@test.com" },
    })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: "wrongpassword" },
    })
    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }))

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    })
  })

  it("does not call setLoading(false) after router.push", async () => {
    const { readFileSync } = await import("fs")
    const source = readFileSync("src/app/(auth)/login/page.tsx", "utf-8")
    const afterPush = source.slice(source.indexOf("router.push"))
    const nextSetLoading = afterPush.indexOf("setLoading(false)")
    const functionEnd = afterPush.indexOf("}")
    if (nextSetLoading !== -1) {
      expect(nextSetLoading).toBeGreaterThan(functionEnd)
    }
  })

  it("redirects to dashboard on successful login", async () => {
    mockSignIn.mockResolvedValue({ error: null })

    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@test.com" },
    })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: "password123" },
    })
    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard")
    })
  })
})

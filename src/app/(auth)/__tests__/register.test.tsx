import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import RegisterPage from "../register/page"

const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

const mockSignUp = vi.fn()
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}))

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders register form with all fields", () => {
    render(<RegisterPage />)
    expect(screen.getByLabelText(/nom complet/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nom de la conciergerie/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cr\u00e9er mon compte/i })).toBeInTheDocument()
  })

  it("renders link to login page", () => {
    render(<RegisterPage />)
    const link = screen.getByRole("link", { name: /se connecter/i })
    expect(link).toHaveAttribute("href", "/login")
  })

  it("shows error message on failed registration", async () => {
    mockSignUp.mockResolvedValue({ error: { message: "Email already registered" } })

    render(<RegisterPage />)
    fireEvent.change(screen.getByLabelText(/nom complet/i), {
      target: { value: "Jean Dupont" },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@test.com" },
    })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: "password123" },
    })
    fireEvent.click(screen.getByRole("button", { name: /cr\u00e9er mon compte/i }))

    await waitFor(() => {
      expect(screen.getByText("Email already registered")).toBeInTheDocument()
    })
  })

  it("calls signUp with name and company metadata", async () => {
    mockSignUp.mockResolvedValue({ error: null })

    render(<RegisterPage />)
    fireEvent.change(screen.getByLabelText(/nom complet/i), {
      target: { value: "Jean Dupont" },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@test.com" },
    })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: "password123" },
    })
    fireEvent.change(screen.getByLabelText(/nom de la conciergerie/i), {
      target: { value: "Super Conciergerie" },
    })
    fireEvent.click(screen.getByRole("button", { name: /cr\u00e9er mon compte/i }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
        options: {
          data: {
            name: "Jean Dupont",
            company: "Super Conciergerie",
          },
        },
      })
    })
  })

  it("redirects to dashboard on successful registration", async () => {
    mockSignUp.mockResolvedValue({ error: null })

    render(<RegisterPage />)
    fireEvent.change(screen.getByLabelText(/nom complet/i), {
      target: { value: "Jean Dupont" },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@test.com" },
    })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: "password123" },
    })
    fireEvent.click(screen.getByRole("button", { name: /cr\u00e9er mon compte/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard")
    })
  })
})

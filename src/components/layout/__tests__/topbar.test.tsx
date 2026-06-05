import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Topbar } from "../topbar"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signOut: vi.fn() },
  }),
}))

vi.mock("@/hooks/use-profile", () => ({
  useProfile: () => ({ name: "Thibault Cledelin", email: "thibault@conciergeflow.fr", company: "MaConciergerie" }),
}))

describe("Topbar", () => {
  it("renders menu button for mobile", () => {
    render(<Topbar onMenuClick={vi.fn()} />)
    expect(screen.getByRole("button", { name: /ouvrir le menu/i })).toBeInTheDocument()
  })

  it("affiche les initiales de l'utilisateur connecté (pas MC en dur)", () => {
    render(<Topbar onMenuClick={vi.fn()} />)
    expect(screen.getAllByText("TC").length).toBeGreaterThan(0)
    expect(screen.queryByText("MC")).not.toBeInTheDocument()
  })

  it("n'affiche plus le sélecteur de période mort", () => {
    render(<Topbar onMenuClick={vi.fn()} />)
    expect(screen.queryByText("Ce mois")).not.toBeInTheDocument()
    expect(screen.queryByText("Mois dernier")).not.toBeInTheDocument()
  })

  it("calls onMenuClick when menu button is clicked", () => {
    const onMenuClick = vi.fn()
    render(<Topbar onMenuClick={onMenuClick} />)
    fireEvent.click(screen.getByRole("button", { name: /ouvrir le menu/i }))
    expect(onMenuClick).toHaveBeenCalledOnce()
  })

  it("affiche le bouton avatar avec les initiales (pas une valeur hardcodée)", () => {
    render(<Topbar onMenuClick={vi.fn()} />)
    const avatarButton = screen.getAllByText("TC")[0].closest("button")
    expect(avatarButton).toBeInTheDocument()
  })
})

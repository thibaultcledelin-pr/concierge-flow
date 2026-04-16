import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { Topbar } from "../topbar"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signOut: vi.fn() },
  }),
}))

describe("Topbar", () => {
  it("renders menu button for mobile", () => {
    render(<Topbar onMenuClick={vi.fn()} />)
    expect(screen.getByRole("button", { name: /ouvrir le menu/i })).toBeInTheDocument()
  })

  it("renders user avatar", () => {
    render(<Topbar onMenuClick={vi.fn()} />)
    expect(screen.getByText("CF")).toBeInTheDocument()
  })

  it("calls onMenuClick when menu button is clicked", () => {
    const onMenuClick = vi.fn()
    render(<Topbar onMenuClick={onMenuClick} />)
    screen.getByRole("button", { name: /ouvrir le menu/i }).click()
    expect(onMenuClick).toHaveBeenCalledOnce()
  })
})

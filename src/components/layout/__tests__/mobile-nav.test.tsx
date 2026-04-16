import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MobileNav } from "../mobile-nav"

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}))

describe("MobileNav", () => {
  it("renders navigation items when open", () => {
    render(<MobileNav open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Logements")).toBeInTheDocument()
    expect(screen.getByText("Revenus")).toBeInTheDocument()
    expect(screen.getByText("D\u00e9penses")).toBeInTheDocument()
    expect(screen.getByText("Alertes")).toBeInTheDocument()
  })

  it("renders ConciergeFlow branding when open", () => {
    render(<MobileNav open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText("ConciergeFlow")).toBeInTheDocument()
  })
})

import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { Sidebar } from "../sidebar"

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}))

describe("Sidebar", () => {
  it("renders ConciergeFlow branding", () => {
    render(<Sidebar />)
    expect(screen.getByText("ConciergeFlow")).toBeInTheDocument()
  })

  it("renders all navigation items", () => {
    render(<Sidebar />)
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Logements")).toBeInTheDocument()
    expect(screen.getByText("Revenus")).toBeInTheDocument()
    expect(screen.getByText("D\u00e9penses")).toBeInTheDocument()
    expect(screen.getByText("Alertes")).toBeInTheDocument()
  })

  it("renders navigation links with correct hrefs", () => {
    render(<Sidebar />)
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute("href", "/dashboard")
    expect(screen.getByText("Logements").closest("a")).toHaveAttribute("href", "/properties")
    expect(screen.getByText("Revenus").closest("a")).toHaveAttribute("href", "/revenue")
    expect(screen.getByText("D\u00e9penses").closest("a")).toHaveAttribute("href", "/expenses")
    expect(screen.getByText("Alertes").closest("a")).toHaveAttribute("href", "/alerts")
  })

  it("highlights active nav item in violet", () => {
    render(<Sidebar />)
    const dashboardLink = screen.getByText("Dashboard").closest("a")
    expect(dashboardLink?.className).toContain("text-violet-400")
  })
})

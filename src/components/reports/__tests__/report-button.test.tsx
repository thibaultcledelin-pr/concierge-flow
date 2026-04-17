import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ReportButton } from "../report-button"

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

describe("ReportButton", () => {
  it("renders button with PDF text", () => {
    render(<ReportButton propertyId="p1" propertyName="Studio" />)
    expect(screen.getByText("Rapport PDF")).toBeDefined()
  })

  it("renders as enabled by default", () => {
    render(<ReportButton propertyId="p1" propertyName="Studio" />)
    const button = screen.getByRole("button")
    expect(button).toHaveProperty("disabled", false)
  })

  it("accepts month prop", () => {
    render(<ReportButton propertyId="p1" propertyName="Studio" month="2026-04" />)
    expect(screen.getByRole("button")).toBeDefined()
  })
})

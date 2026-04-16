import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatsCards } from "../stats-cards"

describe("StatsCards", () => {
  it("renders all four KPI cards", () => {
    render(
      <StatsCards
        totalRevenue={5000}
        totalExpenses={2000}
        totalMargin={60}
        occupancyRate={75}
      />
    )
    expect(screen.getByText("Revenu total")).toBeInTheDocument()
    expect(screen.getByText("Dépenses")).toBeInTheDocument()
    expect(screen.getByText("Marge nette")).toBeInTheDocument()
    expect(screen.getByText("Taux d'occupation")).toBeInTheDocument()
  })

  it("formats currency values", () => {
    render(
      <StatsCards
        totalRevenue={5000}
        totalExpenses={2000}
        totalMargin={60}
        occupancyRate={75}
      />
    )
    expect(screen.getByText("60%")).toBeInTheDocument()
    expect(screen.getByText("75%")).toBeInTheDocument()
  })
})

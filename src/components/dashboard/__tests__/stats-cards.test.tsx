import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatsCards } from "../stats-cards"

describe("StatsCards", () => {
  it("renders all four KPI cards", () => {
    render(
      <StatsCards
        occupancyRate={75}
        avgRevenuePerNight={120}
        totalMargin={60}
        revPAR={95}
      />
    )
    expect(screen.getByText("Occupation moyenne")).toBeInTheDocument()
    expect(screen.getByText("Revenu net / nuit")).toBeInTheDocument()
    expect(screen.getByText("Marge nette")).toBeInTheDocument()
    expect(screen.getByText("RevPAR")).toBeInTheDocument()
  })

  it("formats values correctly", () => {
    render(
      <StatsCards
        occupancyRate={82.5}
        avgRevenuePerNight={95}
        totalMargin={45.2}
        revPAR={78}
      />
    )
    expect(screen.getByText("82.5%")).toBeInTheDocument()
    expect(screen.getByText("45.2%")).toBeInTheDocument()
  })
})

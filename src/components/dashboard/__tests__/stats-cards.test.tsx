import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatsCards } from "../stats-cards"

describe("StatsCards", () => {
  it("renders all six KPI cards", () => {
    render(
      <StatsCards
        occupancyRate={75}
        avgRevenuePerNight={120}
        totalMargin={60}
        revPAR={95}
        adr={150}
        totalRevenue={5000}
      />
    )
    expect(screen.getByText("Occupation moyenne")).toBeInTheDocument()
    expect(screen.getByText("Revenu net / nuit")).toBeInTheDocument()
    expect(screen.getByText("Marge nette")).toBeInTheDocument()
    expect(screen.getByText("RevPAR")).toBeInTheDocument()
    expect(screen.getByText("ADR")).toBeInTheDocument()
    expect(screen.getByText("Revenu total")).toBeInTheDocument()
  })

  it("formats values correctly", () => {
    render(
      <StatsCards
        occupancyRate={82.5}
        avgRevenuePerNight={95}
        totalMargin={45.2}
        revPAR={78}
        adr={130}
        totalRevenue={12000}
      />
    )
    expect(screen.getByText("82.5%")).toBeInTheDocument()
    expect(screen.getByText("45.2%")).toBeInTheDocument()
  })

  it("affiche le statut 'Excellente rentabilité' pour une marge >= 30", () => {
    render(
      <StatsCards occupancyRate={75} avgRevenuePerNight={120} totalMargin={42} revPAR={95} adr={150} totalRevenue={5000} />
    )
    expect(screen.getByText("Excellente rentabilité")).toBeInTheDocument()
  })

  it("affiche le statut 'Rentabilité correcte' pour une marge entre 10 et 30", () => {
    render(
      <StatsCards occupancyRate={75} avgRevenuePerNight={120} totalMargin={18} revPAR={95} adr={150} totalRevenue={5000} />
    )
    expect(screen.getByText("Rentabilité correcte")).toBeInTheDocument()
  })

  it("affiche le statut 'Rentabilité faible' pour une marge < 10", () => {
    render(
      <StatsCards occupancyRate={75} avgRevenuePerNight={120} totalMargin={4} revPAR={95} adr={150} totalRevenue={5000} />
    )
    expect(screen.getByText("Rentabilité faible")).toBeInTheDocument()
  })

  it("rend une sparkline quand une série est fournie", () => {
    const { container } = render(
      <StatsCards
        occupancyRate={75}
        avgRevenuePerNight={120}
        totalMargin={42}
        revPAR={95}
        adr={150}
        totalRevenue={5000}
        sparklines={{ margin: [10, 20, 30, 42], totalRevenue: [1000, 2000, 5000] }}
      />
    )
    expect(container.querySelector("svg")).toBeInTheDocument()
  })
})

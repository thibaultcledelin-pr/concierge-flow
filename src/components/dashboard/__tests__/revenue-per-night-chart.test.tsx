import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { RevenuePerNightChart } from "../revenue-per-night-chart"

const sampleData = [
  { month: "2026-04", Studio: 100, Villa: null },
  { month: "2026-05", Studio: 120, Villa: 150 },
]

describe("RevenuePerNightChart", () => {
  it("affiche un état vide sans données", () => {
    render(<RevenuePerNightChart data={[]} propertyNames={[]} />)
    expect(screen.getByText("Pas encore de données")).toBeInTheDocument()
  })

  it("affiche le graphique quand il y a des données", () => {
    render(<RevenuePerNightChart data={sampleData} propertyNames={["Studio", "Villa"]} />)
    expect(screen.getByText("Revenu net / nuitée")).toBeInTheDocument()
    // Pas l'état vide
    expect(screen.queryByText("Pas encore de données")).not.toBeInTheDocument()
  })
})

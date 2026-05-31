import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { RevenuePerNightChart } from "../revenue-per-night-chart"

const sampleData = [
  { month: "2026-04", Studio: 100, Villa: null, __avg: 100, __band: [100, 100] as [number, number] },
  { month: "2026-05", Studio: 120, Villa: 150, __avg: 135, __band: [120, 150] as [number, number] },
]

describe("RevenuePerNightChart", () => {
  it("affiche un état vide sans données", () => {
    render(<RevenuePerNightChart data={[]} propertyNames={[]} />)
    expect(screen.getByText("Pas encore de données")).toBeInTheDocument()
  })

  it("propose les deux vues, avec Moyenne active par défaut", () => {
    render(<RevenuePerNightChart data={sampleData} propertyNames={["Studio", "Villa"]} />)
    const moyenne = screen.getByRole("button", { name: "Moyenne" })
    const parLogement = screen.getByRole("button", { name: "Par logement" })
    expect(moyenne).toBeInTheDocument()
    expect(parLogement).toBeInTheDocument()
    // La vue par défaut "Moyenne" est mise en avant (variant default = pas outline)
    expect(moyenne.className).not.toContain("border-input")
  })

  it("bascule sur la vue Par logement au clic", () => {
    render(<RevenuePerNightChart data={sampleData} propertyNames={["Studio", "Villa"]} />)
    const parLogement = screen.getByRole("button", { name: "Par logement" })
    fireEvent.click(parLogement)
    // Après clic, "Par logement" devient le bouton actif
    expect(parLogement.className).not.toContain("border-input")
  })
})

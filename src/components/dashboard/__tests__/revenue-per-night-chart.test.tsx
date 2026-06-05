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
    expect(screen.getByText("Pas encore de donnees")).toBeInTheDocument()
  })

  it("affiche le graphique quand il y a des données", () => {
    render(<RevenuePerNightChart data={sampleData} propertyNames={["Studio", "Villa"]} />)
    expect(screen.getByText("Revenu / nuitée")).toBeInTheDocument()
    // Pas l'état vide
    expect(screen.queryByText("Pas encore de donnees")).not.toBeInTheDocument()
  })

  it("affiche le classement avec les logements et leur valeur du dernier mois", () => {
    render(<RevenuePerNightChart data={sampleData} propertyNames={["Studio", "Villa"]} />)
    expect(screen.getByText("Studio")).toBeInTheDocument()
    expect(screen.getByText("Villa")).toBeInTheDocument()
    // Dernière valeur renseignée de chaque logement
    expect(screen.getByText("120€")).toBeInTheDocument()
    expect(screen.getByText("150€")).toBeInTheDocument()
  })

  it("calcule la variation vs le mois précédent (Studio +20%)", () => {
    render(<RevenuePerNightChart data={sampleData} propertyNames={["Studio", "Villa"]} />)
    // Studio passe de 100 à 120 → +20%
    expect(screen.getByText("20%")).toBeInTheDocument()
    // Villa n'a qu'un seul mois renseigné → pas de variation
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1)
  })

  it("trie le classement par valeur décroissante du dernier mois", () => {
    render(<RevenuePerNightChart data={sampleData} propertyNames={["Studio", "Villa"]} />)
    const names = screen.getAllByText(/Studio|Villa/).map((el) => el.textContent)
    // Villa (150€) doit apparaître avant Studio (120€)
    expect(names.indexOf("Villa")).toBeLessThan(names.indexOf("Studio"))
  })
})

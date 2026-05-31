import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { PricingPlans } from "../pricing-plans"

describe("PricingPlans", () => {
  it("affiche les trois plans", () => {
    render(<PricingPlans />)
    expect(screen.getByText("Starter")).toBeInTheDocument()
    expect(screen.getByText("Pro")).toBeInTheDocument()
    expect(screen.getByText("Business")).toBeInTheDocument()
  })

  it("met en avant le plan Pro comme le plus populaire", () => {
    render(<PricingPlans />)
    expect(screen.getByText("Le plus populaire")).toBeInTheDocument()
  })

  it("affiche par défaut les tarifs annuels", () => {
    render(<PricingPlans />)
    // Tarifs annuels (équivalent mensuel) : 24 / 49 / 82
    expect(screen.getByText("24€")).toBeInTheDocument()
    expect(screen.getByText("49€")).toBeInTheDocument()
    expect(screen.getByText("82€")).toBeInTheDocument()
  })

  it("bascule vers les tarifs mensuels", () => {
    render(<PricingPlans />)
    fireEvent.click(screen.getByRole("button", { name: "Mensuel" }))
    // Tarifs mensuels : 29 / 59 / 99
    expect(screen.getByText("29€")).toBeInTheDocument()
    expect(screen.getByText("59€")).toBeInTheDocument()
    expect(screen.getByText("99€")).toBeInTheDocument()
  })

  it("affiche l'économie réalisée en facturation annuelle", () => {
    render(<PricingPlans />)
    // Pro : (59 - 49) × 12 = 120€ d'économie / an
    expect(screen.getByText(/économisez 120€/i)).toBeInTheDocument()
  })

  it("propose un CTA qui transporte le plan et la périodicité vers l'inscription", () => {
    render(<PricingPlans />)
    const proCta = screen.getByRole("link", { name: /choisir pro/i })
    expect(proCta).toHaveAttribute("href", "/register?plan=pro&billing=annual")
  })

  it("met à jour la périodicité du lien après bascule mensuelle", () => {
    render(<PricingPlans />)
    fireEvent.click(screen.getByRole("button", { name: "Mensuel" }))
    const starterCta = screen.getByRole("link", { name: /choisir starter/i })
    expect(starterCta).toHaveAttribute("href", "/register?plan=starter&billing=monthly")
  })

  it("inclut une offre sur-mesure au-delà de 30 logements", () => {
    render(<PricingPlans />)
    const link = screen.getByRole("link", { name: /nous contacter/i })
    expect(link).toHaveAttribute("href", "/register?plan=enterprise")
    expect(screen.getByText(/Plus de 30 logements/i)).toBeInTheDocument()
  })
})

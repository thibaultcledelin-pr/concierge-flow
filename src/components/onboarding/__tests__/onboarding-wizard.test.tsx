import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { OnboardingWizard } from "../onboarding-wizard"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

describe("OnboardingWizard", () => {
  it("renders welcome step initially", () => {
    render(<OnboardingWizard />)
    expect(screen.getByText("Bienvenue sur ConciergeFlow")).toBeDefined()
    expect(screen.getByText("Commencer")).toBeDefined()
  })

  it("advances to property form on click", () => {
    render(<OnboardingWizard />)
    fireEvent.click(screen.getByText("Commencer"))
    expect(screen.getByText("Ajoutez votre premier logement")).toBeDefined()
    expect(screen.getByLabelText("Nom du logement *")).toBeDefined()
  })

  it("shows required fields in property form", () => {
    render(<OnboardingWizard />)
    fireEvent.click(screen.getByText("Commencer"))
    expect(screen.getByLabelText("Nom du logement *")).toBeDefined()
    expect(screen.getByLabelText("Adresse *")).toBeDefined()
    expect(screen.getByLabelText("Ville *")).toBeDefined()
  })

  it("has optional iCal URL field", () => {
    render(<OnboardingWizard />)
    fireEvent.click(screen.getByText("Commencer"))
    expect(screen.getByLabelText("URL iCal Airbnb (optionnel)")).toBeDefined()
  })
})

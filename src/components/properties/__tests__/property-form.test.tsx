import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { PropertyForm } from "../property-form"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

describe("PropertyForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders all form fields", () => {
    render(<PropertyForm />)
    expect(screen.getByLabelText(/nom du logement/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/adresse/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ville/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/pi\u00e8ces/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/surface/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/loyer mensuel/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/url ical airbnb/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/url ical booking/i)).toBeInTheDocument()
  })

  it("shows 'Nouveau logement' title when creating", () => {
    render(<PropertyForm />)
    expect(screen.getByText("Nouveau logement")).toBeInTheDocument()
  })

  it("shows 'Modifier le logement' title when editing", () => {
    render(<PropertyForm propertyId="123" defaultValues={{ name: "Test" }} />)
    expect(screen.getByText("Modifier le logement")).toBeInTheDocument()
  })

  it("shows create button when creating", () => {
    render(<PropertyForm />)
    expect(screen.getByRole("button", { name: /cr\u00e9er le logement/i })).toBeInTheDocument()
  })

  it("shows save button when editing", () => {
    render(<PropertyForm propertyId="123" />)
    expect(screen.getByRole("button", { name: /enregistrer/i })).toBeInTheDocument()
  })

  it("has cancel button that exists", () => {
    render(<PropertyForm />)
    expect(screen.getByRole("button", { name: /annuler/i })).toBeInTheDocument()
  })
})

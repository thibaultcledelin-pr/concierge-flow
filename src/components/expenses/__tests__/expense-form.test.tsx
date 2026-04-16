import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ExpenseForm } from "../expense-form"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

const mockProperties = [
  { id: "1", name: "Studio Marais" },
  { id: "2", name: "Appart Bastille" },
]

describe("ExpenseForm", () => {
  it("renders form fields when open", () => {
    render(
      <ExpenseForm
        properties={mockProperties}
        open={true}
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    )
    expect(screen.getByLabelText(/libellé/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/montant/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
  })

  it("shows 'Nouvelle dépense' title when creating", () => {
    render(
      <ExpenseForm
        properties={mockProperties}
        open={true}
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    )
    expect(screen.getByText("Nouvelle dépense")).toBeInTheDocument()
  })

  it("shows 'Modifier la dépense' title when editing", () => {
    render(
      <ExpenseForm
        properties={mockProperties}
        open={true}
        onOpenChange={vi.fn()}
        defaultValues={{ id: "123", label: "Test", amount: 50, category: "CLEANING", date: "2026-01-01" }}
        onSuccess={vi.fn()}
      />
    )
    expect(screen.getByText("Modifier la dépense")).toBeInTheDocument()
  })

  it("renders recurring checkbox", () => {
    render(
      <ExpenseForm
        properties={mockProperties}
        open={true}
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    )
    expect(screen.getByLabelText(/dépense récurrente/i)).toBeInTheDocument()
  })

  it("has add and cancel buttons", () => {
    render(
      <ExpenseForm
        properties={mockProperties}
        open={true}
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    )
    expect(screen.getByRole("button", { name: /ajouter/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /annuler/i })).toBeInTheDocument()
  })
})

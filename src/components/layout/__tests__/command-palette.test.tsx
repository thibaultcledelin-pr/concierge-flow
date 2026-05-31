import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CommandPalette } from "../command-palette"

const push = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))

beforeEach(() => {
  push.mockClear()
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: "abc", name: "Villa Cannes", city: "Cannes" }]),
      })
    )
  )
})

describe("CommandPalette", () => {
  it("affiche un déclencheur de recherche", () => {
    render(<CommandPalette />)
    expect(screen.getByRole("button", { name: /recherche globale/i })).toBeInTheDocument()
  })

  it("ouvre la palette au clic et affiche les pages de navigation", () => {
    render(<CommandPalette />)
    fireEvent.click(screen.getByRole("button", { name: /recherche globale/i }))
    expect(screen.getByPlaceholderText(/rechercher une page/i)).toBeInTheDocument()
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Calendrier")).toBeInTheDocument()
  })

  it("ouvre la palette via le raccourci ⌘K", () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { key: "k", metaKey: true })
    expect(screen.getByPlaceholderText(/rechercher une page/i)).toBeInTheDocument()
  })

  it("charge et affiche les logements", async () => {
    render(<CommandPalette />)
    fireEvent.click(screen.getByRole("button", { name: /recherche globale/i }))
    expect(await screen.findByText("Villa Cannes")).toBeInTheDocument()
    // La ville s'affiche en sous-libellé
    expect(screen.getByText("Cannes")).toBeInTheDocument()
    // L'en-tête de groupe + l'item de navigation "Logements" sont présents
    expect(screen.getAllByText("Logements").length).toBeGreaterThanOrEqual(2)
  })

  it("filtre les résultats selon la recherche", async () => {
    render(<CommandPalette />)
    fireEvent.click(screen.getByRole("button", { name: /recherche globale/i }))
    await screen.findByText("Villa Cannes")
    fireEvent.change(screen.getByPlaceholderText(/rechercher une page/i), { target: { value: "villa" } })
    expect(screen.getByText("Villa Cannes")).toBeInTheDocument()
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
  })

  it("navigue vers la page sélectionnée à la validation", async () => {
    render(<CommandPalette />)
    fireEvent.click(screen.getByRole("button", { name: /recherche globale/i }))
    const input = screen.getByPlaceholderText(/rechercher une page/i)
    fireEvent.change(input, { target: { value: "calendrier" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(push).toHaveBeenCalledWith("/calendar")
  })
})

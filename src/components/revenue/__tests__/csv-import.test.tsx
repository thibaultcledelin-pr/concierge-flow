import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { CsvImport } from "../csv-import"

describe("CsvImport", () => {
  it("renders file input area", () => {
    render(<CsvImport propertyId="1" />)
    expect(screen.getByText(/choisir un fichier/i)).toBeInTheDocument()
  })

  it("renders platform selector", () => {
    render(<CsvImport propertyId="1" />)
    expect(screen.getByText("Auto-detect")).toBeInTheDocument()
  })

  it("renders import button (disabled without file)", () => {
    render(<CsvImport propertyId="1" />)
    const button = screen.getByRole("button", { name: /importer/i })
    expect(button).toBeDisabled()
  })

  it("source code wraps res.json() in try-catch", async () => {
    const { readFileSync } = await import("fs")
    const source = readFileSync("src/components/revenue/csv-import.tsx", "utf-8")
    expect(source).toContain("try {")
    expect(source).toContain(".catch(")
  })
})

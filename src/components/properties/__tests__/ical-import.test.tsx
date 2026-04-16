import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { IcalImport } from "../ical-import"

describe("IcalImport", () => {
  it("shows message when no iCal URL configured", () => {
    render(<IcalImport propertyId="1" hasIcalUrl={false} />)
    expect(screen.getByText(/ajoutez une url ical/i)).toBeInTheDocument()
  })

  it("shows sync button when iCal URL is configured", () => {
    render(<IcalImport propertyId="1" hasIcalUrl={true} />)
    expect(screen.getByRole("button", { name: /synchroniser ical/i })).toBeInTheDocument()
  })

  it("button is clickable", () => {
    render(<IcalImport propertyId="1" hasIcalUrl={true} />)
    const button = screen.getByRole("button", { name: /synchroniser ical/i })
    expect(button).not.toBeDisabled()
  })
})

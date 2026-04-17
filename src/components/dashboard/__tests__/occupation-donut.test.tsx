import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { OccupationDonut } from "../occupation-donut"

describe("OccupationDonut", () => {
  it("renders the rate percentage", () => {
    render(<OccupationDonut rate={82.5} />)
    expect(screen.getByText("82.5%")).toBeDefined()
  })

  it("renders custom label", () => {
    render(<OccupationDonut rate={50} label="Mon taux" />)
    expect(screen.getByText("Mon taux")).toBeDefined()
  })

  it("renders default label", () => {
    render(<OccupationDonut rate={50} />)
    expect(screen.getByText("Occupation")).toBeDefined()
  })

  it("displays 'ce mois' subtitle", () => {
    render(<OccupationDonut rate={70} />)
    expect(screen.getByText("ce mois")).toBeDefined()
  })

  it("caps rate at 100 for the chart", () => {
    render(<OccupationDonut rate={150} />)
    expect(screen.getByText("150%")).toBeDefined()
  })
})

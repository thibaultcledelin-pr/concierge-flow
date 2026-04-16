import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ProfitabilityTable } from "../profitability-table"

describe("ProfitabilityTable", () => {
  it("shows empty state when no data", () => {
    render(<ProfitabilityTable data={[]} />)
    expect(screen.getByText(/ajoutez des logements/i)).toBeInTheDocument()
  })

  it("renders property rows", () => {
    render(
      <ProfitabilityTable
        data={[
          {
            propertyId: "1",
            propertyName: "Studio Marais",
            city: "Paris",
            revenue: 1000,
            expenses: 200,
            profit: 800,
            margin: 80,
            nights: 15,
            bookings: 5,
          },
        ]}
      />
    )
    expect(screen.getByText("Studio Marais")).toBeInTheDocument()
    expect(screen.getByText("Paris")).toBeInTheDocument()
    expect(screen.getByText("80%")).toBeInTheDocument()
  })

  it("colors margin green when >= 30%", () => {
    render(
      <ProfitabilityTable
        data={[
          {
            propertyId: "1",
            propertyName: "Test",
            city: "Paris",
            revenue: 1000,
            expenses: 200,
            profit: 800,
            margin: 80,
            nights: 10,
            bookings: 3,
          },
        ]}
      />
    )
    const marginCell = screen.getByText("80%")
    expect(marginCell.className).toContain("text-green-400")
  })
})

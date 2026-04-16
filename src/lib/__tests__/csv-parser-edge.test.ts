import { describe, it, expect } from "vitest"
import { parseAirbnbCsv, parseBookingCsv } from "../csv-parser"

describe("CSV parser edge cases", () => {
  it("returns empty array for empty CSV", () => {
    const bookings = parseAirbnbCsv("")
    expect(bookings).toHaveLength(0)
  })

  it("returns empty array for headers-only CSV", () => {
    const bookings = parseAirbnbCsv("Confirmation code,Guest,Start date,End date,Earnings")
    expect(bookings).toHaveLength(0)
  })

  it("handles missing amount columns (defaults to 0)", () => {
    const csv = `Guest,Start date,End date
Jean,2026-05-01,2026-05-04`
    const bookings = parseAirbnbCsv(csv)
    expect(bookings).toHaveLength(1)
    expect(bookings[0].totalAmount).toBe(0)
  })

  it("handles amounts with various formats", () => {
    const csv = `Guest,Start date,End date,Earnings
Jean,2026-05-01,2026-05-04,1 200€`
    const bookings = parseAirbnbCsv(csv)
    expect(bookings[0].totalAmount).toBe(1200)
  })

  it("skips rows with invalid dates", () => {
    const csv = `Guest,Start date,End date,Earnings
Jean,not-a-date,also-not-a-date,450`
    const bookings = parseAirbnbCsv(csv)
    expect(bookings).toHaveLength(0)
  })

  it("handles Booking CSV with empty rows", () => {
    const csv = `Guest Name,Check-in,Check-out,Total
,,,,
Pierre,2026-06-01,2026-06-05,800`
    const bookings = parseBookingCsv(csv)
    expect(bookings).toHaveLength(1)
  })

  it("handles special characters in guest names", () => {
    const csv = `Guest,Start date,End date,Earnings
François O'Brien,2026-05-01,2026-05-04,450`
    const bookings = parseAirbnbCsv(csv)
    expect(bookings[0].guestName).toBe("François O'Brien")
  })
})

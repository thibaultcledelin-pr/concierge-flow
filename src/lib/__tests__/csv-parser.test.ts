import { describe, it, expect } from "vitest"
import {
  parseAirbnbCsv,
  parseBookingCsv,
  detectCsvPlatform,
} from "../csv-parser"

const airbnbCsv = `Confirmation code,Guest,Start date,End date,Nights,Earnings,Host fee
ABC123,Jean Dupont,2026-05-01,2026-05-04,3,450\u20ac,45\u20ac
DEF456,Marie Martin,2026-05-10,2026-05-12,2,300\u20ac,30\u20ac`

const bookingCsv = `Booking number,Guest Name,Check-in,Check-out,Total,Commission
123456,Pierre Durand,2026-06-01,2026-06-05,800,120
789012,Sophie Leroy,2026-06-10,2026-06-13,500,75`

describe("parseAirbnbCsv", () => {
  it("parses Airbnb CSV rows", () => {
    const bookings = parseAirbnbCsv(airbnbCsv)
    expect(bookings).toHaveLength(2)
  })

  it("extracts guest name", () => {
    const bookings = parseAirbnbCsv(airbnbCsv)
    expect(bookings[0].guestName).toBe("Jean Dupont")
  })

  it("parses amounts correctly (removes \u20ac)", () => {
    const bookings = parseAirbnbCsv(airbnbCsv)
    expect(bookings[0].totalAmount).toBe(450)
  })

  it("calculates net amount from host fee", () => {
    const bookings = parseAirbnbCsv(airbnbCsv)
    expect(bookings[0].netAmount).toBe(405)
  })

  it("sets platform to AIRBNB", () => {
    const bookings = parseAirbnbCsv(airbnbCsv)
    expect(bookings[0].platform).toBe("AIRBNB")
  })

  it("calculates nights from dates", () => {
    const bookings = parseAirbnbCsv(airbnbCsv)
    expect(bookings[0].nights).toBe(3)
    expect(bookings[1].nights).toBe(2)
  })
})

describe("parseBookingCsv", () => {
  it("parses Booking CSV rows", () => {
    const bookings = parseBookingCsv(bookingCsv)
    expect(bookings).toHaveLength(2)
  })

  it("extracts guest name", () => {
    const bookings = parseBookingCsv(bookingCsv)
    expect(bookings[0].guestName).toBe("Pierre Durand")
  })

  it("parses total amount", () => {
    const bookings = parseBookingCsv(bookingCsv)
    expect(bookings[0].totalAmount).toBe(800)
  })

  it("calculates net amount from commission", () => {
    const bookings = parseBookingCsv(bookingCsv)
    expect(bookings[0].netAmount).toBe(680)
  })

  it("sets platform to BOOKING", () => {
    const bookings = parseBookingCsv(bookingCsv)
    expect(bookings[0].platform).toBe("BOOKING")
  })
})

describe("detectCsvPlatform", () => {
  it("detects Airbnb CSV", () => {
    expect(detectCsvPlatform(airbnbCsv)).toBe("AIRBNB")
  })

  it("detects Booking CSV", () => {
    expect(detectCsvPlatform(bookingCsv)).toBe("BOOKING")
  })

  it("returns UNKNOWN for unrecognized CSV", () => {
    expect(detectCsvPlatform("Name,Date,Value\ntest,2026-01-01,100")).toBe("UNKNOWN")
  })
})

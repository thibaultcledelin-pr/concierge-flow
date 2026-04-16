import { describe, it, expect } from "vitest"
import { parseIcal, detectPlatform } from "../ical-parser"

const sampleIcal = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:booking-001@airbnb.com
DTSTART;VALUE=DATE:20260501
DTEND;VALUE=DATE:20260504
SUMMARY:Jean Dupont
END:VEVENT
BEGIN:VEVENT
UID:booking-002@airbnb.com
DTSTART;VALUE=DATE:20260510
DTEND;VALUE=DATE:20260512
SUMMARY:Marie Martin
END:VEVENT
END:VCALENDAR`

const emptyIcal = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
END:VCALENDAR`

describe("parseIcal", () => {
  it("parses events from iCal data", () => {
    const bookings = parseIcal(sampleIcal)
    expect(bookings).toHaveLength(2)
  })

  it("extracts guest name from summary", () => {
    const bookings = parseIcal(sampleIcal)
    expect(bookings[0].guestName).toBe("Jean Dupont")
    expect(bookings[1].guestName).toBe("Marie Martin")
  })

  it("calculates correct number of nights", () => {
    const bookings = parseIcal(sampleIcal)
    expect(bookings[0].nights).toBe(3)
    expect(bookings[1].nights).toBe(2)
  })

  it("extracts external ID from UID", () => {
    const bookings = parseIcal(sampleIcal)
    expect(bookings[0].externalId).toBe("booking-001@airbnb.com")
    expect(bookings[1].externalId).toBe("booking-002@airbnb.com")
  })

  it("parses check-in and check-out dates", () => {
    const bookings = parseIcal(sampleIcal)
    expect(bookings[0].checkIn.getFullYear()).toBe(2026)
    expect(bookings[0].checkIn.getMonth()).toBe(4) // May = 4
    expect(bookings[0].checkIn.getDate()).toBe(1)
    expect(bookings[0].checkOut.getDate()).toBe(4)
  })

  it("returns empty array for calendar with no events", () => {
    const bookings = parseIcal(emptyIcal)
    expect(bookings).toHaveLength(0)
  })
})

describe("detectPlatform", () => {
  it("detects Airbnb URLs", () => {
    expect(detectPlatform("https://www.airbnb.com/calendar/ical/123.ics")).toBe("AIRBNB")
  })

  it("detects Booking URLs", () => {
    expect(detectPlatform("https://admin.booking.com/hotel/ical/123")).toBe("BOOKING")
  })

  it("returns OTHER for unknown URLs", () => {
    expect(detectPlatform("https://example.com/calendar.ics")).toBe("OTHER")
  })
})

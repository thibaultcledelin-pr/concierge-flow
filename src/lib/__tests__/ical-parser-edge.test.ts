import { describe, it, expect } from "vitest"
import { parseIcal } from "../ical-parser"

describe("parseIcal edge cases", () => {
  it("handles event without UID gracefully", () => {
    const ical = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260501
DTEND;VALUE=DATE:20260504
SUMMARY:No UID Guest
END:VEVENT
END:VCALENDAR`
    const bookings = parseIcal(ical)
    expect(bookings).toHaveLength(0)
  })

  it("handles event without dates gracefully", () => {
    const ical = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test-no-dates@test.com
SUMMARY:Missing Dates
END:VEVENT
END:VCALENDAR`
    const bookings = parseIcal(ical)
    expect(bookings).toHaveLength(0)
  })

  it("handles event without summary (null guest name)", () => {
    const ical = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test-no-summary@test.com
DTSTART;VALUE=DATE:20260501
DTEND;VALUE=DATE:20260504
END:VEVENT
END:VCALENDAR`
    const bookings = parseIcal(ical)
    expect(bookings).toHaveLength(1)
    expect(bookings[0].guestName).toBeNull()
  })

  it("skips events where checkOut equals checkIn (0 nights)", () => {
    const ical = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:zero-nights@test.com
DTSTART;VALUE=DATE:20260501
DTEND;VALUE=DATE:20260501
SUMMARY:Zero Nights
END:VEVENT
END:VCALENDAR`
    const bookings = parseIcal(ical)
    expect(bookings).toHaveLength(0)
  })

  it("handles malformed iCal data without crashing", () => {
    expect(() => parseIcal("this is not ical data")).toThrow()
  })

  it("handles empty string", () => {
    expect(() => parseIcal("")).toThrow()
  })
})

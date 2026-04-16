import ICAL from "ical.js"
import { calculateNights } from "@/lib/utils"

export interface ParsedBooking {
  guestName: string | null
  checkIn: Date
  checkOut: Date
  nights: number
  externalId: string
}

export function parseIcal(icalData: string): ParsedBooking[] {
  const jcal = ICAL.parse(icalData)
  const comp = new ICAL.Component(jcal)
  const events = comp.getAllSubcomponents("vevent")

  const bookings: ParsedBooking[] = []

  for (const event of events) {
    const icalEvent = new ICAL.Event(event)
    const uid = icalEvent.uid
    const summary = icalEvent.summary || null

    const dtstart = event.getFirstPropertyValue("dtstart")
    const dtend = event.getFirstPropertyValue("dtend")

    if (!dtstart || !dtend || !uid) continue

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkIn = (dtstart as any).toJSDate()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkOut = (dtend as any).toJSDate()
    const nights = calculateNights(checkIn, checkOut)

    if (nights <= 0) continue

    bookings.push({
      guestName: summary,
      checkIn,
      checkOut,
      nights,
      externalId: uid,
    })
  }

  return bookings
}

export function detectPlatform(icalUrl: string): "AIRBNB" | "BOOKING" | "OTHER" {
  if (icalUrl.includes("airbnb")) return "AIRBNB"
  if (icalUrl.includes("booking")) return "BOOKING"
  return "OTHER"
}

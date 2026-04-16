import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { parseIcal, detectPlatform } from "@/lib/ical-parser"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const property = await prisma.property.findFirst({
    where: { id, userId: user.id },
  })

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const urls: { url: string; platform: "AIRBNB" | "BOOKING" | "OTHER" }[] = []

  if (property.icalUrl) {
    urls.push({ url: property.icalUrl, platform: detectPlatform(property.icalUrl) })
  }
  if (property.icalUrlBooking) {
    urls.push({ url: property.icalUrlBooking, platform: detectPlatform(property.icalUrlBooking) })
  }

  if (urls.length === 0) {
    return NextResponse.json(
      { error: "No iCal URL configured" },
      { status: 400 }
    )
  }

  let created = 0
  let skipped = 0
  const errors: string[] = []

  for (const { url, platform } of urls) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        errors.push(`Failed to fetch ${platform} iCal: ${response.status}`)
        continue
      }

      const icalData = await response.text()
      const bookings = parseIcal(icalData)

      for (const booking of bookings) {
        const existing = await prisma.booking.findUnique({
          where: { externalId: booking.externalId },
        })

        if (existing) {
          skipped++
          continue
        }

        await prisma.booking.create({
          data: {
            propertyId: property.id,
            guestName: booking.guestName,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            nights: booking.nights,
            totalAmount: 0,
            platform,
            source: "ICAL",
            externalId: booking.externalId,
          },
        })
        created++
      }
    } catch (err) {
      errors.push(`Error processing ${platform} iCal: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  return NextResponse.json({ created, skipped, errors })
}

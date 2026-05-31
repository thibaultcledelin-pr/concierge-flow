import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { parseIcal, detectPlatform } from "@/lib/ical-parser"
import { isAllowedUrl } from "@/lib/url-validator"

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

  if (property.icalUrl && isAllowedUrl(property.icalUrl)) {
    urls.push({ url: property.icalUrl, platform: detectPlatform(property.icalUrl) })
  }
  if (property.icalUrlBooking && isAllowedUrl(property.icalUrlBooking)) {
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
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (!response.ok) {
        errors.push(`Failed to fetch ${platform} iCal`)
        continue
      }

      const icalData = await response.text()
      const bookings = parseIcal(icalData)

      for (const booking of bookings) {
        const result = await prisma.booking.upsert({
          where: { externalId: booking.externalId },
          update: {},
          create: {
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
        if (result.createdAt.getTime() > Date.now() - 5000) {
          created++
        } else {
          skipped++
        }
      }
    } catch (err) {
      console.error(`[sync-ical] Error processing ${platform} iCal for property ${property.id}:`, err)
      errors.push(`Error processing ${platform} iCal`)
    }
  }

  return NextResponse.json({ created, skipped, errors })
}

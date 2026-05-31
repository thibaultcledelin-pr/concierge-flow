import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { parseIcal, detectPlatform } from "@/lib/ical-parser"
import { isAllowedUrl } from "@/lib/url-validator"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const properties = await prisma.property.findMany({
    where: { userId: user.id },
  })

  let totalCreated = 0
  let totalSkipped = 0
  const results: { propertyName: string; created: number; skipped: number; error?: string }[] = []

  for (const property of properties) {
    const urls: { url: string; platform: "AIRBNB" | "BOOKING" | "OTHER" }[] = []

    if (property.icalUrl && isAllowedUrl(property.icalUrl)) {
      urls.push({ url: property.icalUrl, platform: detectPlatform(property.icalUrl) })
    }
    if (property.icalUrlBooking && isAllowedUrl(property.icalUrlBooking)) {
      urls.push({ url: property.icalUrlBooking, platform: detectPlatform(property.icalUrlBooking) })
    }

    if (urls.length === 0) {
      results.push({ propertyName: property.name, created: 0, skipped: 0, error: "Pas d'URL iCal" })
      continue
    }

    let created = 0
    let skipped = 0

    for (const { url, platform } of urls) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
        if (!response.ok) continue

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
      } catch {
        results.push({ propertyName: property.name, created, skipped, error: "Erreur de sync" })
        continue
      }
    }

    totalCreated += created
    totalSkipped += skipped
    results.push({ propertyName: property.name, created, skipped })
  }

  return NextResponse.json({ totalCreated, totalSkipped, results })
}

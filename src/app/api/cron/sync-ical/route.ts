import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseIcal, detectPlatform } from "@/lib/ical-parser"
import { isAllowedUrl } from "@/lib/url-validator"
import { requireCron } from "@/lib/cron-auth"

export async function GET(request: Request) {
  const denied = requireCron(request)
  if (denied) return denied

  const properties = await prisma.property.findMany({
    where: {
      OR: [
        { icalUrl: { not: null } },
        { icalUrlBooking: { not: null } },
      ],
    },
  })

  let totalCreated = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (const property of properties) {
    const urls: { url: string; platform: "AIRBNB" | "BOOKING" | "OTHER" }[] = []

    if (property.icalUrl && isAllowedUrl(property.icalUrl)) {
      urls.push({ url: property.icalUrl, platform: detectPlatform(property.icalUrl) })
    }
    if (property.icalUrlBooking && isAllowedUrl(property.icalUrlBooking)) {
      urls.push({ url: property.icalUrlBooking, platform: detectPlatform(property.icalUrlBooking) })
    }

    for (const { url, platform } of urls) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
        if (!response.ok) continue

        const icalData = await response.text()
        const bookings = parseIcal(icalData)

        for (const booking of bookings) {
          const existing = await prisma.booking.findUnique({
            where: { externalId: booking.externalId },
          })

          if (existing) {
            totalSkipped++
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
          totalCreated++
        }
      } catch {
        totalErrors++
      }
    }
  }

  return NextResponse.json({
    ok: true,
    totalCreated,
    totalSkipped,
    totalErrors,
    propertiesSynced: properties.length,
  })
}

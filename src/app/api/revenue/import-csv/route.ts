import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import {
  parseAirbnbCsv,
  parseBookingCsv,
  detectCsvPlatform,
} from "@/lib/csv-parser"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const propertyId = formData.get("propertyId") as string | null
  const platformOverride = formData.get("platform") as string | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (file.size > 5_000_000) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 5MB)" }, { status: 413 })
  }

  if (!propertyId) {
    return NextResponse.json({ error: "Property ID required" }, { status: 400 })
  }

  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId: user.id },
  })

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  }

  const csvData = await file.text()
  const platform = platformOverride || detectCsvPlatform(csvData)

  let bookings
  if (platform === "AIRBNB") {
    bookings = parseAirbnbCsv(csvData)
  } else if (platform === "BOOKING") {
    bookings = parseBookingCsv(csvData)
  } else {
    return NextResponse.json(
      { error: "Could not detect CSV format. Please select the platform manually." },
      { status: 400 }
    )
  }

  let created = 0
  let matched = 0

  for (const booking of bookings) {
    const existingBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        platform: booking.platform,
      },
    })

    if (existingBooking) {
      if (existingBooking.totalAmount === 0 && booking.totalAmount > 0) {
        await prisma.booking.update({
          where: { id: existingBooking.id },
          data: {
            totalAmount: booking.totalAmount,
            netAmount: booking.netAmount,
            guestName: booking.guestName || existingBooking.guestName,
          },
        })
        matched++
      }
      continue
    }

    await prisma.booking.create({
      data: {
        propertyId,
        guestName: booking.guestName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nights,
        totalAmount: booking.totalAmount,
        netAmount: booking.netAmount,
        platform: booking.platform,
        source: "CSV",
      },
    })
    created++
  }

  return NextResponse.json({
    created,
    matched,
    total: bookings.length,
  })
}

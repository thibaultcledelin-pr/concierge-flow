import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
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

  const { searchParams } = new URL(request.url)
  const page = Math.max(0, parseInt(searchParams.get("page") || "0"))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "100")))

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { propertyId: id },
      orderBy: { checkIn: "desc" },
      take: limit,
      skip: page * limit,
    }),
    prisma.booking.count({ where: { propertyId: id } }),
  ])

  return NextResponse.json({ bookings, total, page, limit })
}

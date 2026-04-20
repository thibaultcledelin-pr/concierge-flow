import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { propertySchema } from "@/lib/validators"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(properties)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const result = propertySchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    )
  }

  const property = await prisma.property.create({
    data: {
      ...result.data,
      icalUrl: result.data.icalUrl || null,
      icalUrlBooking: result.data.icalUrlBooking || null,
      ownerName: result.data.ownerName || null,
      ownerEmail: result.data.ownerEmail || null,
      userId: user.id,
    },
  })

  return NextResponse.json(property, { status: 201 })
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { propertySchema } from "@/lib/validators"

export async function GET(
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

  return NextResponse.json(property)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const existing = await prisma.property.findFirst({
    where: { id, userId: user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
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

  const property = await prisma.property.update({
    where: { id },
    data: {
      ...result.data,
      icalUrl: result.data.icalUrl || null,
      icalUrlBooking: result.data.icalUrlBooking || null,
      ownerName: result.data.ownerName || null,
      ownerEmail: result.data.ownerEmail || null,
    },
  })

  return NextResponse.json(property)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Suppression atomique : le filtre userId garantit qu'on ne supprime que
  // ses propres logements, sans fenêtre de course entre vérification et delete.
  const { count } = await prisma.property.deleteMany({
    where: { id, userId: user.id },
  })

  if (count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

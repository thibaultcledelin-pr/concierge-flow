import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { userUpdateSchema } from "@/lib/validators"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
  })

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({
    id: profile.id,
    email: user.email,
    name: profile.name,
    company: profile.company,
    createdAt: profile.createdAt,
  })
}

export async function PUT(request: Request) {
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

  const parsed = userUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation échouée", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }
  const { name, company } = parsed.data

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(company !== undefined && { company }),
    },
  })

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    company: updated.company,
  })
}

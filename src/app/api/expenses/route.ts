import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { expenseSchema } from "@/lib/validators"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const propertyId = searchParams.get("propertyId")
  const category = searchParams.get("category")

  const page = Math.max(0, parseInt(searchParams.get("page") || "0"))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "100")))

  const where: Record<string, unknown> = { userId: user.id }
  if (propertyId) where.propertyId = propertyId
  if (category) where.category = category

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { property: { select: { name: true } } },
      orderBy: { date: "desc" },
      take: limit,
      skip: page * limit,
    }),
    prisma.expense.count({ where }),
  ])

  return NextResponse.json({ expenses, total, page, limit })
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

  const result = expenseSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    )
  }

  if (result.data.propertyId) {
    const property = await prisma.property.findFirst({
      where: { id: result.data.propertyId, userId: user.id },
    })
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }
  }

  const expense = await prisma.expense.create({
    data: {
      ...result.data,
      date: new Date(result.data.date),
      userId: user.id,
    },
  })

  return NextResponse.json(expense, { status: 201 })
}

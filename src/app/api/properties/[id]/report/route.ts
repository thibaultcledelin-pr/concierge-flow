import { round1 } from "@/lib/utils"
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

  const { searchParams } = new URL(request.url)
  const monthParam = searchParams.get("month")

  const property = await prisma.property.findFirst({
    where: { id, userId: user.id },
    include: {
      bookings: true,
      expenses: true,
    },
  })

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Filtrer par mois si spécifié (format "2026-04")
  const bookings = monthParam
    ? property.bookings.filter((b) => new Date(b.checkIn).toISOString().slice(0, 7) === monthParam)
    : property.bookings

  const expenses = monthParam
    ? property.expenses.filter((e) => new Date(e.date).toISOString().slice(0, 7) === monthParam)
    : property.expenses

  const totalRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalNights = bookings.reduce((s, b) => s + b.nights, 0)
  const profit = totalRevenue - totalExpenses
  const margin = totalRevenue > 0 ? round1((profit / totalRevenue) * 100) : 0

  // Détail des réservations
  const bookingDetails = bookings
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
    .map((b) => ({
      guestName: b.guestName || "Voyageur",
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      nights: b.nights,
      amount: b.totalAmount,
      platform: b.platform,
    }))

  // Détail des dépenses par catégorie
  const expensesByCategory: Record<string, number> = {}
  for (const expense of expenses) {
    expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount
  }

  const expenseDetails = expenses
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((e) => ({
      label: e.label,
      category: e.category,
      amount: e.amount,
      date: e.date,
    }))

  return NextResponse.json({
    property: {
      name: property.name,
      address: property.address,
      city: property.city,
      type: property.type,
    },
    period: monthParam || "all",
    stats: {
      totalRevenue,
      totalExpenses,
      profit,
      margin,
      totalNights,
      bookingCount: bookings.length,
      adr: totalNights > 0 ? round1(totalRevenue / totalNights) : 0,
      revenuePerNight: totalNights > 0 ? round1(profit / totalNights) : 0,
    },
    bookingDetails,
    expenseDetails,
    expensesByCategory,
    generatedAt: new Date().toISOString(),
  })
}

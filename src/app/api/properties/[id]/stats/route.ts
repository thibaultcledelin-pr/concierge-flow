import { round1 } from "@/lib/utils"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"


function toMonthKey(date: Date): string {
  return new Date(date).toISOString().slice(0, 7)
}

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
    include: { bookings: true, expenses: true },
  })

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const revenue = property.bookings.reduce((sum, b) => sum + b.totalAmount, 0)
  const nights = property.bookings.reduce((sum, b) => sum + b.nights, 0)
  const expenses = property.expenses.reduce((sum, e) => sum + e.amount, 0)
  const profit = revenue - expenses
  const now = new Date()
  const daysThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const thisMonthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`
  const nightsThisMonth = property.bookings
    .filter((b) => new Date(b.checkIn).toISOString().slice(0, 7) === thisMonthKey)
    .reduce((sum, b) => sum + b.nights, 0)

  const stats = {
    revenue,
    expenses,
    profit,
    margin: revenue > 0 ? round1((profit / revenue) * 100) : 0,
    nights,
    bookingCount: property.bookings.length,
    expenseCount: property.expenses.length,
    occupancy: daysThisMonth > 0 ? round1(Math.min(100, (nightsThisMonth / daysThisMonth) * 100)) : 0,
    revenuePerNight: nights > 0 ? round1(profit / nights) : 0,
    adr: nights > 0 ? round1(revenue / nights) : 0,
  }

  // Données mensuelles pour le graphique revenus/dépenses
  const monthlyRevenue: Record<string, number> = {}
  const monthlyExpenses: Record<string, number> = {}

  for (const booking of property.bookings) {
    const month = toMonthKey(booking.checkIn)
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + booking.totalAmount
  }
  for (const expense of property.expenses) {
    const month = toMonthKey(expense.date)
    monthlyExpenses[month] = (monthlyExpenses[month] || 0) + expense.amount
  }

  const allMonths = [...new Set([
    ...Object.keys(monthlyRevenue),
    ...Object.keys(monthlyExpenses),
  ])].sort()

  const chartData = allMonths.map((month) => ({
    month,
    revenue: monthlyRevenue[month] || 0,
    expenses: monthlyExpenses[month] || 0,
    profit: (monthlyRevenue[month] || 0) - (monthlyExpenses[month] || 0),
  }))

  // 5 dernières réservations
  const recentBookings = property.bookings
    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
    .slice(0, 5)
    .map((b) => ({
      id: b.id,
      guestName: b.guestName,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      nights: b.nights,
      totalAmount: b.totalAmount,
      platform: b.platform,
    }))

  // 5 dernières dépenses
  const recentExpenses = property.expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      label: e.label,
      amount: e.amount,
      category: e.category,
      date: e.date,
    }))

  return NextResponse.json({
    property: {
      id: property.id,
      name: property.name,
      address: property.address,
      city: property.city,
      type: property.type,
      rooms: property.rooms,
      surface: property.surface,
      monthlyRent: property.monthlyRent,
    },
    stats,
    chartData,
    recentBookings,
    recentExpenses,
  })
}

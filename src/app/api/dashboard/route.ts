import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    include: {
      bookings: true,
      expenses: true,
    },
  })

  const globalExpenses = await prisma.expense.findMany({
    where: { userId: user.id, propertyId: null },
  })

  let totalRevenue = 0
  let totalExpenses = 0
  let totalNights = 0
  let totalDaysAvailable = 0
  const platformRevenue: Record<string, number> = {}

  const profitability = properties.map((property) => {
    const revenue = property.bookings.reduce((sum, b) => sum + b.totalAmount, 0)
    const nights = property.bookings.reduce((sum, b) => sum + b.nights, 0)
    const expenses = property.expenses.reduce((sum, e) => sum + e.amount, 0)
    const profit = revenue - expenses
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0

    totalRevenue += revenue
    totalExpenses += expenses
    totalNights += nights
    totalDaysAvailable += 30

    for (const booking of property.bookings) {
      const platform = booking.platform
      platformRevenue[platform] = (platformRevenue[platform] || 0) + booking.totalAmount
    }

    return {
      propertyId: property.id,
      propertyName: property.name,
      city: property.city,
      revenue,
      expenses,
      profit,
      margin: Math.round(margin * 10) / 10,
      nights,
      bookings: property.bookings.length,
    }
  })

  const globalExpenseTotal = globalExpenses.reduce((sum, e) => sum + e.amount, 0)
  totalExpenses += globalExpenseTotal

  const totalProfit = totalRevenue - totalExpenses
  const totalMargin = totalRevenue > 0
    ? Math.round(((totalProfit) / totalRevenue) * 1000) / 10
    : 0
  const occupancyRate = totalDaysAvailable > 0
    ? Math.round((totalNights / totalDaysAvailable) * 1000) / 10
    : 0

  const monthlyRevenue: Record<string, number> = {}
  const monthlyExpenses: Record<string, number> = {}

  for (const property of properties) {
    for (const booking of property.bookings) {
      const month = new Date(booking.checkIn).toISOString().slice(0, 7)
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + booking.totalAmount
    }
    for (const expense of property.expenses) {
      const month = new Date(expense.date).toISOString().slice(0, 7)
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + expense.amount
    }
  }
  for (const expense of globalExpenses) {
    const month = new Date(expense.date).toISOString().slice(0, 7)
    monthlyExpenses[month] = (monthlyExpenses[month] || 0) + expense.amount
  }

  const allMonths = [...new Set([...Object.keys(monthlyRevenue), ...Object.keys(monthlyExpenses)])].sort()
  const chartData = allMonths.map((month) => ({
    month,
    revenue: monthlyRevenue[month] || 0,
    expenses: monthlyExpenses[month] || 0,
    profit: (monthlyRevenue[month] || 0) - (monthlyExpenses[month] || 0),
  }))

  const platformData = Object.entries(platformRevenue).map(([name, value]) => ({
    name,
    value,
  }))

  return NextResponse.json({
    stats: {
      totalRevenue,
      totalExpenses,
      totalProfit,
      totalMargin,
      occupancyRate,
      propertyCount: properties.length,
    },
    profitability: profitability.sort((a, b) => b.margin - a.margin),
    chartData,
    platformData,
  })
}

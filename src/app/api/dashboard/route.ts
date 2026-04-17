import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

interface BookingRecord {
  totalAmount: number
  nights: number
  platform: string
  checkIn: Date
}

interface ExpenseRecord {
  amount: number
  date: Date
}

interface PropertyWithRelations {
  id: string
  name: string
  city: string | null
  bookings: BookingRecord[]
  expenses: ExpenseRecord[]
}

interface ProfitabilityEntry {
  margin: number
  occupancy: number
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const propertyId = searchParams.get("propertyId")

  const allProperties = await prisma.property.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const propertyFilter = propertyId
    ? { userId: user.id, id: propertyId }
    : { userId: user.id }

  const properties = await prisma.property.findMany({
    where: propertyFilter,
    include: {
      bookings: true,
      expenses: true,
    },
  })

  const globalExpenses = propertyId
    ? []
    : await prisma.expense.findMany({
        where: { userId: user.id, propertyId: null },
      })

  let totalRevenue = 0
  let totalExpenses = 0
  let totalNights = 0
  let totalDaysAvailable = 0
  const platformRevenue: Record<string, number> = {}

  const profitability = properties.map((property: PropertyWithRelations) => {
    const revenue = property.bookings.reduce((sum: number, b: BookingRecord) => sum + b.totalAmount, 0)
    const nights = property.bookings.reduce((sum: number, b: BookingRecord) => sum + b.nights, 0)
    const expenses = property.expenses.reduce((sum: number, e: ExpenseRecord) => sum + e.amount, 0)
    const profit = revenue - expenses
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0

    totalRevenue += revenue
    totalExpenses += expenses
    totalNights += nights
    const now = new Date()
    const daysThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    totalDaysAvailable += daysThisMonth

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
      occupancy: daysThisMonth > 0 ? Math.round((nights / daysThisMonth) * 1000) / 10 : 0,
      revenuePerNight: nights > 0 ? Math.round(((revenue - expenses) / nights) * 10) / 10 : 0,
    }
  })

  const globalExpenseTotal = globalExpenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)
  totalExpenses += globalExpenseTotal

  const totalProfit = totalRevenue - totalExpenses
  const totalMargin = totalRevenue > 0
    ? Math.round(((totalProfit) / totalRevenue) * 1000) / 10
    : 0
  const occupancyRate = totalDaysAvailable > 0
    ? Math.round((totalNights / totalDaysAvailable) * 1000) / 10
    : 0
  const avgRevenuePerNight = totalNights > 0
    ? Math.round((totalProfit / totalNights) * 10) / 10
    : 0
  const revPAR = totalDaysAvailable > 0
    ? Math.round((totalRevenue / totalDaysAvailable) * 10) / 10
    : 0
  const adr = totalNights > 0
    ? Math.round((totalRevenue / totalNights) * 10) / 10
    : 0

  // Monthly data for charts
  const monthlyRevenue: Record<string, number> = {}
  const monthlyExpenses: Record<string, number> = {}
  const monthlyNights: Record<string, number> = {}
  const monthlyPropertyNights: Record<string, Record<string, number>> = {}
  const monthlyPropertyRevenue: Record<string, Record<string, number>> = {}
  const monthlyPropertyExpenses: Record<string, Record<string, number>> = {}

  for (const property of properties) {
    for (const booking of (property as PropertyWithRelations).bookings) {
      const month = new Date(booking.checkIn).toISOString().slice(0, 7)
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + booking.totalAmount
      monthlyNights[month] = (monthlyNights[month] || 0) + booking.nights

      if (!monthlyPropertyNights[month]) monthlyPropertyNights[month] = {}
      monthlyPropertyNights[month][property.name] = (monthlyPropertyNights[month][property.name] || 0) + booking.nights

      if (!monthlyPropertyRevenue[month]) monthlyPropertyRevenue[month] = {}
      monthlyPropertyRevenue[month][property.name] = (monthlyPropertyRevenue[month][property.name] || 0) + booking.totalAmount
    }
    for (const expense of (property as PropertyWithRelations).expenses) {
      const month = new Date(expense.date).toISOString().slice(0, 7)
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + expense.amount

      if (!monthlyPropertyExpenses[month]) monthlyPropertyExpenses[month] = {}
      monthlyPropertyExpenses[month][property.name] = (monthlyPropertyExpenses[month][property.name] || 0) + expense.amount
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

  // Occupancy timeline
  const monthRegex = /^\d{4}-\d{2}$/
  const occupancyData = allMonths.filter((m) => monthRegex.test(m)).map((month) => {
    const daysInMonth = new Date(parseInt(month.slice(0, 4)), parseInt(month.slice(5, 7)), 0).getDate()
    const nights = monthlyNights[month] || 0
    const totalAvailable = daysInMonth * properties.length
    return {
      month,
      occupancy: totalAvailable > 0 ? Math.round((nights / totalAvailable) * 1000) / 10 : 0,
    }
  })

  // Revenue per night per property
  const propertyNames = properties.map((p: PropertyWithRelations) => p.name)
  const revenuePerNightData = allMonths.slice(-6).map((month) => {
    const point: Record<string, string | number> = { month }
    for (const name of propertyNames) {
      const rev = monthlyPropertyRevenue[month]?.[name] || 0
      const exp = monthlyPropertyExpenses[month]?.[name] || 0
      const nights = monthlyPropertyNights[month]?.[name] || 0
      point[name] = nights > 0 ? Math.round(((rev - exp) / nights) * 10) / 10 : 0
    }
    return point
  })

  // Occupancy per property (bar chart)
  const occupancyByProperty = profitability.map((p: { propertyName: string; occupancy: number }) => ({
    name: p.propertyName,
    occupancy: p.occupancy,
  })).sort((a: ProfitabilityEntry, b: ProfitabilityEntry) => b.occupancy - a.occupancy)

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
      avgRevenuePerNight,
      revPAR,
      adr,
      propertyCount: properties.length,
    },
    profitability: profitability.sort((a: ProfitabilityEntry, b: ProfitabilityEntry) => b.margin - a.margin),
    chartData,
    occupancyData,
    revenuePerNightData,
    propertyNames,
    occupancyByProperty,
    platformData,
    allProperties,
  })
}

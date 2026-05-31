import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

// --- Types partagés pour le dashboard ---

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

// Arrondi à 1 décimale (ex: 82.5)
function round1(value: number): number {
  return Math.round(value * 10) / 10
}

// Nombre de jours dans le mois courant
function daysInCurrentMonth(): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
}

// Nombre de jours dans un mois donné (ex: "2026-04" → 30)
function daysInMonth(monthKey: string): number {
  const year = parseInt(monthKey.slice(0, 4))
  const month = parseInt(monthKey.slice(5, 7))
  return new Date(year, month, 0).getDate()
}

// Extrait "2026-04" d'une date
function toMonthKey(date: Date): string {
  return new Date(date).toISOString().slice(0, 7)
}

// --- Calcul de la rentabilité par logement ---

function computePropertyProfitability(property: PropertyWithRelations) {
  const revenue = property.bookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
  const nights = property.bookings.reduce((sum, booking) => sum + booking.nights, 0)
  const expenses = property.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const profit = revenue - expenses
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
  const daysAvailable = daysInCurrentMonth()

  return {
    propertyId: property.id,
    propertyName: property.name,
    city: property.city,
    revenue,
    expenses,
    profit,
    margin: round1(margin),
    nights,
    bookings: property.bookings.length,
    occupancy: daysAvailable > 0 ? round1((nights / daysAvailable) * 100) : 0,
    revenuePerNight: nights > 0 ? round1(profit / nights) : 0,
  }
}

// --- Agrégation mensuelle pour les graphiques ---

interface MonthlyAggregation {
  revenue: Record<string, number>
  expenses: Record<string, number>
  nights: Record<string, number>
  propertyNights: Record<string, Record<string, number>>
  propertyRevenue: Record<string, Record<string, number>>
  propertyExpenses: Record<string, Record<string, number>>
}

function aggregateMonthlyData(
  properties: PropertyWithRelations[],
  globalExpenses: ExpenseRecord[],
): MonthlyAggregation {
  const agg: MonthlyAggregation = {
    revenue: {}, expenses: {}, nights: {},
    propertyNights: {}, propertyRevenue: {}, propertyExpenses: {},
  }

  for (const property of properties) {
    for (const booking of property.bookings) {
      const month = toMonthKey(booking.checkIn)
      agg.revenue[month] = (agg.revenue[month] || 0) + booking.totalAmount
      agg.nights[month] = (agg.nights[month] || 0) + booking.nights

      if (!agg.propertyNights[month]) agg.propertyNights[month] = {}
      agg.propertyNights[month][property.name] = (agg.propertyNights[month][property.name] || 0) + booking.nights

      if (!agg.propertyRevenue[month]) agg.propertyRevenue[month] = {}
      agg.propertyRevenue[month][property.name] = (agg.propertyRevenue[month][property.name] || 0) + booking.totalAmount
    }

    for (const expense of property.expenses) {
      const month = toMonthKey(expense.date)
      agg.expenses[month] = (agg.expenses[month] || 0) + expense.amount

      if (!agg.propertyExpenses[month]) agg.propertyExpenses[month] = {}
      agg.propertyExpenses[month][property.name] = (agg.propertyExpenses[month][property.name] || 0) + expense.amount
    }
  }

  // Dépenses globales (non rattachées à un logement)
  for (const expense of globalExpenses) {
    const month = toMonthKey(expense.date)
    agg.expenses[month] = (agg.expenses[month] || 0) + expense.amount
  }

  return agg
}

// --- Construction des données pour les graphiques ---

function buildChartData(agg: MonthlyAggregation, properties: PropertyWithRelations[]) {
  const allMonths = [...new Set([
    ...Object.keys(agg.revenue),
    ...Object.keys(agg.expenses),
  ])].sort()

  const monthRegex = /^\d{4}-\d{2}$/

  // Revenus vs Dépenses vs Marge par mois
  const revenueVsExpenses = allMonths.map((month) => ({
    month,
    revenue: agg.revenue[month] || 0,
    expenses: agg.expenses[month] || 0,
    profit: (agg.revenue[month] || 0) - (agg.expenses[month] || 0),
  }))

  // Taux d'occupation global par mois
  const occupancyTimeline = allMonths.filter((m) => monthRegex.test(m)).map((month) => {
    const nights = agg.nights[month] || 0
    const totalAvailable = daysInMonth(month) * properties.length
    return {
      month,
      occupancy: totalAvailable > 0 ? round1((nights / totalAvailable) * 100) : 0,
    }
  })

  // Revenu net par nuitée (6 derniers mois)
  const recentMonths = allMonths.filter((m) => monthRegex.test(m)).slice(-6)

  // On n'affiche que les logements ayant eu au moins une nuit sur la période
  // (évite les courbes plates à 0 des logements vides type "demo"/"test")
  const propertyNames = properties
    .map((property) => property.name)
    .filter((name) => recentMonths.some((month) => (agg.propertyNights[month]?.[name] || 0) > 0))

  const revenuePerNight = recentMonths.map((month) => {
    const point: Record<string, string | number | null> = { month }
    for (const name of propertyNames) {
      const nights = agg.propertyNights[month]?.[name] || 0
      if (nights > 0) {
        const rev = agg.propertyRevenue[month]?.[name] || 0
        const exp = agg.propertyExpenses[month]?.[name] || 0
        point[name] = round1((rev - exp) / nights)
      } else {
        // null = pas de données ce mois-là (courbe coupée, pas de faux zéro)
        point[name] = null
      }
    }
    return point
  })

  return { revenueVsExpenses, occupancyTimeline, revenuePerNight, propertyNames }
}

// --- Route API ---

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const propertyId = searchParams.get("propertyId")

  // Liste complète des logements (pour le sélecteur)
  const allProperties = await prisma.property.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  // Logements filtrés (un seul si propertyId, tous sinon)
  const properties = await prisma.property.findMany({
    where: propertyId ? { userId: user.id, id: propertyId } : { userId: user.id },
    include: { bookings: true, expenses: true },
  }) as PropertyWithRelations[]

  // Dépenses globales (exclues en vue mono-logement)
  const globalExpenses = propertyId
    ? []
    : await prisma.expense.findMany({ where: { userId: user.id, propertyId: null } }) as ExpenseRecord[]

  // Rentabilité par logement
  const profitability = properties.map(computePropertyProfitability)

  // KPIs globaux
  const totalRevenue = profitability.reduce((sum, p) => sum + p.revenue, 0)
  const propertyExpenses = profitability.reduce((sum, p) => sum + p.expenses, 0)
  const globalExpenseTotal = globalExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalExpenses = propertyExpenses + globalExpenseTotal
  const totalNights = profitability.reduce((sum, p) => sum + p.nights, 0)
  const totalDaysAvailable = daysInCurrentMonth() * properties.length
  const totalProfit = totalRevenue - totalExpenses

  const stats = {
    totalRevenue,
    totalExpenses,
    totalProfit,
    totalMargin: totalRevenue > 0 ? round1((totalProfit / totalRevenue) * 100) : 0,
    occupancyRate: totalDaysAvailable > 0 ? round1((totalNights / totalDaysAvailable) * 100) : 0,
    avgRevenuePerNight: totalNights > 0 ? round1(totalProfit / totalNights) : 0,
    revPAR: totalDaysAvailable > 0 ? round1(totalRevenue / totalDaysAvailable) : 0,
    adr: totalNights > 0 ? round1(totalRevenue / totalNights) : 0,
    propertyCount: properties.length,
  }

  // Répartition par plateforme (Airbnb, Booking, etc.)
  const platformRevenue: Record<string, number> = {}
  for (const property of properties) {
    for (const booking of property.bookings) {
      platformRevenue[booking.platform] = (platformRevenue[booking.platform] || 0) + booking.totalAmount
    }
  }
  const platformData = Object.entries(platformRevenue).map(([name, value]) => ({ name, value }))

  // Données mensuelles pour les graphiques
  const monthly = aggregateMonthlyData(properties, globalExpenses)
  const charts = buildChartData(monthly, properties)

  // Occupation par logement (triée par taux décroissant)
  const occupancyByProperty = profitability
    .map((p) => ({ name: p.propertyName, occupancy: p.occupancy }))
    .sort((a, b) => b.occupancy - a.occupancy)

  return NextResponse.json({
    stats,
    profitability: profitability.sort((a, b) => b.margin - a.margin),
    chartData: charts.revenueVsExpenses,
    occupancyData: charts.occupancyTimeline,
    revenuePerNightData: charts.revenuePerNight,
    propertyNames: charts.propertyNames,
    occupancyByProperty,
    platformData,
    allProperties,
  })
}

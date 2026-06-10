import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { round1 } from "@/lib/utils"

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

// Intervalle de dates pour l'occupation (défaut : 30 derniers jours)
function parseDateRange(fromParam: string | null, toParam: string | null) {
  const to = toParam ? new Date(`${toParam}T23:59:59`) : new Date()
  let from: Date
  if (fromParam) {
    from = new Date(`${fromParam}T00:00:00`)
  } else {
    from = new Date(to)
    from.setHours(0, 0, 0, 0)
    from.setDate(from.getDate() - 29)
  }
  return { from, to }
}

// Nombre de jours calendaires couverts par l'intervalle (inclusif)
function daysInRange(from: Date, to: Date): number {
  const a = new Date(from); a.setHours(0, 0, 0, 0)
  const b = new Date(to); b.setHours(0, 0, 0, 0)
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000) + 1)
}

// Nuits réservées dans l'intervalle (filtre sur la date d'arrivée)
function nightsInRange(bookings: BookingRecord[], from: Date, to: Date): number {
  return bookings
    .filter((b) => {
      const d = new Date(b.checkIn)
      return d >= from && d <= to
    })
    .reduce((sum, b) => sum + b.nights, 0)
}

// Mois courant au format "2026-04"
// Mois courant et précédent
function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`
}

function previousMonthKey(): string {
  const now = new Date()
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${prev.getFullYear()}-${(prev.getMonth() + 1).toString().padStart(2, "0")}`
}

// Calcule les KPIs pour un ensemble de bookings et expenses filtrés par mois
function computeKpisForMonth(
  bookings: BookingRecord[],
  expenses: ExpenseRecord[],
  monthKey: string,
  daysInMonthValue: number,
  propertyCount: number,
) {
  const monthBookings = bookings.filter((b) => toMonthKey(b.checkIn) === monthKey)
  const monthExpenses = expenses.filter((e) => toMonthKey(e.date) === monthKey)

  const revenue = monthBookings.reduce((s, b) => s + b.totalAmount, 0)
  const expensesTotal = monthExpenses.reduce((s, e) => s + e.amount, 0)
  const nights = monthBookings.reduce((s, b) => s + b.nights, 0)
  const profit = revenue - expensesTotal
  const daysAvailable = daysInMonthValue * propertyCount

  return {
    totalRevenue: revenue,
    totalExpenses: expensesTotal,
    totalProfit: profit,
    totalMargin: revenue > 0 ? round1((profit / revenue) * 100) : 0,
    occupancyRate: daysAvailable > 0 ? round1(Math.min(100, (nights / daysAvailable) * 100)) : 0,
    avgRevenuePerNight: nights > 0 ? round1(profit / nights) : 0,
    revPAR: daysAvailable > 0 ? round1(revenue / daysAvailable) : 0,
    adr: nights > 0 ? round1(revenue / nights) : 0,
  }
}

// Variation en % entre deux valeurs (null si la valeur précédente est 0)
function variation(current: number, previous: number): number | null {
  if (previous === 0) return null
  return round1(((current - previous) / Math.abs(previous)) * 100)
}

// --- Calcul de la rentabilité par logement ---

function computePropertyProfitability(property: PropertyWithRelations) {
  const revenue = property.bookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
  const nights = property.bookings.reduce((sum, booking) => sum + booking.nights, 0)
  const expenses = property.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const profit = revenue - expenses
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0

  // Occupation : nuits du mois en cours / jours du mois
  const thisMonth = currentMonthKey()
  const nightsThisMonth = property.bookings
    .filter((booking) => toMonthKey(booking.checkIn) === thisMonth)
    .reduce((sum, booking) => sum + booking.nights, 0)
  const daysAvailable = daysInCurrentMonth()
  const occupancy = daysAvailable > 0
    ? round1(Math.min(100, (nightsThisMonth / daysAvailable) * 100))
    : 0

  return {
    propertyId: property.id,
    propertyName: property.name,
    city: property.city,
    revenue,
    expenses,
    profit,
    margin: round1(margin),
    nights,
    nightsThisMonth,
    bookings: property.bookings.length,
    occupancy,
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
      occupancy: totalAvailable > 0 ? round1(Math.min(100, (nights / totalAvailable) * 100)) : 0,
    }
  })

  // Revenu brut par nuitée (6 derniers mois)
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
        // Revenu brut / nuitée (ADR) : stable et toujours positif, contrairement au
        // net qui explose quand une grosse dépense ponctuelle tombe sur un mois creux.
        point[name] = round1(rev / nights)
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
  // Intervalle d'occupation (défaut : 30 derniers jours)
  const { from, to } = parseDateRange(searchParams.get("from"), searchParams.get("to"))

  // Liste complète des logements (pour le sélecteur)
  const allProperties = await prisma.property.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  // Logements filtrés (un seul si propertyId, tous sinon).
  // `select` ciblé : on ne charge que les colonnes réellement agrégées
  // (pas guestName, externalId, notes…) → moins de mémoire et de bande passante.
  const properties = await prisma.property.findMany({
    where: propertyId ? { userId: user.id, id: propertyId } : { userId: user.id },
    select: {
      id: true,
      name: true,
      city: true,
      bookings: { select: { totalAmount: true, nights: true, platform: true, checkIn: true } },
      expenses: { select: { amount: true, date: true } },
    },
  }) as PropertyWithRelations[]

  // Dépenses globales (exclues en vue mono-logement)
  const globalExpenses = propertyId
    ? []
    : await prisma.expense.findMany({
        where: { userId: user.id, propertyId: null },
        select: { amount: true, date: true },
      }) as ExpenseRecord[]

  // Rentabilité par logement
  const profitability = properties.map(computePropertyProfitability)

  // KPIs globaux
  const totalRevenue = profitability.reduce((sum, p) => sum + p.revenue, 0)
  const propertyExpenses = profitability.reduce((sum, p) => sum + p.expenses, 0)
  const globalExpenseTotal = globalExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalExpenses = propertyExpenses + globalExpenseTotal
  const totalNights = profitability.reduce((sum, p) => sum + p.nights, 0)
  const totalNightsThisMonth = profitability.reduce((sum, p) => sum + p.nightsThisMonth, 0)
  const totalDaysAvailable = daysInCurrentMonth() * properties.length
  const totalProfit = totalRevenue - totalExpenses

  const stats = {
    totalRevenue,
    totalExpenses,
    totalProfit,
    totalMargin: totalRevenue > 0 ? round1((totalProfit / totalRevenue) * 100) : 0,
    occupancyRate: totalDaysAvailable > 0
      ? round1(Math.min(100, (totalNightsThisMonth / totalDaysAvailable) * 100))
      : 0,
    avgRevenuePerNight: totalNights > 0 ? round1(totalProfit / totalNights) : 0,
    revPAR: totalDaysAvailable > 0 ? round1(totalRevenue / totalDaysAvailable) : 0,
    adr: totalNights > 0 ? round1(totalRevenue / totalNights) : 0,
    propertyCount: properties.length,
  }

  // Comparaison mois actuel vs mois précédent
  const allBookings = properties.flatMap((p) => p.bookings)
  const allExpenses = [
    ...properties.flatMap((p) => p.expenses),
    ...globalExpenses,
  ]
  const currentMonth = currentMonthKey()
  const previousMonth = previousMonthKey()
  const daysCurrent = daysInCurrentMonth()
  const daysPrevious = new Date(
    parseInt(previousMonth.slice(0, 4)),
    parseInt(previousMonth.slice(5, 7)),
    0,
  ).getDate()

  const currentStats = computeKpisForMonth(allBookings, allExpenses, currentMonth, daysCurrent, properties.length)
  const previousStats = computeKpisForMonth(allBookings, allExpenses, previousMonth, daysPrevious, properties.length)

  const comparison = {
    totalRevenue: variation(currentStats.totalRevenue, previousStats.totalRevenue),
    totalExpenses: variation(currentStats.totalExpenses, previousStats.totalExpenses),
    totalProfit: variation(currentStats.totalProfit, previousStats.totalProfit),
    totalMargin: variation(currentStats.totalMargin, previousStats.totalMargin),
    occupancyRate: variation(currentStats.occupancyRate, previousStats.occupancyRate),
    avgRevenuePerNight: variation(currentStats.avgRevenuePerNight, previousStats.avgRevenuePerNight),
    revPAR: variation(currentStats.revPAR, previousStats.revPAR),
    adr: variation(currentStats.adr, previousStats.adr),
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

  // Occupation sur l'intervalle choisi (global + par logement)
  const rangeDays = daysInRange(from, to)
  const totalNightsRange = properties.reduce((sum, p) => sum + nightsInRange(p.bookings, from, to), 0)
  const availableRange = rangeDays * properties.length
  const occupancyRange = availableRange > 0
    ? round1(Math.min(100, (totalNightsRange / availableRange) * 100))
    : 0

  const occupancyByProperty = properties
    // On exclut les logements sans aucune réservation (ex. "test"/"demo")
    .filter((p) => p.bookings.length > 0)
    .map((p) => ({
      name: p.name,
      occupancy: rangeDays > 0
        ? round1(Math.min(100, (nightsInRange(p.bookings, from, to) / rangeDays) * 100))
        : 0,
    }))
    .sort((a, b) => b.occupancy - a.occupancy)

  return NextResponse.json({
    stats,
    profitability: profitability.sort((a, b) => b.margin - a.margin),
    chartData: charts.revenueVsExpenses,
    occupancyData: charts.occupancyTimeline,
    revenuePerNightData: charts.revenuePerNight,
    propertyNames: charts.propertyNames,
    occupancyByProperty,
    occupancyRange,
    platformData,
    allProperties,
    comparison,
  })
}

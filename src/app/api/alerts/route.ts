import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { round1 } from "@/lib/utils"

interface PropertyData {
  id: string
  name: string
  bookings: { totalAmount: number; nights: number; checkIn: Date }[]
  expenses: { amount: number }[]
}

interface Alert {
  type: "danger" | "warning" | "info"
  title: string
  message: string
  propertyName: string
  propertyId: string
}


function generateAlerts(properties: PropertyData[]): Alert[] {
  const alerts: Alert[] = []
  const now = new Date()
  const daysThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  for (const property of properties) {
    const revenue = property.bookings.reduce((s, b) => s + b.totalAmount, 0)
    const expenses = property.expenses.reduce((s, e) => s + e.amount, 0)
    const nights = property.bookings.reduce((s, b) => s + b.nights, 0)
    const profit = revenue - expenses
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0
    const thisMonthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`
    const nightsThisMonth = property.bookings
      .filter((b) => new Date(b.checkIn).toISOString().slice(0, 7) === thisMonthKey)
      .reduce((s, b) => s + b.nights, 0)
    const occupancy = daysThisMonth > 0 ? Math.min(100, (nightsThisMonth / daysThisMonth) * 100) : 0

    // Marge négative = le logement perd de l'argent
    if (profit < 0) {
      alerts.push({
        type: "danger",
        title: "Marge négative",
        message: `${property.name} perd ${Math.abs(round1(profit))}€ ce mois-ci. Les dépenses dépassent les revenus.`,
        propertyName: property.name,
        propertyId: property.id,
      })
    } else if (margin < 15 && revenue > 0) {
      // Marge faible
      alerts.push({
        type: "warning",
        title: "Marge faible",
        message: `${property.name} a une marge de seulement ${round1(margin)}%. En dessous de 15%, la rentabilité est fragile.`,
        propertyName: property.name,
        propertyId: property.id,
      })
    }

    // Occupation basse
    if (occupancy < 40 && daysThisMonth > 0) {
      alerts.push({
        type: "warning",
        title: "Occupation basse",
        message: `${property.name} n'est occupé qu'à ${round1(occupancy)}% ce mois-ci. Pensez à ajuster vos tarifs.`,
        propertyName: property.name,
        propertyId: property.id,
      })
    }

    // Occupation excellente
    if (occupancy >= 90) {
      alerts.push({
        type: "info",
        title: "Occupation excellente",
        message: `${property.name} est à ${round1(occupancy)}% d'occupation. Vous pourriez augmenter vos tarifs.`,
        propertyName: property.name,
        propertyId: property.id,
      })
    }

    // Aucune réservation
    if (property.bookings.length === 0) {
      alerts.push({
        type: "warning",
        title: "Aucune réservation",
        message: `${property.name} n'a aucune réservation enregistrée. Importez vos réservations via iCal ou CSV.`,
        propertyName: property.name,
        propertyId: property.id,
      })
    }
  }

  // Tri : danger d'abord, puis warning, puis info
  const priority = { danger: 0, warning: 1, info: 2 }
  alerts.sort((a, b) => priority[a.type] - priority[b.type])

  return alerts
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    include: { bookings: true, expenses: true },
  })

  const alerts = generateAlerts(properties as PropertyData[])

  return NextResponse.json({ alerts })
}

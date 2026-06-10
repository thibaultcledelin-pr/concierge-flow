import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCron } from "@/lib/cron-auth"

// Décale une date selon la fréquence (WEEKLY → +7 jours, MONTHLY → +1 mois, etc.)
export function nextOccurrence(date: Date, frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"): Date {
  const next = new Date(date)
  switch (frequency) {
    case "WEEKLY":
      next.setDate(next.getDate() + 7)
      break
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1)
      break
    case "QUARTERLY":
      next.setMonth(next.getMonth() + 3)
      break
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1)
      break
  }
  return next
}

// Pour chaque dépense récurrente, recrée toutes les occurrences manquantes jusqu'à aujourd'hui
export async function runRecurringExpenses(now: Date = new Date()): Promise<{ created: number }> {
  const recurring = await prisma.expense.findMany({
    where: { isRecurring: true, frequency: { not: null } },
    orderBy: { date: "desc" },
  })

  // On groupe par "série" (même label + userId + propertyId) pour ne prendre que la plus récente
  const seen = new Set<string>()
  let created = 0

  for (const expense of recurring) {
    const key = `${expense.userId}|${expense.propertyId || ""}|${expense.label}|${expense.category}`
    if (seen.has(key)) continue
    seen.add(key)

    if (!expense.frequency) continue

    let currentDate = new Date(expense.date)
    const target = new Date(now)

    // Tant qu'on n'a pas rattrapé aujourd'hui, on crée la prochaine occurrence
    while (true) {
      const next = nextOccurrence(currentDate, expense.frequency)
      if (next > target) break

      // Vérifier qu'elle n'existe pas déjà (même série, même date)
      const nextMonthKey = next.toISOString().slice(0, 7)
      const existing = await prisma.expense.findFirst({
        where: {
          userId: expense.userId,
          propertyId: expense.propertyId,
          label: expense.label,
          category: expense.category,
          date: {
            gte: new Date(`${nextMonthKey}-01T00:00:00Z`),
            lt: new Date(next.getFullYear(), next.getMonth() + 1, 1),
          },
        },
      })

      if (!existing) {
        await prisma.expense.create({
          data: {
            userId: expense.userId,
            propertyId: expense.propertyId,
            category: expense.category,
            label: expense.label,
            amount: expense.amount,
            date: next,
            isRecurring: true,
            frequency: expense.frequency,
            notes: expense.notes,
          },
        })
        created++
      }

      currentDate = next
    }
  }

  return { created }
}

async function handle(request: Request) {
  const denied = requireCron(request)
  if (denied) return denied

  try {
    const result = await runRecurringExpenses()
    return NextResponse.json(result)
  } catch (err) {
    console.error("[cron/recurring-expenses] Error:", err)
    return NextResponse.json({ error: "Failed to run" }, { status: 500 })
  }
}

// GET : appelé par Vercel Cron (envoie `Authorization: Bearer <CRON_SECRET>`)
export async function GET(request: Request) {
  return handle(request)
}

// POST : déclenchement manuel (même protection)
export async function POST(request: Request) {
  return handle(request)
}

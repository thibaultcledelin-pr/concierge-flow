import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { nextOccurrence } from "@/app/api/cron/recurring-expenses/route"

// Version user-scoped : ne génère que les dépenses récurrentes de l'utilisateur connecté
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const recurring = await prisma.expense.findMany({
    where: { userId: user.id, isRecurring: true, frequency: { not: null } },
    orderBy: { date: "desc" },
  })

  const seen = new Set<string>()
  let created = 0
  const now = new Date()

  for (const expense of recurring) {
    const key = `${expense.propertyId || ""}|${expense.label}|${expense.category}`
    if (seen.has(key)) continue
    seen.add(key)

    if (!expense.frequency) continue

    let currentDate = new Date(expense.date)

    while (true) {
      const next = nextOccurrence(currentDate, expense.frequency)
      if (next > now) break

      const existing = await prisma.expense.findFirst({
        where: {
          userId: user.id,
          propertyId: expense.propertyId,
          label: expense.label,
          category: expense.category,
          date: {
            gte: new Date(next.getFullYear(), next.getMonth(), 1),
            lt: new Date(next.getFullYear(), next.getMonth() + 1, 1),
          },
        },
      })

      if (!existing) {
        await prisma.expense.create({
          data: {
            userId: user.id,
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

  return NextResponse.json({ created })
}

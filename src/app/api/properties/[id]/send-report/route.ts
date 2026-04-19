import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

function formatPeriod(period: string): string {
  if (period === "all") return "toute la période"
  const [year, month] = period.split("-")
  return `${MONTHS_FR[parseInt(month) - 1]} ${year}`
}

function round1(v: number): number {
  return Math.round(v * 10) / 10
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const month: string = body.month || "all"

  const property = await prisma.property.findFirst({
    where: { id, userId: user.id },
    include: { bookings: true, expenses: true },
  })

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!property.ownerEmail) {
    return NextResponse.json(
      { error: "Aucun email propriétaire configuré pour ce logement" },
      { status: 400 }
    )
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY manquante. Configurez-la dans .env." },
      { status: 500 }
    )
  }

  // Filtrer par mois
  const bookings = month !== "all"
    ? property.bookings.filter((b) => new Date(b.checkIn).toISOString().slice(0, 7) === month)
    : property.bookings

  const expenses = month !== "all"
    ? property.expenses.filter((e) => new Date(e.date).toISOString().slice(0, 7) === month)
    : property.expenses

  const totalRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const profit = totalRevenue - totalExpenses
  const margin = totalRevenue > 0 ? round1((profit / totalRevenue) * 100) : 0

  const periodLabel = formatPeriod(month)
  const ownerName = property.ownerName || "Bonjour"

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; border-radius: 12px 12px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Rapport mensuel — ${property.name}</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">${periodLabel}</p>
      </div>
      <div style="background: white; padding: 32px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
        <p>Bonjour ${ownerName},</p>
        <p>Voici le résumé de l'activité de votre logement <strong>${property.name}</strong> pour ${periodLabel}.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666;">Revenus</td>
            <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #22c55e;">${totalRevenue.toFixed(2)} €</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666;">Dépenses</td>
            <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #ef4444;">-${totalExpenses.toFixed(2)} €</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666;">Résultat net</td>
            <td style="padding: 12px 0; text-align: right; font-weight: 700; color: ${profit >= 0 ? "#22c55e" : "#ef4444"};">${profit.toFixed(2)} €</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #666;">Marge nette</td>
            <td style="padding: 12px 0; text-align: right; font-weight: 600;">${margin}%</td>
          </tr>
        </table>

        <p style="color: #666; font-size: 14px;">
          <strong>${bookings.length}</strong> réservation${bookings.length !== 1 ? "s" : ""} · <strong>${expenses.length}</strong> dépense${expenses.length !== 1 ? "s" : ""}
        </p>

        <p style="color: #888; font-size: 13px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5;">
          Rapport généré automatiquement par ConciergeFlow.
        </p>
      </div>
    </div>
  `

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ConciergeFlow <onboarding@resend.dev>",
      to: property.ownerEmail,
      subject: `Rapport ${periodLabel} — ${property.name}`,
      html,
    })

    return NextResponse.json({ success: true, sentTo: property.ownerEmail })
  } catch (err) {
    console.error("[send-report] Email error:", err)
    return NextResponse.json(
      { error: "Impossible d'envoyer l'email" },
      { status: 500 }
    )
  }
}

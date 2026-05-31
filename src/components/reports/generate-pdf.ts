import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { categoryLabels } from "@/lib/constants"

const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

function formatDate(date: string): string {
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`
}

function formatPeriod(period: string): string {
  if (period === "all") return "Toute la période"
  const [year, month] = period.split("-")
  return `${MONTHS_FR[parseInt(month) - 1]} ${year}`
}

interface ReportData {
  property: { name: string; address: string; city: string }
  period: string
  stats: {
    totalRevenue: number
    totalExpenses: number
    profit: number
    margin: number
    totalNights: number
    bookingCount: number
    adr: number
    revenuePerNight: number
  }
  bookingDetails: {
    guestName: string
    checkIn: string
    checkOut: string
    nights: number
    amount: number
    platform: string
  }[]
  expenseDetails: {
    label: string
    category: string
    amount: number
    date: string
  }[]
  expensesByCategory: Record<string, number>
  generatedAt: string
}

export function generateOwnerReport(data: ReportData) {
  const doc = new jsPDF()
  const { property, stats } = data
  let y = 20

  // Header
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("Rapport Propriétaire", 105, y, { align: "center" })
  y += 10

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`${property.name} — ${property.address}, ${property.city}`, 105, y, { align: "center" })
  y += 7
  doc.setFontSize(10)
  doc.text(`Période : ${formatPeriod(data.period)}`, 105, y, { align: "center" })
  y += 5
  doc.text(`Généré le ${formatDate(data.generatedAt)}`, 105, y, { align: "center" })
  y += 15

  // KPIs
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Résumé financier", 14, y)
  y += 8

  autoTable(doc, {
    startY: y,
    head: [["Indicateur", "Valeur"]],
    body: [
      ["Revenus totaux", `${stats.totalRevenue.toFixed(2)} €`],
      ["Dépenses totales", `${stats.totalExpenses.toFixed(2)} €`],
      ["Résultat net", `${stats.profit.toFixed(2)} €`],
      ["Marge nette", `${stats.margin}%`],
      ["Nuitées louées", `${stats.totalNights}`],
      ["Réservations", `${stats.bookingCount}`],
      ["Tarif moyen/nuit (ADR)", `${stats.adr.toFixed(2)} €`],
      ["Revenu net/nuit", `${stats.revenuePerNight.toFixed(2)} €`],
    ],
    theme: "grid",
    headStyles: { fillColor: [124, 58, 237] },
    styles: { fontSize: 10 },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 15

  // Réservations
  if (data.bookingDetails.length > 0) {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Détail des réservations", 14, y)
    y += 8

    autoTable(doc, {
      startY: y,
      head: [["Voyageur", "Arrivée", "Départ", "Nuits", "Montant", "Plateforme"]],
      body: data.bookingDetails.map((b) => [
        b.guestName,
        formatDate(b.checkIn),
        formatDate(b.checkOut),
        b.nights.toString(),
        `${b.amount.toFixed(2)} €`,
        b.platform,
      ]),
      theme: "grid",
      headStyles: { fillColor: [124, 58, 237] },
      styles: { fontSize: 9 },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 15
  }

  // Dépenses par catégorie
  if (Object.keys(data.expensesByCategory).length > 0) {
    if (y > 240) { doc.addPage(); y = 20 }

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Dépenses par catégorie", 14, y)
    y += 8

    autoTable(doc, {
      startY: y,
      head: [["Catégorie", "Montant"]],
      body: Object.entries(data.expensesByCategory)
        .sort(([, a], [, b]) => b - a)
        .map(([cat, amount]) => [
          categoryLabels[cat] || cat,
          `${amount.toFixed(2)} €`,
        ]),
      theme: "grid",
      headStyles: { fillColor: [124, 58, 237] },
      styles: { fontSize: 10 },
    })
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(`ConciergeFlow — Page ${i}/${pageCount}`, 105, 290, { align: "center" })
  }

  const filename = `rapport-${property.name.replace(/\s+/g, "-").toLowerCase()}-${data.period}.pdf`
  doc.save(filename)
}

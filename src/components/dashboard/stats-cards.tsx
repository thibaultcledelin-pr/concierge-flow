import { Calendar, DollarSign, Percent, TrendingUp, Tag, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface StatsCardsProps {
  occupancyRate: number
  avgRevenuePerNight: number
  totalMargin: number
  revPAR: number
  adr: number
  totalRevenue: number
}

export function StatsCards({ occupancyRate, avgRevenuePerNight, totalMargin, revPAR, adr, totalRevenue }: StatsCardsProps) {
  const cards = [
    {
      label: "Occupation moyenne",
      value: `${occupancyRate}%`,
      icon: Calendar,
      color: "text-violet-400",
      tooltip: "Pourcentage de nuits louées sur les nuits disponibles",
    },
    {
      label: "Revenu net / nuit",
      value: formatCurrency(avgRevenuePerNight),
      icon: DollarSign,
      color: "text-green-400",
      tooltip: "Profit net divisé par le nombre de nuits louées",
    },
    {
      label: "Marge nette",
      value: `${totalMargin}%`,
      icon: Percent,
      color: totalMargin >= 30 ? "text-green-400" : totalMargin >= 10 ? "text-yellow-400" : "text-red-400",
      tooltip: "Profit net divisé par le revenu total",
    },
    {
      label: "Revenu total",
      value: formatCurrency(totalRevenue),
      icon: BarChart3,
      color: "text-emerald-400",
      tooltip: "Total des revenus sur la période",
    },
    {
      label: "RevPAR",
      value: formatCurrency(revPAR),
      icon: TrendingUp,
      color: "text-blue-400",
      tooltip: "Revenu par nuit disponible — indicateur clé de performance",
    },
    {
      label: "ADR",
      value: formatCurrency(adr),
      icon: Tag,
      color: "text-orange-400",
      tooltip: "Tarif moyen par nuit louée — prix de vente effectif",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label} title={card.tooltip}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`rounded-lg bg-muted p-2.5 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-xl font-bold">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

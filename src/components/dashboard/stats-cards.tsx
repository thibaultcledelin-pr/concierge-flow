import { Calendar, DollarSign, Percent, TrendingUp, Tag, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { formatCurrency } from "@/lib/utils"

interface StatsCardsProps {
  occupancyRate: number
  avgRevenuePerNight: number
  totalMargin: number
  revPAR: number
  adr: number
  totalRevenue: number
  propertyName?: string
}

export function StatsCards({ occupancyRate, avgRevenuePerNight, totalMargin, revPAR, adr, totalRevenue, propertyName }: StatsCardsProps) {
  const scope = propertyName ? `pour ${propertyName}` : "sur l'ensemble de vos logements"

  const cards = [
    {
      label: "Occupation moyenne",
      value: `${occupancyRate}%`,
      icon: Calendar,
      color: "text-violet-400",
      info: `${occupancyRate}% des nuits disponibles ont été louées ${scope} ce mois-ci. Au-dessus de 70% c'est excellent.`,
    },
    {
      label: "Revenu net / nuit",
      value: formatCurrency(avgRevenuePerNight),
      icon: DollarSign,
      color: "text-green-400",
      info: `Chaque nuit louée rapporte en moyenne ${formatCurrency(avgRevenuePerNight)} net (après dépenses) ${scope}.`,
    },
    {
      label: "Marge nette",
      value: `${totalMargin}%`,
      icon: Percent,
      color: totalMargin >= 30 ? "text-green-400" : totalMargin >= 10 ? "text-yellow-400" : "text-red-400",
      info: `Sur chaque euro de revenu, ${totalMargin}% reste après toutes les dépenses ${scope}. ${totalMargin >= 30 ? "Excellente rentabilité." : totalMargin >= 10 ? "Rentabilité correcte." : "Attention, rentabilité faible."}`,
    },
    {
      label: "Revenu total",
      value: formatCurrency(totalRevenue),
      icon: BarChart3,
      color: "text-emerald-400",
      info: `Total des revenus encaissés ${scope} sur la période : ${formatCurrency(totalRevenue)}.`,
    },
    {
      label: "RevPAR",
      value: formatCurrency(revPAR),
      icon: TrendingUp,
      color: "text-blue-400",
      info: `Revenue Per Available Room-night. Chaque nuit disponible (louée ou non) génère ${formatCurrency(revPAR)} ${scope}. Combine occupation × tarif.`,
    },
    {
      label: "ADR",
      value: formatCurrency(adr),
      icon: Tag,
      color: "text-orange-400",
      info: `Average Daily Rate. Le tarif moyen par nuit effectivement louée est de ${formatCurrency(adr)} ${scope}. C'est votre prix de vente réel.`,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`rounded-lg bg-muted p-2.5 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <InfoTooltip text={card.info} />
              </div>
              <p className="text-xl font-bold">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

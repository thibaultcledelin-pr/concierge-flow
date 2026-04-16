import { Calendar, DollarSign, Percent, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface StatsCardsProps {
  occupancyRate: number
  avgRevenuePerNight: number
  totalMargin: number
  revPAR: number
}

export function StatsCards({ occupancyRate, avgRevenuePerNight, totalMargin, revPAR }: StatsCardsProps) {
  const cards = [
    {
      label: "Occupation moyenne",
      value: `${occupancyRate}%`,
      icon: Calendar,
      color: "text-violet-400",
    },
    {
      label: "Revenu net / nuit",
      value: formatCurrency(avgRevenuePerNight),
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      label: "Marge nette",
      value: `${totalMargin}%`,
      icon: Percent,
      color: totalMargin >= 30 ? "text-green-400" : totalMargin >= 10 ? "text-yellow-400" : "text-red-400",
    },
    {
      label: "RevPAR",
      value: formatCurrency(revPAR),
      icon: TrendingUp,
      color: "text-blue-400",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
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

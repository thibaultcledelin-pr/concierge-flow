import { DollarSign, TrendingDown, Percent, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface StatsCardsProps {
  totalRevenue: number
  totalExpenses: number
  totalMargin: number
  occupancyRate: number
}

const cards = [
  {
    key: "revenue" as const,
    label: "Revenu total",
    icon: DollarSign,
    color: "text-green-400",
    format: (v: number) => formatCurrency(v),
  },
  {
    key: "expenses" as const,
    label: "Dépenses",
    icon: TrendingDown,
    color: "text-red-400",
    format: (v: number) => `-${formatCurrency(v)}`,
  },
  {
    key: "margin" as const,
    label: "Marge nette",
    icon: Percent,
    color: "text-violet-400",
    format: (v: number) => `${v}%`,
  },
  {
    key: "occupancy" as const,
    label: "Taux d'occupation",
    icon: Calendar,
    color: "text-blue-400",
    format: (v: number) => `${v}%`,
  },
]

export function StatsCards({ totalRevenue, totalExpenses, totalMargin, occupancyRate }: StatsCardsProps) {
  const values = {
    revenue: totalRevenue,
    expenses: totalExpenses,
    margin: totalMargin,
    occupancy: occupancyRate,
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`rounded-lg bg-muted p-2.5 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-xl font-bold">{card.format(values[card.key])}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

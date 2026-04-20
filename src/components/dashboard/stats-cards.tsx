"use client"

import { Calendar, DollarSign, Percent, TrendingUp, Tag, BarChart3, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

export type KpiKey = "occupancy" | "revenuePerNight" | "margin" | "totalRevenue" | "revpar" | "adr"

export interface StatsComparison {
  totalRevenue: number | null
  totalExpenses: number | null
  totalProfit: number | null
  totalMargin: number | null
  occupancyRate: number | null
  avgRevenuePerNight: number | null
  revPAR: number | null
  adr: number | null
}

interface StatsCardsProps {
  occupancyRate: number
  avgRevenuePerNight: number
  totalMargin: number
  revPAR: number
  adr: number
  totalRevenue: number
  propertyName?: string
  activeCard?: KpiKey | null
  onCardClick?: (key: KpiKey) => void
  comparison?: StatsComparison
}

// Petit badge "+15%" / "-8%" avec flèche
function VariationBadge({ value, invertColor = false }: { value: number | null; invertColor?: boolean }) {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        —
      </span>
    )
  }

  // Pour les dépenses : augmenter est mauvais (invertColor=true)
  const isPositive = invertColor ? value < 0 : value > 0
  const isNegative = invertColor ? value > 0 : value < 0
  const isZero = value === 0

  const color = isZero
    ? "text-muted-foreground"
    : isPositive
      ? "text-green-400"
      : isNegative
        ? "text-red-400"
        : "text-muted-foreground"

  const Icon = isZero ? Minus : value > 0 ? ArrowUp : ArrowDown

  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", color)}>
      <Icon className="h-3 w-3" />
      {Math.abs(value)}%
    </span>
  )
}

export function StatsCards({ occupancyRate, avgRevenuePerNight, totalMargin, revPAR, adr, totalRevenue, propertyName, activeCard, onCardClick, comparison }: StatsCardsProps) {
  const scope = propertyName ? `pour ${propertyName}` : "sur l'ensemble de vos logements"

  const cards: { key: KpiKey; label: string; value: string; icon: typeof Calendar; color: string; info: string; variation: number | null }[] = [
    {
      key: "occupancy",
      label: "Occupation moyenne",
      value: `${occupancyRate}%`,
      icon: Calendar,
      color: "text-violet-400",
      info: `${occupancyRate}% des nuits disponibles ont été louées ${scope} ce mois-ci. Au-dessus de 70% c'est excellent.`,
      variation: comparison?.occupancyRate ?? null,
    },
    {
      key: "revenuePerNight",
      label: "Revenu net / nuit",
      value: formatCurrency(avgRevenuePerNight),
      icon: DollarSign,
      color: "text-green-400",
      info: `Chaque nuit louée rapporte en moyenne ${formatCurrency(avgRevenuePerNight)} net (après dépenses) ${scope}.`,
      variation: comparison?.avgRevenuePerNight ?? null,
    },
    {
      key: "margin",
      label: "Marge nette",
      value: `${totalMargin}%`,
      icon: Percent,
      color: totalMargin >= 30 ? "text-green-400" : totalMargin >= 10 ? "text-yellow-400" : "text-red-400",
      info: `Sur chaque euro de revenu, ${totalMargin}% reste après toutes les dépenses ${scope}. ${totalMargin >= 30 ? "Excellente rentabilité." : totalMargin >= 10 ? "Rentabilité correcte." : "Attention, rentabilité faible."}`,
      variation: comparison?.totalMargin ?? null,
    },
    {
      key: "totalRevenue",
      label: "Revenu total",
      value: formatCurrency(totalRevenue),
      icon: BarChart3,
      color: "text-emerald-400",
      info: `Total des revenus encaissés ${scope} sur la période : ${formatCurrency(totalRevenue)}.`,
      variation: comparison?.totalRevenue ?? null,
    },
    {
      key: "revpar",
      label: "RevPAR",
      value: formatCurrency(revPAR),
      icon: TrendingUp,
      color: "text-blue-400",
      info: `Revenue Per Available Room-night. Chaque nuit disponible (louée ou non) génère ${formatCurrency(revPAR)} ${scope}. Combine occupation × tarif.`,
      variation: comparison?.revPAR ?? null,
    },
    {
      key: "adr",
      label: "ADR",
      value: formatCurrency(adr),
      icon: Tag,
      color: "text-orange-400",
      info: `Average Daily Rate. Le tarif moyen par nuit effectivement louée est de ${formatCurrency(adr)} ${scope}. C'est votre prix de vente réel.`,
      variation: comparison?.adr ?? null,
    },
  ]

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const isActive = activeCard === card.key
        return (
          <Card
            key={card.key}
            className={cn(
              "cursor-pointer border-border/40 transition-all duration-200",
              isActive
                ? "border-violet-500/40 bg-violet-500/[0.04] ring-1 ring-violet-500/20"
                : "hover:border-border/70 hover:bg-white/[0.02]"
            )}
            onClick={() => onCardClick?.(card.key)}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-xl bg-white/[0.04] p-3 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.label}</p>
                  <InfoTooltip text={card.info} />
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                  {comparison && (
                    <div title="vs mois précédent">
                      <VariationBadge value={card.variation} />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

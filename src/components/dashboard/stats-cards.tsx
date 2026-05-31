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

// Petites séries temporelles optionnelles pour les sparklines (1 valeur par mois)
export type Sparklines = Partial<Record<KpiKey, number[]>>

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
  sparklines?: Sparklines
}

// Feu tricolore de la marge nette : vert ≥30, ambre ≥10, rouge en dessous
function marginStatus(margin: number): { color: string; dot: string; label: string } {
  if (margin >= 30) return { color: "text-green-400", dot: "bg-green-400", label: "Excellente rentabilité" }
  if (margin >= 10) return { color: "text-amber-400", dot: "bg-amber-400", label: "Rentabilité correcte" }
  return { color: "text-red-400", dot: "bg-red-400", label: "Rentabilité faible" }
}

// Sparkline SVG légère (pas de dépendance Recharts) — trend sur la période
function Sparkline({ data, className }: { data?: number[]; className?: string }) {
  if (!data || data.length < 2) return null
  const w = 96
  const h = 32
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const stepX = w / (data.length - 1)
  const points = data.map((v, i) => {
    const x = i * stepX
    const y = h - ((v - min) / span) * h
    return [x, y] as const
  })
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")
  const area = `${line} L${w} ${h} L0 ${h} Z`
  // Tendance globale : hausse → vert, baisse → rouge, stable → neutre
  const trendUp = data[data.length - 1] >= data[0]
  const stroke = trendUp ? "#4ade80" : "#f87171"
  const fillId = `spark-${trendUp ? "up" : "down"}`
  const [lastX, lastY] = points[points.length - 1]
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={cn("overflow-visible", className)} aria-hidden="true">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${fillId})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2.5} fill={stroke} />
    </svg>
  )
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

export function StatsCards({ occupancyRate, avgRevenuePerNight, totalMargin, revPAR, adr, totalRevenue, propertyName, activeCard, onCardClick, comparison, sparklines }: StatsCardsProps) {
  const scope = propertyName ? `pour ${propertyName}` : "sur l'ensemble de vos logements"
  const status = marginStatus(totalMargin)

  // Les 5 KPIs secondaires (la marge nette est mise en avant dans la carte hero)
  const cards: { key: KpiKey; label: string; value: string; icon: typeof Calendar; color: string; info: string; variation: number | null }[] = [
    {
      key: "occupancy",
      label: "Occupation moyenne",
      value: `${occupancyRate}%`,
      icon: Calendar,
      color: "text-amber-400",
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

  const marginActive = activeCard === "margin"

  return (
    <div className="space-y-5">
      {/* Carte hero — Marge nette mise en avant */}
      <Card
        className={cn(
          "cursor-pointer overflow-hidden border-border/40 transition-all duration-200",
          marginActive
            ? "border-amber-500/40 bg-amber-500/[0.04] ring-1 ring-amber-500/20"
            : "hover:border-border/70 hover:bg-white/[0.02]"
        )}
        onClick={() => onCardClick?.("margin")}
      >
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className={cn("rounded-xl bg-white/[0.04] p-3", status.color)}>
              <Percent className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Marge nette</p>
                <InfoTooltip text={`Sur chaque euro de revenu, ${totalMargin}% reste après toutes les dépenses ${scope}.`} />
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <p className={cn("text-4xl font-bold tracking-tight tabular-nums sm:text-5xl", status.color)}>{totalMargin}%</p>
                {comparison && (
                  <div title="vs mois précédent">
                    <VariationBadge value={comparison.totalMargin ?? null} />
                  </div>
                )}
              </div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-2.5 py-1">
                <span className={cn("h-2 w-2 rounded-full", status.dot)} />
                <span className={cn("text-xs font-medium", status.color)}>{status.label}</span>
              </div>
            </div>
          </div>
          <div className="self-end sm:self-center">
            <Sparkline data={sparklines?.margin} className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* 5 KPIs secondaires */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const isActive = activeCard === card.key
          return (
            <Card
              key={card.key}
              className={cn(
                "cursor-pointer border-border/40 transition-all duration-200",
                isActive
                  ? "border-amber-500/40 bg-amber-500/[0.04] ring-1 ring-amber-500/20"
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
                    <div className="flex items-center gap-2">
                      <Sparkline data={sparklines?.[card.key]} className="h-6 w-16" />
                      {comparison && (
                        <div title="vs mois précédent">
                          <VariationBadge value={card.variation} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from "recharts"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMonth } from "@/lib/chart-utils"
import { cn } from "@/lib/utils"

interface RevenuePerNightDataPoint {
  month: string
  [key: string]: string | number | null
}

interface RevenuePerNightChartProps {
  data: RevenuePerNightDataPoint[]
  propertyNames: string[]
}

const COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444", "#a855f7", "#ec4899", "#14b8a6"]

// Dernière valeur non nulle d'un logement sur la période (et la précédente, pour la variation)
function lastValues(data: RevenuePerNightDataPoint[], name: string): { current: number | null; previous: number | null } {
  let current: number | null = null
  let previous: number | null = null
  for (const point of data) {
    const v = point[name]
    if (typeof v === "number") {
      previous = current
      current = v
    }
  }
  return { current, previous }
}

// Pastille + valeur au bout de la dernière donnée d'une courbe (labeling direct)
function renderEndLabel(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any,
  name: string,
  color: string,
  lastIndex: number,
  dimmed: boolean,
): React.ReactElement {
  const { x, y, value, index } = props
  if (index !== lastIndex || value == null || x == null || y == null) {
    return <g key={`${name}-empty`} />
  }
  return (
    <g key={`${name}-label`} opacity={dimmed ? 0.15 : 1}>
      <circle cx={x} cy={y} r={3.5} fill={color} />
      <text x={x + 8} y={y + 4} fill={color} fontSize={11} fontWeight={600}>
        {Math.round(value)}€
      </text>
    </g>
  )
}

// Tooltip sombre : liste les logements ayant des données ce mois-là
function PerPropertyTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null
  const rows = payload.filter((p) => p.value != null)
  if (rows.length === 0) return null
  return (
    <div className="rounded-lg border border-white/10 bg-[rgba(15,15,15,0.95)] p-3 text-[13px] text-neutral-200">
      <div className="mb-1.5 text-xs text-muted-foreground">{formatMonth(String(label))}</div>
      {rows.map((row) => (
        <div key={String(row.dataKey)} className="flex items-center gap-2 py-0.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: row.color }} />
          <span>{String(row.name)}</span>
          <span className="ml-auto font-semibold">{Math.round(Number(row.value))}€</span>
        </div>
      ))}
    </div>
  )
}

export function RevenuePerNightChart({ data, propertyNames }: RevenuePerNightChartProps) {
  // Logement survolé (dans la liste ou la légende) → focus sur sa courbe
  const [focused, setFocused] = useState<string | null>(null)

  // Couleur stable par logement (suit l'ordre des séries)
  const colorOf = useMemo(() => {
    const map = new Map<string, string>()
    propertyNames.forEach((name, i) => map.set(name, COLORS[i % COLORS.length]))
    return map
  }, [propertyNames])

  // Classement du dernier mois renseigné, trié décroissant, avec variation vs mois précédent
  const ranking = useMemo(() => {
    return propertyNames
      .map((name) => {
        const { current, previous } = lastValues(data, name)
        const variation =
          current != null && previous != null && previous !== 0
            ? Math.round(((current - previous) / previous) * 100)
            : null
        return { name, current, previous, variation, color: colorOf.get(name)! }
      })
      .filter((r) => r.current != null)
      .sort((a, b) => (b.current as number) - (a.current as number))
  }, [data, propertyNames, colorOf])

  // Libellé du mois de classement (= dernier mois avec des données)
  const lastMonthLabel = useMemo(() => {
    for (let i = data.length - 1; i >= 0; i--) {
      const hasValue = propertyNames.some((name) => typeof data[i][name] === "number")
      if (hasValue) return formatMonth(data[i].month)
    }
    return data.length > 0 ? formatMonth(data[data.length - 1].month) : ""
  }, [data, propertyNames])

  const lastIndex = data.length - 1

  if (data.length === 0 || propertyNames.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenu / nuitée</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-12">
            <p className="text-sm font-medium">Pas encore de donnees</p>
            <p className="text-xs text-muted-foreground">
              Les graphiques apparaitront quand vous aurez des reservations et depenses
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-baseline justify-between gap-3">
        <CardTitle className="text-base">Revenu / nuitée</CardTitle>
        <span className="text-xs text-muted-foreground">{data.length} mois · classement {lastMonthLabel}</span>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Graphe */}
          <div className="min-w-0 flex-1" style={{ outline: "none" }} tabIndex={-1}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data} margin={{ top: 8, right: 56, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, "auto"]}
                  tickFormatter={(v: number) => `${v}€`}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
                  content={<PerPropertyTooltip />}
                />
                {propertyNames.map((name) => {
                  const color = colorOf.get(name)!
                  const dimmed = focused != null && focused !== name
                  return (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={color}
                      strokeWidth={focused === name ? 3 : 2}
                      strokeOpacity={dimmed ? 0.15 : 0.95}
                      connectNulls={false}
                      dot={false}
                      activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: "hsl(var(--card))" }}
                      // Label de valeur au bout de la courbe (dernier point renseigné)
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      label={(props: any) => renderEndLabel(props, name, color, lastIndex, dimmed)}
                      isAnimationActive={false}
                    />
                  )
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Classement */}
          <div className="lg:w-56 lg:shrink-0">
            <h4 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Classement {lastMonthLabel}
            </h4>
            <div className="space-y-0.5">
              {ranking.map((r) => {
                const dimmed = focused != null && focused !== r.name
                const up = r.variation != null && r.variation > 0
                const down = r.variation != null && r.variation < 0
                const VarIcon = r.variation == null ? Minus : up ? ArrowUp : down ? ArrowDown : Minus
                return (
                  <div
                    key={r.name}
                    onMouseEnter={() => setFocused(r.name)}
                    onMouseLeave={() => setFocused(null)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors",
                      dimmed ? "opacity-40" : "hover:bg-white/[0.04]"
                    )}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
                    <span className="truncate text-sm text-foreground">{r.name}</span>
                    <span className="ml-auto text-sm font-semibold tabular-nums">{Math.round(r.current as number)}€</span>
                    <span
                      className={cn(
                        "inline-flex w-12 shrink-0 items-center justify-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                        r.variation == null
                          ? "bg-white/[0.04] text-muted-foreground"
                          : up
                            ? "bg-green-500/10 text-green-400"
                            : down
                              ? "bg-red-500/10 text-red-400"
                              : "bg-white/[0.04] text-muted-foreground"
                      )}
                    >
                      <VarIcon className="h-3 w-3" />
                      {r.variation == null ? "—" : `${Math.abs(r.variation)}%`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

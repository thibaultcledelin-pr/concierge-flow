"use client"

import { useState } from "react"
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  type TooltipProps,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatMonth } from "@/lib/chart-utils"

interface RevenuePerNightDataPoint {
  month: string
  __avg?: number | null
  __band?: [number, number] | null
  [key: string]: string | number | null | [number, number] | undefined
}

interface RevenuePerNightChartProps {
  data: RevenuePerNightDataPoint[]
  propertyNames: string[]
}

const AMBER = "#f59e0b"
const COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444", "#a855f7", "#ec4899", "#14b8a6"]

// Tooltip "Moyenne" : une seule valeur + écart min/max
function AvgTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0]?.payload as RevenuePerNightDataPoint
  if (point?.__avg == null) return null
  const band = point.__band
  return (
    <div className="rounded-lg border border-white/10 bg-[rgba(15,15,15,0.95)] p-3 text-[13px] text-neutral-200">
      <div className="mb-1.5 text-xs text-muted-foreground">{formatMonth(String(label))}</div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: AMBER }} />
        <span className="font-semibold">{Math.round(point.__avg)}€/nuit</span>
        <span className="text-muted-foreground">en moyenne</span>
      </div>
      {band && (
        <div className="mt-1 text-xs text-muted-foreground">
          min {Math.round(band[0])}€ · max {Math.round(band[1])}€
        </div>
      )}
    </div>
  )
}

// Tooltip "Par logement" : liste les logements ayant des données ce mois-là
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
  const [mode, setMode] = useState<"avg" | "per">("avg")

  if (data.length === 0 || propertyNames.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenu net / nuitée</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">Pas encore de données</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Revenu net / nuitée</CardTitle>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={mode === "avg" ? "default" : "outline"}
            className="h-7 px-3 text-xs"
            onClick={() => setMode("avg")}
          >
            Moyenne
          </Button>
          <Button
            size="sm"
            variant={mode === "per" ? "default" : "outline"}
            className="h-7 px-3 text-xs"
            onClick={() => setMode("per")}
          >
            Par logement
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="rpnAvgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={AMBER} stopOpacity={0.18} />
                <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.15} />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, "auto"]}
              allowDataOverflow={false}
              tickFormatter={(v: number) => `${v}€`}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
              content={mode === "avg" ? <AvgTooltip /> : <PerPropertyTooltip />}
            />

            {mode === "avg" ? (
              <>
                {/* Bande min/max entre logements */}
                <Area
                  type="monotone"
                  dataKey="__band"
                  stroke="none"
                  fill={AMBER}
                  fillOpacity={0.1}
                  connectNulls
                  isAnimationActive={false}
                  legendType="none"
                />
                {/* Courbe moyenne pondérée */}
                <Area
                  type="monotone"
                  dataKey="__avg"
                  name="Moyenne"
                  stroke={AMBER}
                  strokeWidth={3}
                  fill="url(#rpnAvgGrad)"
                  connectNulls
                  dot={false}
                  activeDot={{ r: 5, fill: AMBER, strokeWidth: 2, stroke: "hsl(var(--card))" }}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              </>
            ) : (
              <>
                <Legend iconType="circle" iconSize={8} />
                {propertyNames.map((name, i) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    connectNulls={false}
                    dot={false}
                    activeDot={{ r: 5, fill: COLORS[i % COLORS.length], strokeWidth: 2, stroke: "hsl(var(--card))" }}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                ))}
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

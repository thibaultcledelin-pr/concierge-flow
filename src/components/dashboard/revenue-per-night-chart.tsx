"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  type TooltipProps,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMonth } from "@/lib/chart-utils"

interface RevenuePerNightDataPoint {
  month: string
  [key: string]: string | number | null
}

interface RevenuePerNightChartProps {
  data: RevenuePerNightDataPoint[]
  propertyNames: string[]
}

const COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444", "#a855f7", "#ec4899", "#14b8a6"]

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
  if (data.length === 0 || propertyNames.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenu net / nuitée</CardTitle>
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
      <CardHeader>
        <CardTitle className="text-base">Revenu net / nuitée</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ outline: "none" }} tabIndex={-1}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

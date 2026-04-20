"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMonth, TOOLTIP_STYLE } from "@/lib/chart-utils"

interface RevenuePerNightDataPoint {
  month: string
  [propertyName: string]: string | number
}

interface RevenuePerNightChartProps {
  data: RevenuePerNightDataPoint[]
  propertyNames: string[]
}

const COLORS = ["#7c3aed", "#3b82f6", "#f97316", "#ef4444", "#22c55e", "#eab308"]

export function RevenuePerNightChart({ data, propertyNames }: RevenuePerNightChartProps) {
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
      <CardHeader>
        <CardTitle className="text-base">Revenu net / nuitée</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ outline: "none" }} tabIndex={-1}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data}>
            <defs>
              {propertyNames.map((name, i) => (
                <linearGradient key={name} id={`rpnGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
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
              tickFormatter={(v: number) => `${v}€`}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
              contentStyle={TOOLTIP_STYLE}
              formatter={(value: number | string, name: number | string) => [`${Number(value).toFixed(0)}€/nuit`, String(name)]}
              labelFormatter={(label: number | string) => formatMonth(String(label))}
            />
            <Legend iconType="circle" iconSize={8} />
            {propertyNames.map((name, i) => (
              <Area
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[i % COLORS.length]}
                fill={`url(#rpnGrad${i})`}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: COLORS[i % COLORS.length], strokeWidth: 2, stroke: "hsl(var(--card))" }}
                animationDuration={1400}
                animationEasing="ease-out"
              />
            ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

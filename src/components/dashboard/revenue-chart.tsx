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

interface ChartDataPoint {
  month: string
  revenue: number
  expenses: number
  profit: number
}

interface RevenueChartProps {
  data: ChartDataPoint[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenus vs Dépenses</CardTitle>
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
        <CardTitle className="text-base">Revenus vs Dépenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ outline: "none" }} tabIndex={-1}>
          <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
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
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
              contentStyle={TOOLTIP_STYLE}
              formatter={(value: number | string, name: number | string) => {
                const labels: Record<string, string> = { revenue: "Revenus", expenses: "Dépenses", profit: "Marge nette" }
                return [`${Number(value).toFixed(0)}€`, labels[String(name)] || String(name)]
              }}
              labelFormatter={(label: number | string) => formatMonth(String(label))}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value: number | string) => {
                const labels: Record<string, string> = { revenue: "Revenus", expenses: "Dépenses", profit: "Marge nette" }
                return labels[String(value)] || String(value)
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              fill="url(#revGrad)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: "#22c55e", strokeWidth: 2, stroke: "hsl(var(--card))" }}
              animationDuration={1400}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              fill="none"
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 5, fill: "#ef4444", strokeWidth: 2, stroke: "hsl(var(--card))" }}
              animationDuration={1400}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#7c3aed"
              fill="url(#profitGrad)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "#7c3aed", strokeWidth: 2, stroke: "hsl(var(--card))" }}
              animationDuration={1400}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

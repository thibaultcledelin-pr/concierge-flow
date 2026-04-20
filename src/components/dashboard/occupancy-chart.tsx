"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMonth, TOOLTIP_STYLE } from "@/lib/chart-utils"

interface OccupancyDataPoint {
  month: string
  occupancy: number
}

interface OccupancyChartProps {
  data: OccupancyDataPoint[]
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Taux d&apos;occupation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-12"><p className="text-sm font-medium">Pas encore de donnees</p><p className="text-xs text-muted-foreground">Les graphiques apparaitront quand vous aurez des reservations et depenses</p></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Taux d&apos;occupation</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ outline: "none" }} tabIndex={-1}>
          <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
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
              domain={[0, 100]}
              stroke="rgba(255,255,255,0.3)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
              contentStyle={TOOLTIP_STYLE}
              formatter={(value: number | string) => [`${Number(value).toFixed(1)}%`, "Occupation"]}
              labelFormatter={(label: number | string) => formatMonth(String(label))}
            />
            <Area
              type="monotone"
              dataKey="occupancy"
              stroke="#f59e0b"
              fill="url(#occupancyGrad)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: "#f59e0b", strokeWidth: 2, stroke: "hsl(var(--card))" }}
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

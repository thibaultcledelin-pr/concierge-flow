"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OccupancyBarData {
  name: string
  occupancy: number
}

interface OccupancyBarChartProps {
  data: OccupancyBarData[]
}

function getBarColor(rate: number) {
  if (rate >= 75) return "#7c3aed"
  if (rate >= 50) return "#f97316"
  return "#ef4444"
}

export function OccupancyBarChart({ data }: OccupancyBarChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Occupation par logement</CardTitle>
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
        <CardTitle className="text-base">Occupation par logement</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 48)}>
          <BarChart data={data} layout="vertical" barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.15} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15,15,15,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "12px",
                backgroundColor: "rgba(15,15,15,0.95)", color: "#e5e5e5", fontSize: "13px",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${Number(value).toFixed(1)}%`, "Occupation"]}
            />
            <Bar dataKey="occupancy" radius={[0, 6, 6, 0]} animationDuration={1400} animationEasing="ease-out">
              {data.map((entry) => (
                <Cell key={entry.name} fill={getBarColor(entry.occupancy)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

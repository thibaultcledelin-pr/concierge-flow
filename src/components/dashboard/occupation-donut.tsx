"use client"

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OccupationDonutProps {
  rate: number
  label?: string
}

export function OccupationDonut({ rate, label = "Occupation" }: OccupationDonutProps) {
  const capped = Math.min(100, Math.max(0, rate))
  const data = [
    { name: "occupied", value: capped },
    { name: "empty", value: 100 - capped },
  ]

  const color = capped >= 75 ? "#7c3aed" : capped >= 50 ? "#f97316" : "#ef4444"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mx-auto" style={{ width: 180, height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                <Cell fill={color} />
                <Cell fill="rgba(255,255,255,0.06)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{rate}%</span>
            <span className="text-xs text-muted-foreground">ce mois</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

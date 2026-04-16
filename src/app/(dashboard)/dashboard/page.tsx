"use client"

import { useEffect, useState, useCallback } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { ProfitabilityTable } from "@/components/dashboard/profitability-table"
import { PlatformChart } from "@/components/dashboard/platform-chart"
import { PageLoading } from "@/components/ui/page-loading"
import { PageError } from "@/components/ui/page-error"

interface DashboardData {
  stats: {
    totalRevenue: number
    totalExpenses: number
    totalProfit: number
    totalMargin: number
    occupancyRate: number
    propertyCount: number
  }
  profitability: {
    propertyId: string
    propertyName: string
    city: string
    revenue: number
    expenses: number
    profit: number
    margin: number
    nights: number
    bookings: number
  }[]
  chartData: {
    month: string
    revenue: number
    expenses: number
    profit: number
  }[]
  platformData: {
    name: string
    value: number
  }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = useCallback(() => {
    setError(false)
    setLoading(true)
    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="mt-4"><PageLoading /></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="mt-4">
          <PageError message="Impossible de charger le dashboard" onRetry={fetchData} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d&apos;ensemble — {data.stats.propertyCount} logement{data.stats.propertyCount !== 1 ? "s" : ""}
        </p>
      </div>

      <StatsCards
        totalRevenue={data.stats.totalRevenue}
        totalExpenses={data.stats.totalExpenses}
        totalMargin={data.stats.totalMargin}
        occupancyRate={data.stats.occupancyRate}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={data.chartData} />
        </div>
        <PlatformChart data={data.platformData} />
      </div>

      <ProfitabilityTable data={data.profitability} />
    </div>
  )
}

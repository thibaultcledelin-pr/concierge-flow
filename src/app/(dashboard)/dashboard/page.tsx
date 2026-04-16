"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { OccupancyChart } from "@/components/dashboard/occupancy-chart"
import { RevenuePerNightChart } from "@/components/dashboard/revenue-per-night-chart"
import { OccupancyBarChart } from "@/components/dashboard/occupancy-bar-chart"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { ProfitabilityTable } from "@/components/dashboard/profitability-table"
import { PageLoading } from "@/components/ui/page-loading"
import { PageError } from "@/components/ui/page-error"

interface DashboardData {
  stats: {
    totalRevenue: number
    totalExpenses: number
    totalProfit: number
    totalMargin: number
    occupancyRate: number
    avgRevenuePerNight: number
    revPAR: number
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
  chartData: { month: string; revenue: number; expenses: number; profit: number }[]
  occupancyData: { month: string; occupancy: number }[]
  revenuePerNightData: Record<string, string | number>[]
  propertyNames: string[]
  occupancyByProperty: { name: string; occupancy: number }[]
  platformData: { name: string; value: number }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((d) => {
        if (!cancelled) { setData(d); setLoading(false) }
      })
      .catch(() => {
        if (!cancelled) { setError(true); setLoading(false) }
      })
    return () => { cancelled = true }
  }, [])

  function retry() {
    setError(false)
    setLoading(true)
    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }

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
          <PageError message="Impossible de charger le dashboard" onRetry={retry} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d&apos;ensemble \u2014 {data.stats.propertyCount} logement{data.stats.propertyCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* 3 KPI cards */}
      <StatsCards
        occupancyRate={data.stats.occupancyRate}
        avgRevenuePerNight={data.stats.avgRevenuePerNight}
        totalMargin={data.stats.totalMargin}
        revPAR={data.stats.revPAR}
      />

      {/* Graphe 1 \u2014 Taux d'occupation (pleine largeur) */}
      <OccupancyChart data={data.occupancyData} />

      {/* Graphes 2 + 3 c\u00f4te \u00e0 c\u00f4te */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenuePerNightChart data={data.revenuePerNightData} propertyNames={data.propertyNames} />
        </div>
        <OccupancyBarChart data={data.occupancyByProperty} />
      </div>

      {/* Graphe 4 \u2014 Revenus vs D\u00e9penses (pleine largeur) */}
      <RevenueChart data={data.chartData} />

      {/* Table rentabilit\u00e9 */}
      <ProfitabilityTable data={data.profitability} />
    </div>
  )
}

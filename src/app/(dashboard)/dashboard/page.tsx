"use client"

import { useEffect, useState, useCallback } from "react"
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

      {/* 3 KPI cards */}
      <StatsCards
        occupancyRate={data.stats.occupancyRate}
        avgRevenuePerNight={data.stats.avgRevenuePerNight}
        totalMargin={data.stats.totalMargin}
      />

      {/* Graphe 1 — Taux d'occupation (pleine largeur) */}
      <OccupancyChart data={data.occupancyData} />

      {/* Graphes 2 + 3 côte à côte */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenuePerNightChart data={data.revenuePerNightData} propertyNames={data.propertyNames} />
        </div>
        <OccupancyBarChart data={data.occupancyByProperty} />
      </div>

      {/* Graphe 4 — Revenus vs Dépenses (pleine largeur) */}
      <RevenueChart data={data.chartData} />

      {/* Table rentabilité */}
      <ProfitabilityTable data={data.profitability} />
    </div>
  )
}

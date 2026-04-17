"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { StatsCards, type KpiKey } from "@/components/dashboard/stats-cards"
import { OccupancyChart } from "@/components/dashboard/occupancy-chart"
import { OccupationDonut } from "@/components/dashboard/occupation-donut"
import { RevenuePerNightChart } from "@/components/dashboard/revenue-per-night-chart"
import { OccupancyBarChart } from "@/components/dashboard/occupancy-bar-chart"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { ProfitabilityTable } from "@/components/dashboard/profitability-table"
import { SyncButton } from "@/components/dashboard/sync-button"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { PageLoading } from "@/components/ui/page-loading"
import { PageError } from "@/components/ui/page-error"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DashboardData {
  stats: {
    totalRevenue: number
    totalExpenses: number
    totalProfit: number
    totalMargin: number
    occupancyRate: number
    avgRevenuePerNight: number
    revPAR: number
    adr: number
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
  allProperties: { id: string; name: string }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<string>("all")
  const [activeCard, setActiveCard] = useState<KpiKey | null>(null)

  function loadDashboard(propertyId: string, signal?: AbortSignal) {
    const url = propertyId !== "all"
      ? `/api/dashboard?propertyId=${propertyId}`
      : "/api/dashboard"
    return fetch(url, signal ? { signal } : undefined)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
  }

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false
    loadDashboard(selectedProperty, controller.signal)
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); setError(false) } })
      .catch((err) => {
        if (!cancelled && err.name !== "AbortError") { setError(true); setLoading(false) }
      })
    return () => { cancelled = true; controller.abort() }
  }, [selectedProperty])

  function handlePropertyChange(value: string) {
    setSelectedProperty(value)
    setLoading(true)
    setError(false)
  }

  function retry() {
    setError(false)
    setLoading(true)
    loadDashboard(selectedProperty)
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

  // Onboarding si aucun logement
  if (data.allProperties.length === 0) {
    return <OnboardingWizard />
  }

  const selectedPropertyName = selectedProperty !== "all"
    ? data.allProperties.find((p) => p.id === selectedProperty)?.name
    : undefined

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vue d&apos;ensemble — {data.stats.propertyCount} logement{data.stats.propertyCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data.allProperties.length > 1 && (
            <Select value={selectedProperty} onValueChange={handlePropertyChange}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Tous les logements" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les logements</SelectItem>
                {data.allProperties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <SyncButton />
          <Link
            href="/properties/new"
            className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Ajouter un logement</span>
          </Link>
        </div>
      </div>

      <StatsCards
        occupancyRate={data.stats.occupancyRate}
        avgRevenuePerNight={data.stats.avgRevenuePerNight}
        totalMargin={data.stats.totalMargin}
        revPAR={data.stats.revPAR}
        adr={data.stats.adr}
        totalRevenue={data.stats.totalRevenue}
        propertyName={selectedPropertyName}
        activeCard={activeCard}
        onCardClick={(key) => setActiveCard(activeCard === key ? null : key)}
      />

      {/* Graphe contextuel selon KPI sélectionné */}
      {activeCard === "occupancy" && (
        <div className="grid gap-6 lg:grid-cols-4">
          <OccupationDonut rate={data.stats.occupancyRate} />
          <div className="lg:col-span-3">
            <OccupancyChart data={data.occupancyData} />
          </div>
        </div>
      )}
      {(activeCard === "revenuePerNight" || activeCard === "adr") && (
        <RevenuePerNightChart data={data.revenuePerNightData} propertyNames={data.propertyNames} />
      )}
      {(activeCard === "margin" || activeCard === "totalRevenue") && (
        <RevenueChart data={data.chartData} />
      )}
      {activeCard === "revpar" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OccupancyChart data={data.occupancyData} />
          </div>
          <OccupancyBarChart data={data.occupancyByProperty} />
        </div>
      )}

      {/* Graphes par défaut si aucun KPI sélectionné */}
      {!activeCard && (
        <>
          <div className="grid gap-6 lg:grid-cols-4">
            <OccupationDonut rate={data.stats.occupancyRate} />
            <div className="lg:col-span-3">
              <OccupancyChart data={data.occupancyData} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenuePerNightChart data={data.revenuePerNightData} propertyNames={data.propertyNames} />
            </div>
            <OccupancyBarChart data={data.occupancyByProperty} />
          </div>

          <RevenueChart data={data.chartData} />
        </>
      )}

      {/* Table rentabilité */}
      <ProfitabilityTable data={data.profitability} />
    </div>
  )
}

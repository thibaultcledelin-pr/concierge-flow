"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, ArrowLeft, Calendar, DollarSign, Percent, TrendingUp, Home, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageLoading } from "@/components/ui/page-loading"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { formatCurrency, formatDate } from "@/lib/utils"
import { categoryLabels, propertyTypeLabels } from "@/lib/constants"

interface PropertyStats {
  property: {
    id: string
    name: string
    address: string
    city: string
    type: string
    rooms: number
    surface: number | null
    monthlyRent: number | null
  }
  stats: {
    revenue: number
    expenses: number
    profit: number
    margin: number
    nights: number
    bookingCount: number
    expenseCount: number
    occupancy: number
    revenuePerNight: number
    adr: number
  }
  chartData: { month: string; revenue: number; expenses: number; profit: number }[]
  recentBookings: {
    id: string
    guestName: string | null
    checkIn: string
    checkOut: string
    nights: number
    totalAmount: number
    platform: string
  }[]
  recentExpenses: {
    id: string
    label: string
    amount: number
    category: string
    date: string
  }[]
}


export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<PropertyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/properties/${params.id}/stats`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => { router.push("/properties") })
  }, [params.id, router])

  if (loading || !data) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Logement</h1>
        <div className="mt-4"><PageLoading /></div>
      </div>
    )
  }

  const { property, stats } = data

  const kpis = [
    { label: "Revenus", value: formatCurrency(stats.revenue), icon: DollarSign, color: "text-green-400" },
    { label: "Dépenses", value: formatCurrency(stats.expenses), icon: TrendingUp, color: "text-red-400" },
    { label: "Marge nette", value: `${stats.margin}%`, icon: Percent, color: stats.margin >= 30 ? "text-green-400" : stats.margin >= 10 ? "text-yellow-400" : "text-red-400" },
    { label: "Occupation", value: `${stats.occupancy}%`, icon: Calendar, color: "text-violet-400" },
    { label: "Rev. net/nuit", value: formatCurrency(stats.revenuePerNight), icon: Home, color: "text-blue-400" },
    { label: "ADR", value: formatCurrency(stats.adr), icon: Tag, color: "text-orange-400" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{property.name}</h1>
            <Badge variant="secondary">{propertyTypeLabels[property.type] || property.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {property.address}, {property.city}
            {property.rooms && ` · ${property.rooms} pièce${property.rooms > 1 ? "s" : ""}`}
            {property.surface && ` · ${property.surface} m²`}
          </p>
        </div>
        <Button asChild>
          <Link href={`/properties/${property.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg bg-muted p-2.5 ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphique revenus/dépenses */}
      <RevenueChart data={data.chartData} />

      {/* Réservations + Dépenses côte à côte */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dernières réservations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Dernières réservations</CardTitle>
            <span className="text-sm text-muted-foreground">{stats.bookingCount} au total</span>
          </CardHeader>
          <CardContent>
            {data.recentBookings.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Aucune réservation</p>
            ) : (
              <div className="space-y-3">
                {data.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">{booking.guestName || "Voyageur"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)} · {booking.nights} nuit{booking.nights > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(booking.totalAmount)}</p>
                      <Badge variant="outline" className="text-xs">{booking.platform}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dernières dépenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Dernières dépenses</CardTitle>
            <span className="text-sm text-muted-foreground">{stats.expenseCount} au total</span>
          </CardHeader>
          <CardContent>
            {data.recentExpenses.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Aucune dépense</p>
            ) : (
              <div className="space-y-3">
                {data.recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">{expense.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(expense.date)} · {categoryLabels[expense.category] || expense.category}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-red-400">-{formatCurrency(expense.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

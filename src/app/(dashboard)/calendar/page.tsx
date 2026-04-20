"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageLoading } from "@/components/ui/page-loading"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Property {
  id: string
  name: string
}

interface Booking {
  id: string
  guestName: string | null
  checkIn: string
  checkOut: string
  nights: number
  totalAmount: number
  platform: string
}

const MONTHS_FR = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"]
const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

const PLATFORM_COLORS: Record<string, string> = {
  AIRBNB: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  BOOKING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  DIRECT: "bg-green-500/20 text-green-400 border-green-500/30",
  OTHER: "bg-amber-500/20 text-amber-400 border-amber-500/30",
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function isDateInRange(date: Date, checkIn: string, checkOut: string): boolean {
  const d = date.getTime()
  const start = new Date(checkIn).getTime()
  const end = new Date(checkOut).getTime()
  return d >= start && d < end
}

export default function CalendarPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>("all")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => { setProperties(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedProperty === "all") {
      Promise.all(
        properties.map((p) =>
          fetch(`/api/properties/${p.id}/bookings?limit=100`)
            .then((r) => r.json())
            .then((d) => (d.bookings || []) as Booking[])
            .catch(() => [] as Booking[])
        )
      ).then((results) => setBookings(results.flat()))
    } else {
      fetch(`/api/properties/${selectedProperty}/bookings?limit=100`)
        .then((r) => r.json())
        .then((d) => setBookings(d.bookings || []))
        .catch(() => setBookings([]))
    }
  }, [selectedProperty, properties])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1) }
    else setMonth(month - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1) }
    else setMonth(month + 1)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  function getBookingsForDay(day: number): Booking[] {
    const date = new Date(year, month, day)
    return bookings.filter((b) => isDateInRange(date, b.checkIn, b.checkOut))
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendrier</h1>
        <div className="mt-4"><PageLoading /></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendrier</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vue mensuelle de vos reservations
          </p>
        </div>
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Tous les logements" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les logements</SelectItem>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-lg">
            {MONTHS_FR[month]} {year}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAYS_FR.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the 1st */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] rounded-lg" />
            ))}

            {/* Day cells */}
            {days.map((day) => {
              const dayBookings = getBookingsForDay(day)
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear()

              return (
                <div
                  key={day}
                  className={`min-h-[80px] rounded-lg border p-1.5 transition-colors ${
                    isToday
                      ? "border-amber-500/40 bg-amber-500/[0.04]"
                      : dayBookings.length > 0
                        ? "border-border/60 bg-white/[0.02]"
                        : "border-border/20"
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? "text-amber-400" : "text-muted-foreground"}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayBookings.slice(0, 2).map((b) => (
                      <div
                        key={b.id}
                        className={`truncate rounded px-1 py-0.5 text-[10px] font-medium border ${PLATFORM_COLORS[b.platform] || PLATFORM_COLORS.OTHER}`}
                      >
                        {b.guestName || "Voyageur"}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">+{dayBookings.length - 2}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(PLATFORM_COLORS).map(([platform, classes]) => (
              <Badge key={platform} variant="outline" className={`text-xs ${classes}`}>
                {platform}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CsvImport } from "@/components/revenue/csv-import"
import { formatCurrency, formatDate } from "@/lib/utils"

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
  netAmount: number | null
  platform: string
  source: string
}

export default function RevenuePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>("")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => {
        setProperties(data)
        if (data.length > 0) setSelectedProperty(data[0].id)
        setLoading(false)
      })
      .catch(() => {
        setProperties([])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!selectedProperty) return
    fetch(`/api/properties/${selectedProperty}/bookings`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => setBookings(data.bookings || data))
      .catch(() => setBookings([]))
  }, [selectedProperty])

  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Revenus</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Importez vos revenus depuis Airbnb ou Booking
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <DollarSign className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Ajoutez d&apos;abord un logement pour importer des revenus
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Logement</label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Importer un CSV</CardTitle>
            </CardHeader>
            <CardContent>
              <CsvImport propertyId={selectedProperty} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                Réservations ({bookings.length})
              </CardTitle>
              {totalRevenue > 0 && (
                <span className="text-sm font-semibold text-green-400">
                  {formatCurrency(totalRevenue)}
                </span>
              )}
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Aucune réservation. Synchronisez le iCal ou importez un CSV.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voyageur</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead className="text-center">Nuits</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>{b.guestName || "—"}</TableCell>
                        <TableCell>{formatDate(b.checkIn)}</TableCell>
                        <TableCell>{formatDate(b.checkOut)}</TableCell>
                        <TableCell className="text-center">{b.nights}</TableCell>
                        <TableCell className="text-right">
                          {b.totalAmount > 0 ? formatCurrency(b.totalAmount) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {b.platform}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

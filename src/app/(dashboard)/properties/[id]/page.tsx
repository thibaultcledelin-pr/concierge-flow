"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface Property {
  id: string
  name: string
  address: string
  city: string
  type: string
  rooms: number
  surface: number | null
  monthlyRent: number | null
  icalUrl: string | null
  icalUrlBooking: string | null
  isActive: boolean
}

const typeLabels: Record<string, string> = {
  APARTMENT: "Appartement",
  HOUSE: "Maison",
  STUDIO: "Studio",
  LOFT: "Loft",
  VILLA: "Villa",
  OTHER: "Autre",
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/properties/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => {
        setProperty(data)
        setLoading(false)
      })
      .catch(() => {
        // Keep loading=true while redirecting to avoid flashing null content
        router.push("/properties")
      })
  }, [params.id, router])

  if (loading || !property) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{property.name}</h1>
          <p className="text-sm text-muted-foreground">
            {property.address}, {property.city}
          </p>
        </div>
        <Button asChild>
          <Link href={`/properties/${property.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Type</span>
            <Badge variant="secondary">
              {typeLabels[property.type] || property.type}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Pièces</span>
            <span className="text-sm">{property.rooms}</span>
          </div>
          {property.surface && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Surface</span>
              <span className="text-sm">{property.surface} m²</span>
            </div>
          )}
          {property.monthlyRent && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Loyer mensuel</span>
              <span className="text-sm">{formatCurrency(property.monthlyRent)}</span>
            </div>
          )}
          {property.icalUrl && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">iCal Airbnb</span>
              <span className="text-sm text-green-400">Configuré</span>
            </div>
          )}
          {property.icalUrlBooking && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">iCal Booking</span>
              <span className="text-sm text-green-400">Configuré</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Home, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

export default function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        setProperties(data)
        setLoading(false)
      })
  }, [])

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce logement ?")) return

    await fetch(`/api/properties/${id}`, { method: "DELETE" })
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logements</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {properties.length} logement{properties.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Home className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aucun logement pour le moment
            </p>
            <Button asChild size="sm">
              <Link href="/properties/new">Ajouter un logement</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="relative">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{property.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {property.address}, {property.city}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {typeLabels[property.type] || property.type}
                  </Badge>
                </div>
                <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
                  <span>{property.rooms} pi\u00e8ce{property.rooms > 1 ? "s" : ""}</span>
                  {property.surface && <span>{property.surface} m\u00b2</span>}
                  {property.monthlyRent && (
                    <span>{formatCurrency(property.monthlyRent)}/mois</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/properties/${property.id}/edit`)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(property.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

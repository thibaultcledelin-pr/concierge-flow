"use client"

import { useEffect, useState } from "react"
import { FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLoading } from "@/components/ui/page-loading"
import { ReportButton } from "@/components/reports/report-button"

interface Property {
  id: string
  name: string
  city: string
}

export default function ReportsPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => { setProperties(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`
  const lastMonth = now.getMonth() === 0
    ? `${now.getFullYear() - 1}-12`
    : `${now.getFullYear()}-${now.getMonth().toString().padStart(2, "0")}`

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rapports</h1>
        <div className="mt-4"><PageLoading /></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rapports propriétaire</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Générez un rapport PDF pour chaque logement à envoyer au propriétaire
        </p>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Ajoutez des logements pour générer des rapports
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardHeader>
                <CardTitle className="text-base">{property.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{property.city}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <ReportButton propertyId={property.id} propertyName={property.name} month={currentMonth} />
                <ReportButton propertyId={property.id} propertyName={property.name} month={lastMonth} />
                <ReportButton propertyId={property.id} propertyName={property.name} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

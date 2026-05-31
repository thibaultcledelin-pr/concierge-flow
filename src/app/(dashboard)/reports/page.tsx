"use client"

import { useEffect, useState } from "react"
import { FileText, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLoading } from "@/components/ui/page-loading"
import { ReportButton } from "@/components/reports/report-button"
import { SendReportButton } from "@/components/reports/send-report-button"

interface Property {
  id: string
  name: string
  city: string
  ownerName: string | null
  ownerEmail: string | null
  hasOwnerEmail?: boolean
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
          Téléchargez un PDF ou envoyez directement le rapport par email au propriétaire
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
                {property.ownerEmail || property.hasOwnerEmail ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Propriétaire : <span className="text-foreground">{property.ownerName || "Email configure"}</span>
                  </p>
                ) : (
                  <p className="mt-1 flex items-center gap-1 text-xs text-yellow-500">
                    <AlertCircle className="h-3 w-3" />
                    Aucun email propriétaire configuré
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Télécharger PDF</p>
                  <ReportButton propertyId={property.id} propertyName={property.name} month={currentMonth} />
                  <ReportButton propertyId={property.id} propertyName={property.name} month={lastMonth} />
                  <ReportButton propertyId={property.id} propertyName={property.name} />
                </div>
                {(property.ownerEmail || property.hasOwnerEmail) && (
                  <div className="space-y-2 border-t border-border pt-2">
                    <p className="text-xs font-medium text-muted-foreground">Envoyer par email</p>
                    <SendReportButton propertyId={property.id} propertyName={property.name} month={currentMonth} />
                    <SendReportButton propertyId={property.id} propertyName={property.name} month={lastMonth} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

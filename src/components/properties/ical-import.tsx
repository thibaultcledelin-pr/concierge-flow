"use client"

import { useState } from "react"
import { RefreshCw, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IcalImportProps {
  propertyId: string
  hasIcalUrl: boolean
}

interface SyncResult {
  created: number
  skipped: number
  errors: string[]
}

export function IcalImport({ propertyId, hasIcalUrl }: IcalImportProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)

  async function handleSync() {
    setLoading(true)
    setResult(null)

    const res = await fetch(`/api/properties/${propertyId}/sync-ical`, {
      method: "POST",
    })

    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  if (!hasIcalUrl) {
    return (
      <p className="text-sm text-muted-foreground">
        Ajoutez une URL iCal dans les paramètres du logement pour synchroniser les réservations.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleSync} disabled={loading} size="sm" variant="outline">
        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Synchronisation..." : "Synchroniser iCal"}
      </Button>

      {result && (
        <div className="space-y-1">
          {result.created > 0 && (
            <p className="flex items-center gap-2 text-sm text-green-400">
              <Check className="h-4 w-4" />
              {result.created} réservation{result.created > 1 ? "s" : ""} importée{result.created > 1 ? "s" : ""}
            </p>
          )}
          {result.skipped > 0 && (
            <p className="text-sm text-muted-foreground">
              {result.skipped} déjà existante{result.skipped > 1 ? "s" : ""} (ignorée{result.skipped > 1 ? "s" : ""})
            </p>
          )}
          {result.created === 0 && result.skipped === 0 && result.errors.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune réservation trouvée dans le calendrier.</p>
          )}
          {result.errors.map((err, i) => (
            <p key={i} className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

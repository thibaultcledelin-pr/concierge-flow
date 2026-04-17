"use client"

import { useState } from "react"
import { FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ReportButtonProps {
  propertyId: string
  propertyName: string
  month?: string
}

export function ReportButton({ propertyId, propertyName, month }: ReportButtonProps) {
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  async function handleGenerate() {
    setGenerating(true)
    try {
      const url = month
        ? `/api/properties/${propertyId}/report?month=${month}`
        : `/api/properties/${propertyId}/report`

      const res = await fetch(url)
      if (!res.ok) throw new Error()
      const data = await res.json()

      const { generateOwnerReport } = await import("@/components/reports/generate-pdf")
      generateOwnerReport(data)

      toast({ title: "Rapport généré", description: `PDF téléchargé pour ${propertyName}` })
    } catch {
      toast({ title: "Erreur", description: "Impossible de générer le rapport", variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleGenerate} disabled={generating}>
      {generating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileText className="mr-2 h-4 w-4" />
      )}
      Rapport PDF
    </Button>
  )
}

"use client"

import { useState } from "react"
import { Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface SendReportButtonProps {
  propertyId: string
  propertyName: string
  month?: string
  disabled?: boolean
}

export function SendReportButton({ propertyId, propertyName, month, disabled }: SendReportButtonProps) {
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  async function handleSend() {
    setSending(true)
    try {
      const res = await fetch(`/api/properties/${propertyId}/send-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: month || "all" }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur")
      }

      const data = await res.json()
      toast({
        title: "Email envoyé",
        description: `Rapport envoyé à ${data.sentTo}`,
      })
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : `Impossible d'envoyer le rapport pour ${propertyName}`,
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSend} disabled={sending || disabled}>
      {sending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Mail className="mr-2 h-4 w-4" />
      )}
      Envoyer au propriétaire
    </Button>
  )
}

"use client"

import { useState } from "react"
import { RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function SyncButton() {
  const [syncing, setSyncing] = useState(false)
  const { toast } = useToast()

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch("/api/sync-all", { method: "POST" })
      if (!res.ok) throw new Error()
      const data = await res.json()

      toast({
        title: "Synchronisation terminée",
        description: `${data.totalCreated} nouvelle${data.totalCreated > 1 ? "s" : ""} réservation${data.totalCreated > 1 ? "s" : ""} importée${data.totalCreated > 1 ? "s" : ""}`,
      })
    } catch {
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les calendriers",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
      {syncing ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      <span className="hidden sm:inline">Sync iCal</span>
    </Button>
  )
}

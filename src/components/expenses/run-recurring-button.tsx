"use client"

import { useState } from "react"
import { RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface RunRecurringButtonProps {
  onDone?: () => void
}

export function RunRecurringButton({ onDone }: RunRecurringButtonProps) {
  const [running, setRunning] = useState(false)
  const { toast } = useToast()

  async function handleRun() {
    setRunning(true)
    try {
      const res = await fetch("/api/expenses/run-recurring", { method: "POST" })
      if (!res.ok) throw new Error()
      const data = await res.json()

      if (data.created === 0) {
        toast({
          title: "Tout est à jour",
          description: "Aucune dépense récurrente à générer",
        })
      } else {
        toast({
          title: "Dépenses générées",
          description: `${data.created} nouvelle${data.created > 1 ? "s" : ""} dépense${data.created > 1 ? "s" : ""} récurrente${data.created > 1 ? "s" : ""} ajoutée${data.created > 1 ? "s" : ""}`,
        })
        onDone?.()
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de générer les dépenses",
        variant: "destructive",
      })
    } finally {
      setRunning(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRun} disabled={running}>
      {running ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      <span className="hidden sm:inline">Générer récurrentes</span>
    </Button>
  )
}

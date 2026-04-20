"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, AlertCircle, Info, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageLoading } from "@/components/ui/page-loading"
import { PageError } from "@/components/ui/page-error"

interface Alert {
  type: "danger" | "warning" | "info"
  title: string
  message: string
  propertyName: string
  propertyId: string
}

const alertConfig = {
  danger: { icon: AlertTriangle, bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
  warning: { icon: AlertCircle, bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400" },
  info: { icon: Info, bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/alerts")
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => { setAlerts(data.alerts); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alertes</h1>
        <div className="mt-4"><PageLoading /></div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alertes</h1>
        <div className="mt-4">
          <PageError message="Impossible de charger les alertes" onRetry={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alertes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {alerts.length === 0
            ? "Aucune alerte — tout va bien !"
            : `${alerts.length} alerte${alerts.length > 1 ? "s" : ""} à vérifier`}
        </p>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Info className="mx-auto h-10 w-10 text-green-400" />
            <p className="mt-3 text-sm text-muted-foreground">
              Tous vos logements sont en bonne santé. Aucune action requise.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const config = alertConfig[alert.type]
            const Icon = config.icon
            return (
              <Card key={i} className={`border ${config.border}`}>
                <CardContent className="flex items-start gap-4 p-5">
                  <div className={`rounded-lg p-2.5 ${config.bg}`}>
                    <Icon className={`h-5 w-5 ${config.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-semibold ${config.text}`}>{alert.title}</h3>
                      <Link
                        href={`/properties/${alert.propertyId}`}
                        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Voir le logement
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

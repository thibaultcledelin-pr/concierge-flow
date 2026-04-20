"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, Circle, Home, Calendar, Receipt, FileText, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChecklistItem {
  id: string
  label: string
  description: string
  href: string
  icon: typeof Home
  check: () => Promise<boolean>
}

export function OnboardingChecklist() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  const items: ChecklistItem[] = [
    {
      id: "property",
      label: "Ajouter un logement",
      description: "Creez votre premier logement avec son adresse et type",
      href: "/properties/new",
      icon: Home,
      check: async () => {
        const res = await fetch("/api/properties")
        const data = await res.json()
        return Array.isArray(data) && data.length > 0
      },
    },
    {
      id: "ical",
      label: "Connecter un calendrier iCal",
      description: "Importez vos reservations Airbnb ou Booking automatiquement",
      href: "/properties",
      icon: Calendar,
      check: async () => {
        const res = await fetch("/api/properties")
        const data = await res.json()
        return Array.isArray(data) && data.some((p: { icalUrl: string | null }) => p.icalUrl)
      },
    },
    {
      id: "expense",
      label: "Ajouter une depense",
      description: "Menage, assurance, charges — commencez a suivre vos couts",
      href: "/expenses",
      icon: Receipt,
      check: async () => {
        const res = await fetch("/api/expenses")
        const data = await res.json()
        return (data.expenses?.length || 0) > 0
      },
    },
    {
      id: "report",
      label: "Generer un rapport",
      description: "Telechargez un PDF pour voir a quoi ressemble le rapport proprietaire",
      href: "/reports",
      icon: FileText,
      check: async () => false,
    },
  ]

  useEffect(() => {
    async function checkAll() {
      const results: Record<string, boolean> = {}
      for (const item of items) {
        try {
          results[item.id] = await item.check()
        } catch {
          results[item.id] = false
        }
      }
      setCompleted(results)
      setLoading(false)
    }
    checkAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const completedCount = Object.values(completed).filter(Boolean).length
  const allDone = completedCount === items.length

  if (loading || allDone) return null

  return (
    <Card className="border-amber-500/20 bg-amber-500/[0.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Configurez votre compte</CardTitle>
          <span className="text-sm text-muted-foreground">{completedCount}/{items.length}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
            style={{ width: `${(completedCount / items.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((item) => {
          const done = completed[item.id]
          return (
            <Link
              key={item.id}
              href={done ? "#" : item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                done
                  ? "opacity-50"
                  : "hover:bg-amber-500/[0.04]"
              }`}
            >
              {done ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                  <Check className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Circle className="h-4 w-4" />
                </div>
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${done ? "line-through" : ""}`}>{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              {!done && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}

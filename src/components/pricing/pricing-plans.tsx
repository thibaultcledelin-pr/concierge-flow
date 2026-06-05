"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type Billing = "monthly" | "annual"

interface Plan {
  id: string
  name: string
  tagline: string
  monthly: number
  annual: number // prix mensuel équivalent quand facturé à l'année
  properties: string
  features: string[]
  popular?: boolean
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Pour démarrer sereinement",
    monthly: 29,
    annual: 24,
    properties: "Jusqu'à 5 logements",
    features: [
      "Synchronisation iCal Airbnb + Booking",
      "Import CSV des revenus",
      "Dashboard rentabilité (marge nette, occupation)",
      "Dépenses catégorisées",
      "1 utilisateur",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Le choix des conciergeries qui grandissent",
    monthly: 59,
    annual: 49,
    properties: "Jusqu'à 15 logements",
    popular: true,
    features: [
      "Tout le plan Starter, plus :",
      "Rapports PDF propriétaire",
      "Envoi automatique par email",
      "Alertes intelligentes (marge, occupation)",
      "Dépenses récurrentes automatiques",
      "Recherche globale ⌘K",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Pour les portefeuilles établis",
    monthly: 99,
    annual: 82,
    properties: "Jusqu'à 30 logements",
    features: [
      "Tout le plan Pro, plus :",
      "Résumé hebdomadaire par email",
      "Support prioritaire",
      "Historique et export illimités",
      "Accès multi-utilisateurs (bientôt)",
    ],
  },
]

function formatEuro(value: number): string {
  return `${value}€`
}

export function PricingPlans() {
  const [billing, setBilling] = useState<Billing>("annual")

  return (
    <div>
      {/* Toggle mensuel / annuel */}
      <div className="flex flex-col items-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card p-1">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-all",
              billing === "monthly" ? "bg-white/[0.06] text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={billing === "monthly"}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all",
              billing === "annual" ? "bg-white/[0.06] text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={billing === "annual"}
          >
            Annuel
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
              −2 mois
            </span>
          </button>
        </div>
      </div>

      {/* Cartes */}
      <div className="mx-auto mt-12 grid max-w-6xl items-stretch gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = billing === "annual" ? plan.annual : plan.monthly
          const yearTotal = plan.annual * 12
          const yearlySaving = plan.monthly * 12 - plan.annual * 12
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8 transition-all duration-300",
                plan.popular
                  ? "border-amber-500/40 bg-card lg:-translate-y-3"
                  : "border-border/40 bg-card hover:border-border/70"
              )}
            >
              {/* Glow derrière la carte populaire */}
              {plan.popular && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-px -z-10 rounded-2xl bg-gradient-to-b from-amber-500/30 to-orange-600/10 opacity-60 blur-xl"
                />
              )}

              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-amber-500/30">
                    <Sparkles className="h-3.5 w-3.5" />
                    Le plus populaire
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-bold tracking-tight tabular-nums">{formatEuro(price)}</span>
                  <span className="text-sm text-muted-foreground">/mois</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {billing === "annual"
                    ? `Soit ${formatEuro(yearTotal)} facturés par an · économisez ${formatEuro(yearlySaving)}`
                    : "Facturé mensuellement, sans engagement"}
                </p>
              </div>

              <div className="mt-6 inline-flex w-fit items-center rounded-lg border border-border/50 bg-white/[0.02] px-3 py-1.5 text-sm font-medium">
                {plan.properties}
              </div>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((feature, i) => {
                  const isHeader = feature.endsWith(":")
                  if (isHeader) {
                    return (
                      <li key={i} className="pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {feature}
                      </li>
                    )
                  }
                  return (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className={cn("mt-0.5 h-4 w-4 shrink-0", plan.popular ? "text-amber-400" : "text-green-400")} />
                      <span className="text-foreground/90">{feature}</span>
                    </li>
                  )
                })}
              </ul>

              <Link
                href={`/register?plan=${plan.id}&billing=${billing}`}
                className={cn(
                  "mt-8 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all",
                  plan.popular
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-orange-500"
                    : "border border-border/60 bg-white/[0.02] text-foreground hover:border-amber-500/40 hover:bg-amber-500/[0.04]"
                )}
              >
                Choisir {plan.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )
        })}
      </div>

      {/* Ligne entreprise / sur-mesure */}
      <div className="mx-auto mt-6 flex max-w-6xl flex-col items-center justify-between gap-4 rounded-2xl border border-border/40 bg-card px-8 py-6 sm:flex-row">
        <div>
          <h3 className="text-base font-semibold">Plus de 30 logements ?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tarif sur-mesure, accompagnement dédié et fonctionnalités avancées pour les gros portefeuilles.
          </p>
        </div>
        <Link
          href="/register?plan=enterprise"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border/60 bg-white/[0.02] px-5 py-2.5 text-sm font-medium transition-all hover:border-amber-500/40 hover:bg-amber-500/[0.04]"
        >
          Nous contacter
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

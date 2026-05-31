import Link from "next/link"
import type { Metadata } from "next"
import { ChevronDown, ShieldCheck, CreditCard, Sparkles } from "lucide-react"
import { PricingPlans } from "@/components/pricing/pricing-plans"

export const metadata: Metadata = {
  title: "Tarifs — ConciergeFlow",
  description:
    "Un tarif simple qui grandit avec votre conciergerie. Essai gratuit 14 jours, sans carte bancaire, sans engagement.",
  openGraph: {
    title: "Tarifs ConciergeFlow",
    description: "Des plans clairs pour conciergeries de 5 à 30+ logements.",
    type: "website",
    locale: "fr_FR",
    siteName: "ConciergeFlow",
  },
}

const faqs = [
  {
    q: "Y a-t-il un essai gratuit ?",
    a: "Oui. 14 jours d'essai sur n'importe quel plan, sans carte bancaire. Vous ne payez que si vous décidez de continuer.",
  },
  {
    q: "Comment comptez-vous les logements ?",
    a: "On compte uniquement vos logements actifs. Vous pouvez en ajouter ou en retirer à tout moment ; si vous dépassez votre plan, on vous propose simplement de passer au palier supérieur.",
  },
  {
    q: "Puis-je changer de plan plus tard ?",
    a: "À tout moment, en un clic. Le changement est calculé au prorata : vous ne payez que la différence sur la période en cours.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Carte bancaire via Stripe, notre prestataire de paiement sécurisé. Vos données bancaires ne transitent jamais par nos serveurs.",
  },
  {
    q: "Puis-je annuler quand je veux ?",
    a: "Oui, sans frais ni justification. Votre accès reste actif jusqu'à la fin de la période déjà payée.",
  },
  {
    q: "Mes données sont-elles en sécurité ?",
    a: "Vos données sont hébergées en Europe, chiffrées, et ne sont jamais revendues. Vous pouvez les exporter ou supprimer votre compte à tout moment.",
  },
]

export default function PricingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Halo d'ambiance */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[140px]"
      />

      {/* Nav */}
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-bold text-white">
            C
          </div>
          <span className="text-lg font-bold tracking-tight">ConciergeFlow</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Se connecter
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-medium text-white shadow-sm shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-orange-500"
          >
            Essayer gratuitement
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-6 pb-24 pt-32">
        {/* Hero */}
        <section className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            Offre de lancement — 14 jours offerts
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Un tarif simple, qui{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              grandit avec vous
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Choisissez selon le nombre de logements que vous gérez. Sans engagement, sans carte bancaire pour
            commencer — vous changez de plan quand vous voulez.
          </p>
        </section>

        {/* Plans */}
        <section className="mt-14">
          <PricingPlans />
        </section>

        {/* Réassurance */}
        <section className="mx-auto mt-10 flex max-w-3xl flex-col items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground sm:flex-row">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-400" />
            Annulation en un clic
          </span>
          <span className="inline-flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-green-400" />
            Paiement sécurisé Stripe
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-400" />
            Données hébergées en Europe
          </span>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-28 w-full max-w-2xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">Questions fréquentes</h2>
          <div className="mt-10 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-border/40 bg-card px-5 transition-colors hover:border-border/70 [&_summary]:list-none"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 text-sm font-medium">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto mt-28 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Prêt à savoir combien vous gagnez vraiment ?</h2>
          <p className="mt-3 text-muted-foreground">14 jours offerts. Sans carte bancaire. Configuration en 2 minutes.</p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-orange-500"
          >
            Démarrer mon essai gratuit
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white">
              C
            </div>
            <span className="text-sm text-muted-foreground">ConciergeFlow</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Accueil
            </Link>
            <Link href="/pricing" className="hover:text-foreground">
              Tarifs
            </Link>
            <span>&copy; 2026</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

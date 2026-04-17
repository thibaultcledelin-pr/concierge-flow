import Link from "next/link"
import type { Metadata } from "next"
import { BarChart3, Home, Bell, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "ConciergeFlow — Savez-vous quel logement vous coûte de l'argent ?",
  description: "ConciergeFlow calcule la marge nette réelle de chaque logement, sur toutes vos plateformes. Le dashboard de rentabilité pour conciergeries Airbnb et Booking.",
  openGraph: {
    title: "ConciergeFlow",
    description: "Suivi de rentabilité pour conciergeries Airbnb/Booking",
    type: "website",
    locale: "fr_FR",
    siteName: "ConciergeFlow",
  },
}

const features = [
  {
    icon: BarChart3,
    title: "Import automatique",
    description: "Connectez vos calendriers Airbnb et Booking. Les réservations se synchronisent. Les montants s'importent depuis vos CSV.",
  },
  {
    icon: Home,
    title: "Marge par logement",
    description: "Revenus - dépenses = la vérité. Pour chaque logement, chaque mois, sans tricher.",
  },
  {
    icon: Bell,
    title: "Alertes intelligentes",
    description: "Soyez prévenu quand un logement perd de l'argent. Avant que ça devienne un problème.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
            C
          </div>
          <span className="text-lg font-bold tracking-tight">ConciergeFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            Commencer gratuitement
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-400">
            Pour les conciergeries de 5 à 30 logements
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Savez-vous quel logement vous coûte{" "}
            <span className="text-violet-400">de l&apos;argent ?</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            ConciergeFlow calcule la marge nette réelle de chaque logement,
            sur toutes vos plateformes. Plus de doute, plus de surprises.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-violet-700 sm:w-auto"
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="w-full rounded-lg border border-border px-8 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent sm:w-auto"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* Features */}
        <section className="mx-auto mt-24 max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border bg-card p-6 text-left">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/15 text-violet-400">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Differentiation */}
        <section className="mx-auto mt-24 max-w-2xl">
          <div className="rounded-xl border border-border bg-card p-8 text-left">
            <h2 className="mb-4 text-xl font-bold">Pas un PMS de plus</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lodgify gère vos réservations. PriceLabs optimise vos prix.{" "}
              <span className="text-foreground font-medium">
                ConciergeFlow vous dit si vous gagnez vraiment de l&apos;argent.
              </span>{" "}
              Logement par logement, mois par mois, net de toutes charges.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-violet-600 text-xs font-bold text-white">
              C
            </div>
            <span className="text-sm text-muted-foreground">ConciergeFlow</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span>© 2026</span>
            <Link href="#" className="hover:text-foreground">Mentions légales</Link>
            <Link href="#" className="hover:text-foreground">CGU</Link>
            <Link href="#" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

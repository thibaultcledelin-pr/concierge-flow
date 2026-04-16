import Link from "next/link"
import type { Metadata } from "next"
import { BarChart3, Home, Bell } from "lucide-react"

export const metadata: Metadata = {
  title: "ConciergeFlow — Suivi de rentabilité pour conciergeries",
  description:
    "Tous vos logements, toutes vos plateformes, une seule marge nette. Le dashboard de rentabilité pour conciergeries Airbnb et Booking.",
}

const features = [
  {
    icon: BarChart3,
    title: "Import automatique",
    description:
      "Synchronisez vos calendriers iCal et importez vos revenus CSV depuis Airbnb et Booking en un clic.",
  },
  {
    icon: Home,
    title: "Marge par logement",
    description:
      "Visualisez le revenu net, les dépenses et la marge réelle de chaque logement, en temps réel.",
  },
  {
    icon: Bell,
    title: "Alertes rentabilité",
    description:
      "Recevez une alerte quand un logement passe sous le seuil de rentabilité que vous avez défini.",
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
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-400">
            Pour les conciergeries de 5 à 30 logements
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Tous vos logements, toutes vos plateformes,{" "}
            <span className="text-violet-400">une seule marge nette.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Le dashboard de rentabilité pour conciergeries Airbnb et Booking.
            Importez vos revenus, suivez vos dépenses, visualisez votre marge
            réelle par logement.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="w-full rounded-lg bg-violet-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-violet-700 sm:w-auto"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/login"
              className="w-full rounded-lg border border-border px-8 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent sm:w-auto"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/15 text-violet-400">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        © 2026 ConciergeFlow. Tous droits réservés.
      </footer>
    </div>
  )
}

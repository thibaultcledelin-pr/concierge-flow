import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Check, BarChart3, RefreshCw, FileText, Bell, Shield, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "ConciergeFlow — Le back-office de votre conciergerie",
  description: "Gerez votre conciergerie en un seul endroit. Revenus, depenses, rapports proprietaire — fini les tableaux Excel.",
  openGraph: {
    title: "ConciergeFlow",
    description: "Le back-office complet pour conciergeries Airbnb/Booking",
    type: "website",
    locale: "fr_FR",
    siteName: "ConciergeFlow",
  },
}

const benefits = [
  {
    icon: RefreshCw,
    title: "Vos reservations arrivent toutes seules",
    description: "Connectez vos calendriers Airbnb et Booking une fois. Les reservations se synchronisent automatiquement, chaque heure.",
  },
  {
    icon: BarChart3,
    title: "Voyez qui rapporte et qui coute",
    description: "Marge nette par logement, par mois. Vous savez instantanement quel bien est rentable et lequel vous fait perdre de l'argent.",
  },
  {
    icon: FileText,
    title: "Rapports proprietaire en un clic",
    description: "Generez un PDF professionnel ou envoyez le rapport directement par email. Fini les heures sur Excel chaque fin de mois.",
  },
  {
    icon: Bell,
    title: "Alertes avant qu'il soit trop tard",
    description: "Marge negative, occupation en baisse — vous etes prevenu automatiquement. Reagissez avant que ca devienne un probleme.",
  },
  {
    icon: Shield,
    title: "Depenses sous controle",
    description: "Menage, assurance, charges — categorisez, suivez les recurrences. Plus rien ne passe entre les mailles.",
  },
  {
    icon: Zap,
    title: "Pret en 2 minutes",
    description: "Ajoutez un logement, collez votre lien iCal, c'est parti. Pas de formation, pas de configuration complexe.",
  },
]

const testimonials = [
  {
    name: "Sophie M.",
    role: "Conciergerie 12 logements, Lyon",
    quote: "Avant ConciergeFlow, je passais 2h par mois sur Excel pour chaque proprietaire. Maintenant c'est un clic.",
  },
  {
    name: "Thomas D.",
    role: "Conciergerie 8 logements, Bordeaux",
    quote: "J'ai decouvert qu'un de mes logements perdait 200 euros par mois. Sans ConciergeFlow, je ne l'aurais jamais su.",
  },
  {
    name: "Marie L.",
    role: "Conciergerie 22 logements, Paris",
    quote: "Le rapport PDF proprietaire a change ma relation avec mes clients. Ils voient exactement ou va leur argent.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-bold text-white">
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
            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-medium text-white transition-all hover:from-amber-400 hover:to-orange-500 shadow-sm shadow-amber-500/20"
          >
            Essayer gratuitement
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center px-6 pt-32 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400">
            Gratuit pendant la beta — places limitees
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Gerez votre conciergerie{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">en un seul endroit</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Revenus, depenses, rapports proprietaire — fini les tableaux Excel.
            ConciergeFlow calcule votre marge nette reelle, logement par logement.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3.5 text-base font-semibold text-white transition-all hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/25 sm:w-auto"
            >
              Essayer gratuitement
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Pas de carte bancaire requise. Configuration en 2 minutes.
          </p>
        </div>

        {/* Screenshot placeholder */}
        <div className="mx-auto mt-16 w-full max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-2xl shadow-black/20">
            <div className="flex h-8 items-center gap-2 border-b border-border/40 bg-card px-4">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs text-muted-foreground">conciergeflow.fr/dashboard</span>
            </div>
            <div className="flex h-[400px] items-center justify-center bg-gradient-to-br from-card to-background p-8">
              <div className="text-center">
                <BarChart3 className="mx-auto h-16 w-16 text-amber-500/30" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">Votre dashboard de rentabilite</p>
                <p className="mt-1 text-sm text-muted-foreground/60">KPIs, graphiques, alertes — tout en un coup d&apos;oeil</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <section className="mx-auto mt-32 max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Tout ce dont votre conciergerie a besoin</h2>
            <p className="mt-3 text-muted-foreground">Plus de bricolage entre 5 outils differents.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-2xl border border-border/40 bg-card p-7 transition-all duration-200 hover:border-amber-500/20 hover:bg-amber-500/[0.02]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Social proof */}
        <section className="mx-auto mt-32 max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Ils gerent leur conciergerie avec ConciergeFlow</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border/40 bg-card p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 border-t border-border/40 pt-4">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto mt-32 max-w-lg text-center">
          <h2 className="text-3xl font-bold tracking-tight">Tarif simple</h2>
          <p className="mt-3 text-muted-foreground">Pas de piege, pas d&apos;engagement.</p>
          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-card p-8">
            <div className="mb-2 inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
              Beta gratuite
            </div>
            <div className="mt-4 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold">0&euro;</span>
              <span className="text-muted-foreground">/mois</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Gratuit pendant toute la duree de la beta</p>
            <ul className="mt-6 space-y-3 text-left text-sm">
              {["Logements illimites", "Import iCal + CSV", "Dashboard KPIs complet", "Rapports PDF proprietaire", "Alertes intelligentes", "Depenses recurrentes", "Envoi email proprietaire"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-amber-400 hover:to-orange-500"
            >
              Commencer maintenant
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto mt-32 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Pret a savoir combien vous gagnez vraiment ?</h2>
          <p className="mt-3 text-muted-foreground">2 minutes pour configurer. Gratuit. Sans carte bancaire.</p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3.5 text-base font-semibold text-white transition-all hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/25"
          >
            Essayer ConciergeFlow
            <ArrowRight className="h-4 w-4" />
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
            <span>&copy; 2026</span>
            <Link href="#" className="hover:text-foreground">Mentions legales</Link>
            <Link href="#" className="hover:text-foreground">CGU</Link>
            <Link href="#" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

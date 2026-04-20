# ConciergeFlow

> Tous vos logements, toutes vos plateformes, une seule marge nette.

SaaS de suivi de rentabilite pour conciergeries Airbnb/Booking.

## Le probleme

Les conciergeries utilisent Lodgify pour la gestion, PriceLabs pour le pricing, mais aucun outil ne leur dit combien elles gagnent vraiment par logement, net de toutes charges.

## La solution

ConciergeFlow centralise les revenus (import iCal + CSV) et les depenses pour calculer la marge nette reelle par logement, par plateforme.

## Features

- **Dashboard** avec 6 KPIs cliquables (occupation, marge, RevPAR, ADR, revenu/nuit, revenu total)
- **Donut chart** occupation + graphiques Recharts (revenus vs depenses, occupation timeline, revenu/nuit par logement)
- **Comparaison mois vs mois** (+15% / -8% sur chaque KPI)
- **Selecteur de logement** pour filtrer le dashboard sur un seul bien
- **Page detail logement** avec mini-dashboard dedie (KPIs + graphique + reservations/depenses)
- **Import iCal** automatique (Airbnb + Booking) avec sync en un clic
- **Import CSV** avec matching intelligent (enrichissement des montants)
- **Depenses** avec categories, filtres, et recurrence automatique (WEEKLY/MONTHLY/QUARTERLY/YEARLY)
- **Alertes intelligentes** (marge negative, occupation basse, aucune reservation)
- **Rapports proprietaire PDF** avec envoi email via Resend
- **Onboarding wizard** en 3 etapes pour les nouveaux utilisateurs

## Stack

Next.js 16 · Supabase · Prisma 7 · Tailwind CSS 4 · shadcn/ui · Recharts 3 · jsPDF · Resend · Vitest

## Setup local

```bash
# 1. Cloner et installer
git clone https://github.com/thibaultcledelin-pr/concierge-flow.git
cd concierge-flow
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Remplir avec les cles Supabase (voir section ci-dessous)

# 3. Generer le client Prisma et appliquer le schema
npx prisma generate
npx prisma db push

# 4. (Optionnel) Peupler avec des donnees de demo
npm run seed

# 5. Lancer le dev server
npm run dev
# → http://localhost:3000
```

## Variables d'environnement

```env
# Supabase (obligatoire)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
DATABASE_URL=postgresql://...

# Email (optionnel — pour l'envoi de rapports)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=ConciergeFlow <rapport@votredomaine.com>

# Cron (optionnel — pour les depenses recurrentes automatiques)
CRON_SECRET=votre-secret-aleatoire
```

## Configuration Supabase

1. **Authentication → Settings** : decocher "Enable email confirmations"
2. **Authentication → URL Configuration** : Site URL = `http://localhost:3000`, Redirect = `http://localhost:3000/callback`
3. **Settings → Database** : copier le Connection string pour `DATABASE_URL`
4. **Settings → API** : copier Project URL + anon key

## Tests

```bash
npm test        # tous les tests (~16s, 189 tests)
npm run lint    # ESLint
```

## Architecture

Voir `ARCHITECTURE.md` pour le detail technique complet.

## Troubleshooting

- **`Error: Invalid environment variables`** → verifier `.env`
- **`Cannot find module '@prisma/client'`** → `npx prisma generate`
- **Login qui boucle** → decocher "Enable email confirmations" dans Supabase
- **Occupation >100%** → merger la PR fix-occupancy (filtre les nuits au mois courant)

# ConciergeFlow

> Tous vos logements, toutes vos plateformes, une seule marge nette.

SaaS de suivi de rentabilité pour conciergeries Airbnb/Booking.

## Le problème

Les conciergeries utilisent Lodgify pour la gestion, PriceLabs pour le pricing, mais aucun outil ne leur dit combien elles gagnent vraiment par logement, net de toutes charges.

## La solution

ConciergeFlow centralise les revenus (import iCal + CSV) et les dépenses pour calculer la marge nette réelle par logement, par plateforme.

## Stack

Next.js 14 · Supabase · Prisma · Tailwind · shadcn/ui · Recharts · Vitest

## Dev

```bash
git clone https://github.com/thibaultcledelin-pr/concierge-flow.git
cd concierge-flow
npm install
cp .env.example .env  # remplir avec tes clés Supabase
npx prisma generate
npm run dev
```

## Tests

```bash
npm run test:run
```

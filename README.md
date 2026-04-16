# ConciergeFlow

> Tous vos logements, toutes vos plateformes, une seule marge nette.

SaaS de suivi de rentabilité pour conciergeries Airbnb/Booking.

## Le problème

Les conciergeries utilisent Lodgify pour la gestion, PriceLabs pour le pricing, mais aucun outil ne leur dit combien elles gagnent vraiment par logement, net de toutes charges.

## La solution

ConciergeFlow centralise les revenus (import iCal + CSV) et les dépenses pour calculer la marge nette réelle par logement, par plateforme.

## Stack

Next.js 14 · Supabase · Prisma · Tailwind · shadcn/ui · Recharts · Vitest

## Setup local (étapes exactes)

```bash
# 1. Cloner et installer
git clone https://github.com/thibaultcledelin-pr/concierge-flow.git
cd concierge-flow
npm install

# 2. Créer le .env (PAS d'espaces après =)
cp .env.example .env
# → remplir avec les clés Supabase (voir section ci-dessous)

# 3. Générer le client Prisma et pousser le schéma
npx prisma generate
npx prisma db push

# 4. (Optionnel) Peupler avec des données de démo
npm run seed

# 5. Lancer le dev server
npm run dev
# → http://localhost:3000
```

## Configuration Supabase requise

Avant de lancer l'app, configure ton projet Supabase :

1. **Authentication → Settings**
   - Décoche **"Enable email confirmations"** (pour pouvoir se connecter sans confirmer l'email en dev)

2. **Authentication → URL Configuration**
   - **Site URL** : `http://localhost:3000`
   - **Redirect URLs** : `http://localhost:3000/callback`

3. **Settings → Database**
   - Récupère le **Connection string** (mode "Transaction") pour `DATABASE_URL`
   - Récupère le **Direct connection** (mode "Session") pour `DIRECT_URL` (optionnel, pour migrations)

4. **Settings → API**
   - Copie **Project URL** dans `NEXT_PUBLIC_SUPABASE_URL`
   - Copie la clé **anon public** dans `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Tests

```bash
npm test          # tous les tests (<30s)
npm run test:unit # lib/ seulement
npm run test:api  # routes API seulement
npm run test:ui   # composants + pages
npm run test:watch # mode watch
```

## Troubleshooting

- **`Error: Invalid environment variables`** → vérifie que `.env` existe et contient toutes les variables de `.env.example` sans espaces autour du `=`
- **`Cannot find module '@prisma/client'`** → lance `npx prisma generate`
- **Login qui boucle** → vérifie que "Enable email confirmations" est décoché dans Supabase

# CLAUDE.md — Contexte projet ConciergeFlow

> Lis ce fichier en entier avant de répondre. Puis lis ROADMAP.md pour savoir où on en est.

## Projet
- **Nom** : ConciergeFlow
- **Description** : SaaS suivi rentabilité conciergeries Airbnb/Booking
- **Promesse** : "Tous vos logements, toutes vos plateformes, une seule marge nette."
- **Cible** : Conciergeries 5-30 logements en France

## Stack
Next.js 16 (App Router) + Supabase (Auth + PostgreSQL) + Prisma 7 (PrismaPg adapter) + Tailwind CSS 4 + shadcn/ui (Radix) + Recharts 3 + ical.js + Papaparse + Vitest + jsPDF + Resend

## Design
Dark mode, style Linear/Vercel, sobre et pro, thème violet

## Architecture
```
src/
├── app/(auth)/          → login, register, callback
├── app/(dashboard)/     → dashboard, properties, revenue, expenses, alerts, reports
├── app/api/             → 13 routes API (voir ARCHITECTURE.md)
├── components/ui/       → shadcn (17 composants)
├── components/layout/   → sidebar, topbar, mobile-nav
├── components/dashboard/ → stats-cards, charts, donut, sync-button
├── components/onboarding/ → wizard première connexion
├── components/reports/  → PDF generation, report buttons, send email
├── components/[feature]/ → composants par feature
├── lib/                 → prisma, supabase, utils, validators, chart-utils, parsers
├── hooks/               → use-toast
└── types/               → types TypeScript
```

## Données
- Réservations : iCal auto (Airbnb + Booking) + sync en un clic
- Revenus : import CSV depuis dashboards plateformes
- Dépenses : saisie manuelle catégorisée + récurrence automatique
- Rapports : PDF propriétaire + envoi email via Resend

## Mode de travail
- Mode autonome : code tout sans demander de validation intermédiaire
- 1 PR par feature ou fix, chacune bien documentée
- Enchaîne toutes les sous-étapes d'une tâche d'un coup
- À la fin de la tâche, fais un résumé complet :
  - Fichiers créés/modifiés (liste avec chemins)
  - Commandes exécutées
  - Décisions prises et pourquoi
  - Ce qui marche et ce qui reste à tester
- Mets à jour ROADMAP.md automatiquement
- Si erreur, essaie de résoudre seul avant de remonter

## Tests
- `npm test` → lance tous les tests (doit passer en <30s)
- Avant chaque PR, tous les tests doivent passer
- On ne push jamais du code qui casse les tests existants
- Pour chaque feature, ajouter les tests dans le fichier `__tests__/route.test.ts` à côté
- Utilise Vitest avec jsdom
- Actuellement : **189 tests, 35 fichiers, ~16s**

## Règles de code
1. Code complet — pas de "...", pas de placeholders
2. Procède étape par étape
3. Ne refais jamais ce qui est déjà fait (vérifie ROADMAP.md)
4. Pas de sur-ingénierie — le plus simple qui marche
5. Code en anglais, explications en français
6. Nomme les commits en anglais avec le format : feat: / fix: / chore: / refactor: / test:
7. Crée les PRs avec des descriptions détaillées via l'API GitHub MCP

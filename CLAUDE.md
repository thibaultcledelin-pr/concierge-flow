# CLAUDE.md — Contexte projet ConciergeFlow

> Lis ce fichier en entier avant de répondre. Puis lis ROADMAP.md pour savoir où on en est.

## Projet
- **Nom** : ConciergeFlow
- **Description** : SaaS suivi rentabilité conciergeries Airbnb/Booking
- **Promesse** : "Tous vos logements, toutes vos plateformes, une seule marge nette."
- **Cible** : Conciergeries 5-30 logements en France

## Stack
Next.js 14 (App Router) + Supabase (Auth + PostgreSQL) + Prisma + Tailwind + shadcn/ui (Radix/Nova) + Recharts + ical.js + Papaparse + Vitest

## Design
Dark mode, style Linear/Vercel, sobre et pro

## Architecture
```
src/
├── app/(auth)/        → login, register, callback
├── app/(dashboard)/   → dashboard, properties, revenue, expenses, alerts
├── app/api/           → routes API
├── components/ui/     → shadcn
├── components/layout/ → sidebar, topbar, mobile-nav
├── components/[feature]/ → composants par feature
├── lib/               → prisma, supabase, utils, validators
├── hooks/             → hooks custom
└── types/             → types TypeScript
```

## Données
- Réservations : iCal auto (Airbnb + Booking)
- Revenus : import CSV depuis dashboards plateformes
- Dépenses : saisie manuelle catégorisée

## Mode de travail
- Mode autonome : code tout sans demander de validation intermédiaire
- Enchaîne toutes les sous-étapes d'une tâche d'un coup
- À la fin de la tâche, fais un résumé complet :
  - Fichiers créés/modifiés (liste avec chemins)
  - Commandes exécutées
  - Décisions prises et pourquoi
  - Ce qui marche et ce qui reste à tester
- Mets à jour ROADMAP.md automatiquement (coche cases, note erreurs)
- Attends "ok" uniquement avant la PROCHAINE ÉTAPE MAJEURE
- Si erreur, essaie de résoudre seul avant de remonter

## Tests
- `npm test` → lance tous les tests (doit passer en <30s)
- `npm run test:unit` → tests lib/ seulement (parsers, utils, validators)
- `npm run test:api` → tests routes API seulement
- `npm run test:ui` → tests composants et pages
- `npm run test:watch` → mode watch pendant le dev
- Avant chaque PR, tous les tests doivent passer
- On ne push jamais du code qui casse les tests existants
- Pour chaque feature, crée un dossier __tests__/ à côté des fichiers
- Utilise Vitest
- Après chaque feature, lance les tests et confirme que tout passe
- Si un test échoue, corrige avant de passer à la suite
- Note le statut des tests dans ROADMAP.md (✅ pass / ❌ fail)

## Règles de code
1. Code complet — pas de "...", pas de placeholders
2. Explique chaque fichier en une phrase
3. Procède étape par étape
4. Ne refais jamais ce qui est déjà fait (vérifie ROADMAP.md)
5. Pas de sur-ingénierie — le plus simple qui marche
6. Code en anglais, explications en français
7. Nomme les commits en anglais avec le format : feat: / fix: / chore:

# CLAUDE.md — Contexte projet ConciergeFlow

> Lis ce fichier en entier avant de répondre. Puis lis ROADMAP.md pour savoir où on en est.

## Projet
- **Nom** : ConciergeFlow
- **Description** : SaaS suivi rentabilité conciergeries Airbnb/Booking
- **Promesse** : "Tous vos logements, toutes vos plateformes, une seule marge nette."
- **Cible** : Conciergeries 5-30 logements en France

## Stack
Next.js 16 (App Router) + Supabase (Auth + PostgreSQL) + Prisma 7 (PrismaPg adapter) + Tailwind CSS 4 + shadcn/ui (Radix) + Recharts 3 + ical.js + Papaparse + Vitest + jsPDF + Resend

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

## Vocabulaire métier
Toujours utiliser ces termes en français dans les explications et l'UI :
- Property = **Logement**
- Booking = **Réservation**
- Revenue = **Revenus**
- Expense = **Dépense**
- Margin = **Marge**
- Occupancy = **Occupation**
- Owner = **Propriétaire**
- Dashboard = **Tableau de bord**

## Design
- **Style** : Dark mode crypto/fintech (inspiration dashboard crypto sombre, PAS le style "générique IA")
- **Thème** : Violet (#7c3aed) comme couleur primaire
- **Principes** :
  - Toujours un hover effect sur les cartes et boutons (transition smooth)
  - Skeletons au lieu de spinners pour le loading
  - Tooltips sombres sur les graphiques (pas de fond blanc)
  - Cartes avec bordures subtiles, pas de fond trop contrasté
  - Sobre et pro, pas de couleurs criardes
- **Recharts** : ne JAMAIS mettre de CSS dans `@layer base` pour Recharts (ça ne marche pas), toujours hors du layer

## Données
- Réservations : iCal auto (Airbnb + Booking) + sync en un clic
- Revenus : import CSV depuis dashboards plateformes
- Dépenses : saisie manuelle catégorisée + récurrence automatique
- Rapports : PDF propriétaire + envoi email via Resend
- **Occupation** : toujours calculée sur le mois en cours uniquement, capée à 100%

## Mode de travail
- Mode autonome : code tout sans demander de validation intermédiaire
- 1 PR par feature ou fix, chacune bien documentée
- Enchaîne toutes les sous-étapes d'une tâche d'un coup
- À la fin de la tâche, fais un résumé complet
- Mets à jour ROADMAP.md automatiquement
- Si erreur, essaie de résoudre seul avant de remonter

## Format des PRs (IMPORTANT)
Chaque PR DOIT suivre ce format (exemple : PR #42) :
```markdown
## Summary
Description claire de ce que fait la PR en 2-3 phrases.

## Implémentation
- Détail technique de chaque fichier/route créé
- Expliquer le "pourquoi" des choix techniques
- Mentionner les fonctions clés

## Tests (X nouveaux)
- Lister les tests ajoutés avec ce qu'ils vérifient

## Test plan
- [ ] Checklist des tests manuels à faire avant merge
- [ ] Scénario concret ("Créer une dépense récurrente → cliquer le bouton → vérifier")

## Setup requis (si applicable)
Commandes ou env vars nécessaires après merge
```

## Tests
- `npm test` → lance tous les tests (doit passer en <30s)
- Avant chaque PR, tous les tests doivent passer
- On ne push jamais du code qui casse les tests existants
- Pour chaque feature, ajouter les tests dans le fichier `__tests__/route.test.ts` à côté
- NE PAS créer de fichiers regression séparés — fusionner dans le fichier parent
- Utilise Vitest avec jsdom
- Actuellement : **189 tests, 35 fichiers, ~16s**

## Règles de code
1. Code complet — pas de "...", pas de placeholders
2. Procède étape par étape
3. Ne refais jamais ce qui est déjà fait (vérifie ROADMAP.md)
4. Pas de sur-ingénierie — le plus simple qui marche
5. Code en anglais, explications en français
6. Nomme les commits en anglais avec le format : feat: / fix: / chore: / refactor: / test:
7. Crée les PRs via l'API GitHub MCP, jamais juste un push sans PR
8. Toujours tester avec `npm test && npm run lint` avant de push

## Erreurs à ne plus refaire
- **Occupation >100%** : toujours filtrer les nuits au mois courant + `Math.min(100, ...)`
- **CSS Recharts** : mettre les overrides HORS du `@layer base` sinon ils sont ignorés
- **Logout** : utiliser `window.location.href` (pas `router.push`) pour vider le cache client
- **Prisma 7** : utiliser `prisma-client-js` generator + `PrismaPg` adapter, pas `prisma-client`
- **Fichiers tests** : ne pas créer de fichiers `*-regression.test.ts` séparés, fusionner dans le fichier parent
- **`cursor={false}`** : ne marche pas sur Recharts v3, utiliser le CSS global

# Architecture — ConciergeFlow

> Documentation technique. ~10 500 lignes TypeScript · 18 routes API · 15 pages · 240 tests.

## Vue d'ensemble

ConciergeFlow est une application Next.js 16 full-stack : le même projet sert le front (React) et le back (routes API). L'authentification et la base de données sont gérées par Supabase, l'accès aux données par Prisma.

```
Visiteur
  │
  ├─ /                       Landing page publique
  ├─ /login, /register       Authentification Supabase
  │
  └─ /dashboard (protégé)    Layout avec sidebar + topbar
      ├─ /dashboard          KPIs, graphiques, comparaison mois/mois
      ├─ /properties         Liste des logements
      │   ├─ /new            Création
      │   └─ /[id]           Détail (mini-dashboard) + /edit
      ├─ /calendar           Vue calendrier des réservations
      ├─ /revenue            Import CSV + tableau des réservations
      ├─ /expenses           Dépenses + filtres + récurrence
      ├─ /reports            Rapports PDF + envoi email
      ├─ /alerts             Alertes de rentabilité
      └─ /settings           Profil, conciergerie, sécurité
```

---

## Arborescence

```
src/
├── app/
│   ├── (auth)/            login, register, callback
│   ├── (dashboard)/       11 pages applicatives + layout
│   ├── api/               18 routes API
│   └── page.tsx           landing page
├── components/
│   ├── ui/                composants shadcn (Radix)
│   ├── layout/            sidebar, topbar, mobile-nav
│   ├── dashboard/         cartes KPI, graphiques Recharts, donut
│   ├── properties/        formulaire logement, import iCal
│   ├── expenses/          formulaire dépense, génération récurrente
│   ├── revenue/           import CSV
│   ├── reports/           génération PDF, boutons rapport/email
│   └── onboarding/        wizard 4 étapes, checklist
├── hooks/                 use-profile, use-toast, use-session-timeout, use-form-draft
├── lib/                   prisma, supabase, validators, parsers, utils
└── middleware.ts          protection des routes
```

---

## Routes API (18)

Toutes les routes vérifient l'authentification Supabase et la propriété des données (un utilisateur n'accède qu'à ses propres ressources).

### Logements
| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/properties` | GET / POST | Liste (champs sensibles filtrés) / création |
| `/api/properties/[id]` | GET / PUT / DELETE | Détail / modification / suppression |
| `/api/properties/[id]/bookings` | GET | Réservations paginées |
| `/api/properties/[id]/stats` | GET | KPIs + graphique + activité récente |
| `/api/properties/[id]/sync-ical` | POST | Synchronise les calendriers iCal |
| `/api/properties/[id]/report` | GET | Données du rapport (filtre `?month=`) |
| `/api/properties/[id]/send-report` | POST | Envoie le rapport PDF par email |

### Données & analyse
| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/dashboard` | GET | Agrégation KPIs + comparaison mois/mois |
| `/api/expenses` | GET / POST | Liste filtrée / création |
| `/api/expenses/[id]` | PUT / DELETE | Modification / suppression |
| `/api/expenses/run-recurring` | POST | Génère les dépenses récurrentes manquantes |
| `/api/revenue/import-csv` | POST | Import CSV Airbnb/Booking |
| `/api/alerts` | GET | Alertes calculées en temps réel |
| `/api/sync-all` | POST | Sync iCal de tous les logements |
| `/api/profile` | GET / PUT | Profil utilisateur |
| `/api/auth/signout` | POST | Déconnexion serveur |

### Tâches planifiées (cron)
| Route | Fréquence | Description |
|-------|-----------|-------------|
| `/api/cron/sync-ical` | chaque heure | Sync iCal de tous les utilisateurs |
| `/api/cron/recurring-expenses` | chaque jour | Génération des dépenses récurrentes |

Les crons sont protégés par `CRON_SECRET` et déclenchés par Vercel Cron (`vercel.json`).

---

## Modèle de données (Prisma)

```
User ──< Property ──< Booking
  │         │
  │         └──< Expense
  └────────────< Expense (globales, sans logement)
```

| Modèle | Champs clés |
|--------|-------------|
| **User** | email, name, company |
| **Property** | name, address, city, type, rooms, surface, icalUrl, icalUrlBooking, monthlyRent, ownerName, ownerEmail |
| **Booking** | checkIn, checkOut, nights, totalAmount, netAmount, platform, source, externalId |
| **Expense** | category, label, amount, date, isRecurring, frequency, notes |

### Flux des données

```
iCal (Airbnb/Booking)            CSV (Airbnb/Booking)
  │                                │
  ▼                                ▼
parseIcal()                  parseAirbnbCsv() / parseBookingCsv()
  │                                │
  ▼                                ▼
Booking (montant = 0)        Booking (montant = 450 €)
  │                                │
  └──── matching dates+plateforme ─┘
              │
              ▼
        Booking enrichi (montant ajouté)
```

Les calendriers iCal fournissent les **dates** mais pas les montants ; les CSV plateformes fournissent les **montants**. ConciergeFlow synchronise d'abord les iCal, puis enrichit avec les CSV.

---

## Bibliothèque (`src/lib/`)

| Fichier | Rôle |
|---------|------|
| `prisma.ts` | Singleton PrismaClient (adapter PrismaPg) |
| `supabase/client.ts` / `server.ts` | Clients Supabase navigateur / serveur |
| `validators.ts` | Schémas Zod partagés client + serveur |
| `ical-parser.ts` | `parseIcal()`, `detectPlatform()` |
| `csv-parser.ts` | Parsers CSV Airbnb / Booking |
| `chart-utils.ts` | Constantes & styles partagés des graphiques |
| `constants.ts` | Libellés catégories, fréquences, types de logement |
| `data-filter.ts` | Filtrage des champs sensibles des réponses API |
| `url-validator.ts` | Validation anti-SSRF des URLs iCal |
| `sanitize.ts` | Échappement HTML pour les emails |
| `rate-limit.ts` | Limiteur de requêtes en mémoire |
| `utils.ts` | `formatCurrency()`, `formatDate()`, `round1()`, `calculateNights()` |

---

## Tests (240)

Chaque feature a ses tests colocalisés dans un dossier `__tests__/`.

- **Routes API** : auth, validation, propriété des données, cas limites (division par zéro, mois sans données…)
- **Composants** : rendu, interactions, formulaires, états vides
- **Parsers** : iCal, CSV (cas normaux + cas dégradés)
- **Sécurité** : SSRF, open redirect, sanitization

```bash
npm test        # 240 tests, ~20s
```

CI GitHub Actions : `npm ci` → `npm test` → `npm run lint` à chaque pull request.

---

## Requêtes SQL métier

Voir [`docs/queries.sql`](./docs/queries.sql) pour les 7 requêtes métier documentées (marge nette, occupation, ADR, comparaison mensuelle, alertes, dépenses récurrentes).

---

## Ajouter une fonctionnalité

1. Créer une branche : `git checkout -b feat/ma-feature`
2. **Route API** : créer `src/app/api/.../route.ts`, vérifier l'auth + la propriété en début de handler, ajouter les tests dans `__tests__/`
3. **Composant** : créer dans `src/components/[feature]/`, réutiliser les composants shadcn
4. **Page** : créer dans `src/app/(dashboard)/`, ajouter le lien dans `sidebar.tsx`
5. Lancer `npm test && npm run lint` avant de pousser
6. Ouvrir une PR — la CI valide automatiquement

# ARCHITECTURE.md — Documentation technique ConciergeFlow

> Derniere mise a jour : 2026-04-20 — 189 tests, 97 fichiers source, ~21k lignes

## Vue d'ensemble

ConciergeFlow est un SaaS de suivi de rentabilite pour conciergeries Airbnb/Booking.

```
Utilisateur
  |
  +-- /login, /register     → Authentification Supabase
  |
  +-- /dashboard             → KPIs interactifs + graphiques + onboarding wizard
  |     +-- Donut occupation
  |     +-- Comparaison mois vs mois
  |     +-- Selecteur de logement
  |     +-- Sync iCal en un clic
  |
  +-- /properties            → CRUD logements
  |     +-- /[id]            → Mini-dashboard dedie (KPIs, graphique, reservations, depenses)
  |     +-- /[id]/edit       → Formulaire edition
  |     +-- /new             → Creation
  |
  +-- /revenue               → Import CSV + tableau reservations
  +-- /expenses              → Saisie depenses + filtres + recurrence auto
  +-- /reports               → Rapports PDF proprietaire + envoi email
  +-- /alerts                → Alertes intelligentes (marge negative, occupation basse)
```

---

## Stack technique

| Outil | Version | Role |
|-------|---------|------|
| **Next.js** | 16 | Framework React (App Router, Turbopack) |
| **Supabase** | — | Auth (email/password) + PostgreSQL |
| **Prisma** | 7 | ORM avec PrismaPg adapter |
| **Tailwind CSS** | 4 | Styles (oklch dark mode) |
| **shadcn/ui** | — | 17 composants UI (Radix primitives) |
| **Recharts** | 3 | AreaChart, BarChart, PieChart |
| **ical.js** | — | Parsing calendriers iCal |
| **Papaparse** | — | Parsing fichiers CSV |
| **jsPDF** | — | Generation rapports PDF |
| **Resend** | — | Envoi emails transactionnels |
| **Vitest** | 4 | Tests unitaires + composants (jsdom) |

---

## Routes API (13 endpoints)

### Dashboard
| Route | Methode | Description |
|-------|---------|-------------|
| `/api/dashboard` | GET | KPIs globaux, graphiques, comparaison mois vs mois. Supporte `?propertyId=` |

### Properties
| Route | Methode | Description |
|-------|---------|-------------|
| `/api/properties` | GET/POST | Liste / creation de logements |
| `/api/properties/[id]` | GET/PUT/DELETE | Detail / modification / suppression |
| `/api/properties/[id]/bookings` | GET | Reservations paginées d'un logement |
| `/api/properties/[id]/sync-ical` | POST | Sync calendrier iCal (Airbnb + Booking) |
| `/api/properties/[id]/stats` | GET | Stats detaillees d'un logement (KPIs + graphique + dernieres reservations/depenses) |
| `/api/properties/[id]/report` | GET | Donnees pour rapport proprietaire (supporte `?month=2026-04`) |
| `/api/properties/[id]/send-report` | POST | Envoie le rapport par email au proprietaire via Resend |

### Expenses
| Route | Methode | Description |
|-------|---------|-------------|
| `/api/expenses` | GET/POST | Liste (filtres + pagination) / creation |
| `/api/expenses/[id]` | PUT/DELETE | Modification / suppression |
| `/api/expenses/run-recurring` | POST | Genere les depenses recurrentes manquantes pour l'utilisateur |

### Revenue
| Route | Methode | Description |
|-------|---------|-------------|
| `/api/revenue/import-csv` | POST | Upload CSV (FormData), parse Airbnb/Booking, cree/enrichit les bookings |

### Autres
| Route | Methode | Description |
|-------|---------|-------------|
| `/api/sync-all` | POST | Sync iCal de tous les logements en un clic |
| `/api/alerts` | GET | Alertes intelligentes calculees en temps reel |
| `/api/auth/signout` | POST | Deconnexion server-side |
| `/api/cron/recurring-expenses` | POST | Endpoint cron pour depenses recurrentes (protege par CRON_SECRET) |

---

## Composants principaux

### Dashboard (`src/components/dashboard/`)
| Composant | Description |
|-----------|-------------|
| `stats-cards.tsx` | 6 KPIs cliquables avec hover, info tooltip, variation mois vs mois |
| `occupation-donut.tsx` | Donut chart avec % au centre |
| `occupancy-chart.tsx` | Timeline occupation (AreaChart) |
| `occupancy-bar-chart.tsx` | Occupation par logement (BarChart horizontal) |
| `revenue-chart.tsx` | Revenus vs Depenses vs Marge (AreaChart) |
| `revenue-per-night-chart.tsx` | Revenu net/nuit par logement (AreaChart multi-series) |
| `platform-chart.tsx` | Repartition par plateforme (PieChart) |
| `profitability-table.tsx` | Tableau rentabilite trie par marge |
| `sync-button.tsx` | Bouton sync iCal tous logements |

### Reports (`src/components/reports/`)
| Composant | Description |
|-----------|-------------|
| `generate-pdf.ts` | Generation PDF avec jsPDF (resume financier, tableaux reservations/depenses) |
| `report-button.tsx` | Bouton telechargement PDF avec loading state |
| `send-report-button.tsx` | Bouton envoi email au proprietaire |

### Onboarding (`src/components/onboarding/`)
| Composant | Description |
|-----------|-------------|
| `onboarding-wizard.tsx` | Wizard 3 etapes (bienvenue → premier logement → c'est parti) |

### Layout (`src/components/layout/`)
| Composant | Description |
|-----------|-------------|
| `sidebar.tsx` | Barre laterale (6 liens nav), logo cliquable vers dashboard |
| `topbar.tsx` | Barre haute, hamburger mobile, avatar + dropdown deconnexion |
| `mobile-nav.tsx` | Menu mobile (Sheet slide-in) |

---

## Modele de donnees (Prisma)

```
User ──< Property ──< Booking
  |         |
  |         +──< Expense
  +────────────< Expense (globales, sans propertyId)
```

| Modele | Champs cles |
|--------|-------------|
| **User** | email, name, company |
| **Property** | name, address, city, type, rooms, surface, icalUrl, icalUrlBooking, monthlyRent, ownerName, ownerEmail |
| **Booking** | checkIn, checkOut, nights, totalAmount, netAmount, platform, source, externalId |
| **Expense** | category, label, amount, date, isRecurring, frequency, notes |
| **Alert** | type, message, severity, isRead |

### Flux de donnees

```
iCal (Airbnb/Booking)              CSV (Airbnb/Booking)
  |                                   |
  v                                   v
parseIcal()                      parseAirbnbCsv() / parseBookingCsv()
  |                                   |
  v                                   v
Booking (totalAmount=0)          Booking (totalAmount=450€)
  |                                   |
  +---- matching par dates+platform --+
              |
              v
        Booking enrichi (montant ajoute)
```

---

## Utilitaires (`src/lib/`)

| Fichier | Description |
|---------|-------------|
| `prisma.ts` | Singleton PrismaClient avec PrismaPg adapter |
| `supabase/client.ts` | Client Supabase navigateur |
| `supabase/server.ts` | Client Supabase serveur (cookies) |
| `utils.ts` | cn(), formatCurrency(), formatDate(), calculateNights() |
| `validators.ts` | Schemas Zod : propertySchema, expenseSchema, bookingSchema |
| `chart-utils.ts` | MONTHS_FR, formatMonth(), TOOLTIP_STYLE (partage entre graphiques) |
| `ical-parser.ts` | parseIcal(), detectPlatform() |
| `csv-parser.ts` | parseAirbnbCsv(), parseBookingCsv(), detectCsvPlatform() |
| `env.ts` | validateEnv() — verification variables d'environnement |

---

## Tests — 189 tests, 35 fichiers, ~16s

| Domaine | Fichiers | Tests |
|---------|----------|-------|
| Auth (login, register, callback) | 3 | 14 |
| Layout (sidebar, topbar, mobile-nav) | 3 | 10 |
| Dashboard API + composants | 5 | 20 |
| Properties API + form + detail | 4 | 20 |
| iCal (parser + API + edge cases) | 3 | 17 |
| CSV (parser + API + edge cases) | 3 | 21 |
| Expenses (API + form) | 2 | 15 |
| Alerts API | 1 | 6 |
| Reports (button) | 1 | 3 |
| Property stats + report API | 2 | 9 |
| Sync-all API | 1 | 4 |
| Onboarding wizard | 1 | 4 |
| Occupation donut + sync button | 2 | 7 |
| Recurring expenses cron | 1 | 9 |
| Validators + utils + env | 3 | 25 |
| Pages regression | 1 | 3 |

---

## Comment ajouter une nouvelle feature

1. Creer une branche depuis main : `git checkout -b claude/feat-ma-feature`
2. Si besoin d'une route API :
   - Creer `src/app/api/mon-endpoint/route.ts`
   - Verifier l'auth Supabase + ownership en debut de handler
   - Ajouter les tests dans `__tests__/route.test.ts` a cote
3. Si besoin d'un composant UI :
   - Creer dans `src/components/[feature]/`
   - Utiliser les composants shadcn existants (`Card`, `Button`, etc.)
   - Style dark mode avec les variables CSS (oklch)
4. Si besoin d'une page :
   - Creer dans `src/app/(dashboard)/[page]/page.tsx`
   - Ajouter le lien dans `src/components/layout/sidebar.tsx`
5. Lancer `npm test && npm run lint` avant de push
6. Creer la PR avec description detaillee

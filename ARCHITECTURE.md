# ARCHITECTURE.md — Documentation technique ConciergeFlow

> Dernière mise à jour : 2026-04-16 — 73 tests passent

## Vue d'ensemble

ConciergeFlow est un SaaS de suivi de rentabilité pour conciergeries Airbnb/Booking.
L'app permet d'ajouter des logements, importer les réservations (iCal + CSV), et suivre les revenus.

```
Utilisateur
  │
  ├─ /login, /register    → Authentification Supabase
  │
  └─ /dashboard            → Layout avec sidebar
      ├─ /properties       → CRUD logements
      ├─ /revenue          → Import CSV + tableau réservations
      ├─ /expenses         → (à venir) Saisie dépenses
      └─ /alerts           → (à venir) Alertes rentabilité
```

---

## Stack technique

| Outil | Rôle |
|-------|------|
| **Next.js 16** | Framework React (App Router) |
| **Supabase** | Auth (email/password + OAuth) + PostgreSQL |
| **Prisma 7** | ORM, schéma dans `prisma/schema.prisma` |
| **Tailwind CSS 4** | Styles utilitaires |
| **shadcn/ui** | Composants UI (Radix primitives) |
| **Recharts** | Graphiques (pas encore utilisé) |
| **ical.js** | Parsing calendriers iCal |
| **Papaparse** | Parsing fichiers CSV |
| **Vitest** | Tests unitaires + composants |

---

## Arborescence des fichiers

### Configuration racine

| Fichier | Ce qu'il fait |
|---------|---------------|
| `package.json` | Dépendances + scripts (`dev`, `build`, `test`, `test:run`) |
| `tsconfig.json` | Config TypeScript, alias `@/*` → `./src/*` |
| `next.config.ts` | Config Next.js (vide pour l'instant) |
| `postcss.config.mjs` | PostCSS avec plugin Tailwind |
| `vitest.config.ts` | Config tests : jsdom, globals, alias, setup file |
| `prisma.config.ts` | Config Prisma 7 : chemin schema + DATABASE_URL |
| `prisma/schema.prisma` | Schéma base de données (voir section Données) |
| `.env.example` | Variables d'environnement requises |
| `CLAUDE.md` | Instructions pour Claude (mode de travail, règles) |
| `ROADMAP.md` | Avancement du projet, cases cochées par étape |

### src/lib/ — Utilitaires et logique métier

| Fichier | Ce qu'il fait |
|---------|---------------|
| `prisma.ts` | Singleton PrismaClient (évite les connexions multiples en dev) |
| `supabase/client.ts` | Client Supabase côté navigateur (pour login/register) |
| `supabase/server.ts` | Client Supabase côté serveur (pour API routes, cookies) |
| `utils.ts` | `cn()` (classnames), `formatCurrency()`, `formatDate()`, `calculateMargin()`, `calculateNights()` |
| `validators.ts` | Schémas Zod : `propertySchema`, `expenseSchema`, `bookingSchema` — utilisés côté client ET serveur |
| `ical-parser.ts` | `parseIcal(data)` → extrait les réservations d'un fichier iCal. `detectPlatform(url)` → Airbnb/Booking/Other |
| `csv-parser.ts` | `parseAirbnbCsv(data)`, `parseBookingCsv(data)` → parse les CSV de revenus. `detectCsvPlatform(data)` → auto-détection |

### src/middleware.ts — Protection des routes

Intercepte chaque requête :
- **Non connecté** + route protégée → redirige vers `/login`
- **Connecté** + `/login` ou `/register` → redirige vers `/dashboard`
- Gère les cookies Supabase (refresh token)

### src/app/ — Pages et routes

#### Auth (`src/app/(auth)/`)

| Fichier | Ce qu'il fait | Modifie en base |
|---------|---------------|------------------|
| `layout.tsx` | Layout centré sans sidebar, logo ConciergeFlow | Non |
| `login/page.tsx` | Formulaire email + mot de passe → `supabase.auth.signInWithPassword()` | Non (auth Supabase) |
| `register/page.tsx` | Formulaire nom + email + password + conciergerie → `supabase.auth.signUp()` avec metadata | Non (auth Supabase) |
| `callback/route.ts` | Échange le code OAuth → session Supabase → redirige `/dashboard` | Non (auth Supabase) |

#### Dashboard (`src/app/(dashboard)/`)

| Fichier | Ce qu'il fait | Modifie en base |
|---------|---------------|------------------|
| `layout.tsx` | Layout avec Sidebar + Topbar + MobileNav | Non |
| `dashboard/page.tsx` | Page d'accueil "Bienvenue sur ConciergeFlow" | Non |

#### Logements (`src/app/(dashboard)/properties/`)

| Fichier | Ce qu'il fait | Modifie en base |
|---------|---------------|------------------|
| `page.tsx` | Liste les logements en grille de cards, bouton supprimer | Lit `properties` |
| `new/page.tsx` | Formulaire création logement | Non (appelle l'API) |
| `[id]/page.tsx` | Détail d'un logement (type, pièces, surface, loyer, iCal) | Lit `properties` |
| `[id]/edit/page.tsx` | Formulaire édition pré-rempli | Non (appelle l'API) |

#### Revenus (`src/app/(dashboard)/revenue/`)

| Fichier | Ce qu'il fait | Modifie en base |
|---------|---------------|------------------|
| `page.tsx` | Sélecteur logement + import CSV + tableau des réservations | Lit `properties`, `bookings` |

### src/app/api/ — Routes API

Toutes les routes vérifient l'auth Supabase et le ownership (un user ne peut voir/modifier que ses propres données).

#### Properties API

| Route | Méthode | Ce qu'elle fait | Modifie en base |
|-------|---------|-----------------|------------------|
| `/api/properties` | GET | Liste les logements du user | Lit `properties` |
| `/api/properties` | POST | Crée un logement (validation Zod) | **Crée** dans `properties` |
| `/api/properties/[id]` | GET | Détail d'un logement | Lit `properties` |
| `/api/properties/[id]` | PUT | Modifie un logement (validation Zod) | **Modifie** dans `properties` |
| `/api/properties/[id]` | DELETE | Supprime un logement (cascade bookings + expenses) | **Supprime** dans `properties` |
| `/api/properties/[id]/bookings` | GET | Liste les réservations d'un logement | Lit `bookings` |
| `/api/properties/[id]/sync-ical` | POST | Fetch les URLs iCal, parse, crée les réservations manquantes | **Crée** dans `bookings` |

#### Revenue API

| Route | Méthode | Ce qu'elle fait | Modifie en base |
|-------|---------|-----------------|------------------|
| `/api/revenue/import-csv` | POST | Upload CSV (FormData), parse Airbnb/Booking, crée ou enrichit les bookings | **Crée/Modifie** dans `bookings` |

### src/components/ — Composants réutilisables

#### Layout (`src/components/layout/`)

| Composant | Ce qu'il fait |
|-----------|---------------|
| `sidebar.tsx` | Barre latérale fixe (desktop), logo violet, 5 liens nav, item actif en violet |
| `topbar.tsx` | Barre haute, hamburger (mobile), sélecteur de période, avatar + dropdown déconnexion |
| `mobile-nav.tsx` | Sheet slide-in (mobile), même navigation que sidebar |

#### Properties (`src/components/properties/`)

| Composant | Ce qu'il fait |
|-----------|---------------|
| `property-form.tsx` | Formulaire création/édition logement — react-hook-form + zodResolver. Champs : nom, adresse, ville, type, pièces, surface, loyer, URLs iCal |
| `ical-import.tsx` | Bouton "Synchroniser iCal" + affichage résultats (créées/ignorées/erreurs) |

#### Revenue (`src/components/revenue/`)

| Composant | Ce qu'il fait |
|-----------|---------------|
| `csv-import.tsx` | Upload fichier CSV + sélecteur plateforme (auto/Airbnb/Booking) + résultats import |

#### UI (`src/components/ui/`) — 15 composants shadcn

`alert`, `avatar`, `badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `select`, `separator`, `sheet`, `table`, `tabs`, `toast`

---

## Données (Prisma)

### Modèles

```
User ──< Property ──< Booking
  │         │
  │         └──< Expense
  └────────────< Expense (globales)
```

| Modèle | Table | Rôle | Champs clés |
|--------|-------|------|-------------|
| **User** | `users` | Compte utilisateur | email, name, company |
| **Property** | `properties` | Logement | name, address, city, type, rooms, surface, icalUrl, icalUrlBooking, monthlyRent |
| **Booking** | `bookings` | Réservation | checkIn, checkOut, nights, totalAmount, netAmount, platform, source, externalId |
| **Expense** | `expenses` | Dépense | category, label, amount, date, isRecurring, frequency |
| **Alert** | `alerts` | Alerte rentabilité | type, message, severity, isRead |

### Enums

| Enum | Valeurs |
|------|---------|
| PropertyType | APARTMENT, HOUSE, STUDIO, LOFT, VILLA, OTHER |
| Platform | AIRBNB, BOOKING, DIRECT, OTHER |
| BookingSource | ICAL, MANUAL, CSV |
| ExpenseCategory | CLEANING, MAINTENANCE, SUPPLIES, RENT, INSURANCE, TAX, PLATFORM_FEE, UTILITIES, FURNISHING, MARKETING, OTHER |
| Frequency | WEEKLY, MONTHLY, QUARTERLY, YEARLY |
| AlertType | LOW_MARGIN, HIGH_EXPENSE, NO_BOOKING, NEGATIVE_PROFIT |
| Severity | INFO, WARNING, CRITICAL |

### Flux de données

```
iCal (Airbnb/Booking)              CSV (Airbnb/Booking)
  │                                   │
  ▼                                   ▼
parseIcal()                      parseAirbnbCsv() / parseBookingCsv()
  │                                   │
  ▼                                   ▼
Booking (totalAmount=0)          Booking (totalAmount=450€)
  │                                   │
  └──── matching par dates+platform ──┘
              │
              ▼
        Booking enrichi (montant ajouté)
```

**Pourquoi iCal + CSV ?**
Les calendriers iCal donnent les dates et noms des voyageurs, mais PAS les montants.
Les CSV exportés depuis les dashboards Airbnb/Booking contiennent les montants.
→ On synchronise d'abord les iCal (dates), puis on enrichit avec les CSV (montants).

---

## Comment lancer le projet

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Remplir : NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, DATABASE_URL

# 3. Générer le client Prisma
npx prisma generate

# 4. Appliquer les migrations (quand connecté à Supabase)
npx prisma migrate dev

# 5. Lancer le serveur de dev
npm run dev
# → http://localhost:3000

# 6. Lancer les tests
npm run test:run    # une seule fois
npm run test        # mode watch
```

---

## Tests — 73 passent (14 fichiers)

| Domaine | Fichier | Tests |
|---------|---------|-------|
| Auth | `login.test.tsx` | 4 — rendu form, lien register, erreur, redirect |
| Auth | `register.test.tsx` | 5 — rendu form, lien login, erreur, metadata, redirect |
| Auth | `callback.test.ts` | 4 — échange code, redirect custom, fallback login |
| Layout | `sidebar.test.tsx` | 4 — branding, 5 items, hrefs, violet active |
| Layout | `topbar.test.tsx` | 4 — menu mobile, avatar, sélecteur période, callback |
| Layout | `mobile-nav.test.tsx` | 2 — items rendus, branding |
| Properties API | `route.test.ts` | 5 — 401, GET list, POST 400, POST 201 |
| Properties Form | `property-form.test.tsx` | 7 — champs, type select, titres, boutons |
| iCal Parser | `ical-parser.test.ts` | 9 — parse events, guest, nights, externalId, dates, empty, platforms |
| iCal API | `sync-ical/route.test.ts` | 5 — 401, 404, 400, create, dedup |
| iCal Component | `ical-import.test.tsx` | 3 — no URL message, button, clickable |
| CSV Parser | `csv-parser.test.ts` | 14 — Airbnb rows/guest/amounts/net/platform/nights, Booking rows/guest/total/net/platform, detect |
| CSV API | `import-csv/route.test.ts` | 4 — 401, 400 no file, create, enrich existing |
| CSV Component | `csv-import.test.tsx` | 3 — file input, platform selector, disabled button |

---

## Ce qui reste à faire

Voir `ROADMAP.md` pour le détail. En résumé :

| Étape | Statut | Description |
|-------|--------|-------------|
| 1.0 Setup | ✅ | Stack, Prisma, shadcn, config |
| 1.1 Auth | ✅ | Login, register, callback, middleware |
| 1.2 Layout | ✅ | Sidebar, topbar, mobile-nav |
| 2.0 CRUD logements | ✅ | API + form + 4 pages |
| 2.1 Import iCal | ✅ | Parser + sync API + dédoublonnage |
| 2.2 Import CSV | ✅ | Parser Airbnb/Booking + enrichissement |
| **3.0 Dépenses** | ⏳ | API CRUD + form + page filtres |
| **3.1 Dashboard** | ⏳ | KPIs, graphiques Recharts, table rentabilité |
| 4.0 Calculateur | ⏳ | Page publique gratuite |
| 4.1 Polish | ⏳ | Responsive, loading states, toasts, 404 |
| 4.2 Déploiement | ⏳ | Vercel + env prod |

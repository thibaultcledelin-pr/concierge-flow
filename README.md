# ConciergeFlow

> SaaS de suivi de rentabilité pour conciergeries Airbnb / Booking.  
> Tous vos logements, toutes vos plateformes, une seule marge nette.

![Next.js 16](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue) ![240 tests](https://img.shields.io/badge/tests-240%20passing-green) ![18 API routes](https://img.shields.io/badge/API-18%20routes-purple)

---

## Pourquoi ce projet

Les conciergeries gèrent des dizaines de logements répartis entre Airbnb, Booking et les réservations directes. Elles utilisent Lodgify pour les réservations et PriceLabs pour les prix — mais **aucun outil ne leur dit combien elles gagnent réellement**, net de toutes charges, logement par logement.

ConciergeFlow résout ce problème : il centralise automatiquement les réservations (iCal), les revenus (CSV plateformes) et les dépenses, puis calcule la **marge nette réelle** de chaque logement avec des alertes quand la rentabilité se dégrade.

---

## Fonctionnalités principales

| Fonctionnalité | Description |
|----------------|-------------|
| **Sync automatique iCal** | Connecte les calendriers Airbnb + Booking, synchronise chaque heure |
| **Import CSV** | Parse les exports de revenus Airbnb/Booking, enrichit les réservations |
| **Dashboard rentabilité** | 6 KPIs (marge, occupation, RevPAR, ADR), sparklines, comparaison mois/mois |
| **Graphes interactifs** | Revenus vs dépenses, occupation par logement, revenu/nuitée avec classement |
| **Dépenses récurrentes** | Catégorisées, avec génération automatique (ménage, loyer, assurance…) |
| **Rapports propriétaire** | PDF généré + envoi par email en un clic |
| **Alertes intelligentes** | Marge négative, occupation basse, détection automatique des problèmes |
| **Recherche globale ⌘K** | Palette de commande pour naviguer instantanément |

---

## Architecture technique

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js 16                           │
│                     (App Router, RSC)                       │
├────────────────────┬────────────────────────────────────────┤
│   15 pages React   │         18 routes API                  │
│   (SSR + client)   │   (REST, auth Supabase sur chaque)     │
├────────────────────┴────────────────────────────────────────┤
│                    Prisma 7 (ORM)                           │
│              PrismaPg adapter + requêtes typées              │
├─────────────────────────────────────────────────────────────┤
│               PostgreSQL (Supabase)                          │
│        4 tables · 6 enums · RLS via middleware               │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
    Airbnb iCal          Booking iCal         CSV plateformes
    (sync horaire)       (sync horaire)       (import manuel)
```

### Stack détaillée

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Framework | **Next.js 16** (App Router) | Full-stack React, SSR, API routes, middleware |
| Langage | **TypeScript** (strict) | Typage de bout en bout, front → API → base |
| Base de données | **PostgreSQL** (Supabase) | Relationnel, hébergé, auth intégrée |
| ORM | **Prisma 7** + PrismaPg | Requêtes typées, migrations, anti-injection SQL |
| Auth | **Supabase Auth** | JWT, sessions, middleware de protection |
| UI | **Tailwind CSS 4** + **shadcn/ui** (Radix) | Dark mode, composants accessibles |
| Graphiques | **Recharts** | LineChart, BarChart, PieChart avec tooltips custom |
| PDF | **jsPDF** + autotable | Génération côté client des rapports propriétaire |
| Email | **Resend** | Envoi transactionnel (rapports, alertes) |
| Tests | **Vitest** + Testing Library | 240 tests, ~20s, CI GitHub Actions |
| Validation | **Zod** | Schémas partagés client + serveur |

---

## Modèle de données

```sql
-- 4 tables principales, relations en étoile autour de Property

User ──< Property ──< Booking    (réservations iCal/CSV)
  │         │
  │         └──< Expense          (dépenses rattachées à un logement)
  └────────────< Expense          (dépenses globales, sans logement)
```

| Table | Colonnes clés | Volume type |
|-------|--------------|-------------|
| `users` | email, name, company | 1 par compte |
| `properties` | name, city, ical_url, ical_url_booking, monthly_rent, owner_email | 5-30 par user |
| `bookings` | check_in, check_out, nights, total_amount, platform, source, external_id | ~100-500 |
| `expenses` | category (11 types), amount, is_recurring, frequency | ~50-200 |

Voir le schéma complet : [`prisma/schema.prisma`](./prisma/schema.prisma)

---

## Requêtes SQL métier

Le projet utilise Prisma comme ORM, mais les agrégations du dashboard correspondent à des requêtes SQL complexes. Le fichier **[`docs/queries.sql`](./docs/queries.sql)** documente les 7 requêtes métier clés :

| # | Requête | Concepts SQL |
|---|---------|-------------|
| 1 | **Marge nette par logement** | `LEFT JOIN` multi-tables, `CASE WHEN`, agrégation `GROUP BY` |
| 2 | **Occupation mensuelle par logement** | `generate_series`, `CROSS JOIN`, `EXTRACT`, `LEAST` |
| 3 | **ADR (revenu moyen/nuitée) — tendance** | `HAVING`, `NULLIF` (division safe), `date_trunc` |
| 4 | **Comparaison mois courant vs précédent** | CTEs imbriquées, `self-join` temporel, variation en % |
| 5 | **Répartition CA par plateforme** | Sous-requête scalaire, `revenue_share_pct` |
| 6 | **Alertes : logements problématiques** | CTE `property_stats`, `CASE` multi-niveaux, tri par priorité |
| 7 | **Dépenses récurrentes à générer** | `IS NOT DISTINCT FROM` (NULL-safe), intervalles PostgreSQL |

<details>
<summary>Exemple : marge nette par logement (requête #1)</summary>

```sql
SELECT
    p.name,
    p.city,
    COALESCE(SUM(b.total_amount), 0)                                    AS revenue,
    COALESCE(SUM(e.amount), 0)                                           AS expenses,
    COALESCE(SUM(b.total_amount), 0) - COALESCE(SUM(e.amount), 0)       AS profit,
    CASE
        WHEN COALESCE(SUM(b.total_amount), 0) > 0
        THEN ROUND(
            ((SUM(b.total_amount) - COALESCE(SUM(e.amount), 0))
             / SUM(b.total_amount)) * 100, 1)
        ELSE 0
    END AS margin_pct
FROM properties p
LEFT JOIN bookings b ON b.property_id = p.id
LEFT JOIN expenses e ON e.property_id = p.id
WHERE p.user_id = :user_id
GROUP BY p.id, p.name, p.city
ORDER BY margin_pct DESC;
```

</details>

<details>
<summary>Exemple : taux d'occupation mensuel (requête #2)</summary>

```sql
WITH months AS (
    SELECT generate_series(
        date_trunc('month', NOW()) - INTERVAL '5 months',
        date_trunc('month', NOW()),
        '1 month'
    )::date AS month_start
),
property_nights AS (
    SELECT
        b.property_id,
        date_trunc('month', b.check_in)::date AS month_start,
        SUM(b.nights)                          AS nights
    FROM bookings b
    JOIN properties p ON p.id = b.property_id
    WHERE p.user_id = :user_id
    GROUP BY b.property_id, date_trunc('month', b.check_in)
)
SELECT
    p.name,
    TO_CHAR(m.month_start, 'YYYY-MM') AS month,
    LEAST(100, ROUND(
        COALESCE(pn.nights, 0)::numeric
        / EXTRACT(DAY FROM (m.month_start + INTERVAL '1 month' - INTERVAL '1 day'))
        * 100, 1
    )) AS occupancy_pct
FROM properties p
CROSS JOIN months m
LEFT JOIN property_nights pn
    ON pn.property_id = p.id AND pn.month_start = m.month_start
WHERE p.user_id = :user_id
ORDER BY p.name, m.month_start;
```

</details>

---

## Structure du projet

```
src/
├── app/
│   ├── (auth)/            → login, register, callback (Supabase Auth)
│   ├── (dashboard)/       → 11 pages applicatives + layout (sidebar, topbar)
│   ├── api/               → 18 routes REST (auth + ownership check sur chaque)
│   ├── pricing/           → page tarifs publique
│   └── page.tsx           → landing page
├── components/
│   ├── ui/                → 17 composants shadcn/ui (Radix)
│   ├── layout/            → sidebar, topbar, mobile-nav, command-palette (⌘K)
│   ├── dashboard/         → KPI cards, graphiques Recharts, donut occupation
│   ├── pricing/           → toggle mensuel/annuel, cartes plans
│   └── [feature]/         → composants par feature (properties, expenses, reports…)
├── hooks/                 → useProfile, useToast, useSessionTimeout, useFormDraft
├── lib/                   → prisma, supabase, validators (Zod), parsers, utils
└── middleware.ts          → protection des routes (redirect si non connecté)
```

---

## Démarrage rapide

```bash
git clone https://github.com/thibaultcledelin-pr/concierge-flow.git
cd concierge-flow
npm install

# Configurer l'environnement
cp .env.example .env   # puis remplir les clés Supabase

# Base de données
npx prisma generate
npx prisma db push
npm run seed           # données de démo (optionnel)

# Lancer
npm run dev            # → http://localhost:3000
```

### Variables d'environnement

| Variable | Requis | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | oui | Clé publique anon |
| `DATABASE_URL` | oui | Connection string PostgreSQL |
| `RESEND_API_KEY` | non | Pour l'envoi des rapports par email |
| `CRON_SECRET` | non | Protège les endpoints cron (sync iCal, dépenses récurrentes) |

---

## Tests

```bash
npm test          # 240 tests, ~20s
npm run lint      # ESLint (0 erreur)
```

Tests colocalisés avec les features (`__tests__/route.test.ts`). Couvrent :
- **Routes API** : auth, validation, ownership, cas limites (division par zéro, mois vides)
- **Composants** : rendu, interactions, formulaires, états vides
- **Parsers** : iCal Airbnb/Booking, CSV, cas dégradés
- **Sécurité** : SSRF, open redirect, sanitization HTML

CI : GitHub Actions lance `npm ci → npm test → npm run lint` sur chaque PR.

---

## Sécurité

- Auth Supabase + vérification de propriété sur **chaque** route API
- Requêtes Prisma typées (pas d'injection SQL)
- Headers HTTP : CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Protection SSRF sur les URLs iCal, sanitization HTML des emails
- Données sensibles (URLs iCal, emails propriétaires) filtrées des réponses API
- Déconnexion automatique après 30 min d'inactivité + sauvegarde des brouillons
- Rate limiting prêt à l'emploi sur les routes sensibles

---

## Documentation complémentaire

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — routes API détaillées, flux de données, guide contribution
- [`ROADMAP.md`](./ROADMAP.md) — état d'avancement et prochaines étapes
- [`docs/queries.sql`](./docs/queries.sql) — requêtes SQL métier documentées

---

## Licence

Projet privé — © 2026 ConciergeFlow.

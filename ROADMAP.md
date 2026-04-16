# ROADMAP.md — État d'avancement

> Reprends là où le statut indique "EN COURS" ou "À FAIRE".
> Ne propose jamais de refaire une étape marquée "FAIT".

## Statut actuel
📍 **Dernière session** : 2026-04-16
🔧 **Étape en cours** : 3.0 — Dépenses

---

## Semaine 1 — Fondations

### 1.0 Setup projet
- [x] Init Next.js
- [x] Dépendances installées
- [x] shadcn/ui configuré (Radix + Nova)
- [x] Prisma init + schéma complet
- [x] Fichiers lib/ créés (prisma, supabase, utils, validators)
- [x] Middleware auth créé
- [x] .env.example créé
- [x] CLAUDE.md + ROADMAP.md créés
- [x] npm run dev fonctionne
- [x] Premier commit

### 1.1 Auth
- [x] Page /login
- [x] Page /register
- [x] Route /callback
- [x] Layout auth (centré, sans sidebar)
- [x] Tests auth ✅ 13/13

### 1.2 Layout app
- [x] Sidebar (violet active state, icônes Lucide)
- [x] Topbar (avatar, sélecteur période, déconnexion)
- [x] MobileNav (Sheet responsive)
- [x] Layout dashboard
- [x] README.md mis à jour
- [x] Tests layout ✅ 10/10

## Semaine 2 — Logements + données

### 2.0 CRUD logements
- [x] API routes (GET, POST, PUT, DELETE)
- [x] PropertyForm (react-hook-form + Zod)
- [x] Pages (liste cards, new, detail, edit)
- [x] Validation Zod côté serveur
- [x] Tests properties ✅ 11/11

### 2.1 Import iCal
- [x] API sync-ical (POST /api/properties/[id]/sync-ical)
- [x] Parser ical.js (parseIcal + detectPlatform)
- [x] Dédoublonnage externalId
- [x] Composant IcalImport
- [x] Tests iCal ✅ 17/17

### 2.2 Import CSV
- [x] Parser CSV Airbnb (Papaparse) — parseAirbnbCsv
- [x] Parser CSV Booking — parseBookingCsv
- [x] Matching avec bookings existants (enrichissement montants)
- [x] Composant CsvImport (upload + auto-detect platform)
- [x] Page /revenue (sélecteur logement, import CSV, table réservations)
- [x] API GET /api/properties/[id]/bookings
- [x] Tests CSV ✅ 21/21 (total 73/73)

## Semaine 3 — Dépenses + dashboard

### 3.0 Dépenses
- [ ] API CRUD expenses
- [ ] ExpenseForm
- [ ] Page /expenses (filtres)
- [ ] Dépenses récurrentes
- [ ] Tests expenses ✅/❌

### 3.1 Dashboard
- [ ] API /api/dashboard (agrégation)
- [ ] StatsCards (KPIs)
- [ ] RevenueChart (Recharts)
- [ ] ProfitabilityTable
- [ ] Répartition par plateforme
- [ ] Page /dashboard
- [ ] Tests dashboard ✅/❌

## Semaine 4 — Polish + lancement

### 4.0 Calculateur gratuit
- [ ] Page publique /calculator
- [ ] Formulaire + résultat
- [ ] CTA inscription
- [ ] SEO meta tags

### 4.1 Polish
- [ ] Responsive mobile
- [ ] Loading/error states
- [ ] Toast notifications
- [ ] Page 404

### 4.2 Déploiement
- [ ] Config Vercel
- [ ] Variables env production
- [ ] Test en prod
- [ ] URLs Supabase mises à jour

---

## Erreurs et solutions

| Date | Problème | Solution |
|------|----------|----------|
| 2026-04-16 | shadcn registry blocked | Created components manually |
| 2026-04-16 | Prisma 7 url/directUrl removed | Moved to prisma.config.ts |
| 2026-04-16 | git push CLI 403 | Used GitHub MCP push_files |
| 2026-04-16 | Select renders text twice in DOM | Used getAllByText in test |
| 2026-04-16 | File.text() unreliable in jsdom tests | Mocked csv-parser module in API tests |

## Décisions techniques

| Date | Décision | Raison |
|------|----------|--------|
| 2026-04-16 | shadcn Radix + Nova | Style dark moderne |
| 2026-04-16 | iCal + CSV | iCal ne donne pas les montants |
| 2026-04-16 | Airbnb + Booking au MVP | 80% du marché FR |
| 2026-04-16 | Vitest | Plus rapide que Jest pour Next.js |
| 2026-04-16 | totalAmount=0 pour iCal | Enrichi ensuite par CSV |
| 2026-04-16 | CSV matching par dates+platform | Enrichit les bookings iCal existants avec les montants CSV |
| 2026-04-16 | Auto-detect CSV platform | Détection par headers (Confirmation code → Airbnb, Commission → Booking) |

## Notes de session

### Session 1 — 2026-04-16
- Semaine 1 : Setup (1.0), Auth (1.1), Layout (1.2)
- Semaine 2 : CRUD logements (2.0), Import iCal (2.1), Import CSV (2.2)
- Total : 73 tests passent
- Prochaine étape : 3.0 Dépenses

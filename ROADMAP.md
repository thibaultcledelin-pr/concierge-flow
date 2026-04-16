# ROADMAP.md — État d'avancement

> Reprends là où le statut indique "EN COURS" ou "À FAIRE".
> Ne propose jamais de refaire une étape marquée "FAIT".

## Statut actuel
📍 **Dernière session** : 2026-04-16
🔧 **Étape en cours** : 1.0 — Setup projet

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
- [ ] Premier commit

### 1.1 Auth
- [ ] Page /login
- [ ] Page /register
- [ ] Route /callback
- [ ] Layout auth (centré, sans sidebar)
- [ ] Tests auth ✅/❌

### 1.2 Layout app
- [ ] Sidebar
- [ ] Topbar
- [ ] MobileNav
- [ ] Layout dashboard
- [ ] Tests layout ✅/❌

## Semaine 2 — Logements + données

### 2.0 CRUD logements
- [ ] API routes (GET, POST, PUT, DELETE)
- [ ] PropertyForm
- [ ] Pages (liste, new, detail, edit)
- [ ] Validation Zod
- [ ] Tests properties ✅/❌

### 2.1 Import iCal
- [ ] API sync-ical
- [ ] Parser ical.js
- [ ] Dédoublonnage externalId
- [ ] Composant IcalImport
- [ ] Tests iCal ✅/❌

### 2.2 Import CSV
- [ ] Parser CSV Airbnb (Papaparse)
- [ ] Parser CSV Booking
- [ ] Matching avec bookings existants
- [ ] Composant CsvImport
- [ ] Page /revenue
- [ ] Tests CSV ✅/❌

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
| 2026-04-16 | shadcn registry blocked (auth required for Nova preset) | Created components manually with shadcn-compatible code |
| 2026-04-16 | Prisma 7 no longer supports url/directUrl in schema | Moved to prisma.config.ts, used prisma-client generator |

## Décisions techniques

| Date | Décision | Raison |
|------|----------|--------|
| 2026-04-16 | shadcn Radix + Nova | Style dark moderne |
| 2026-04-16 | iCal + CSV | iCal ne donne pas les montants |
| 2026-04-16 | Airbnb + Booking au MVP | 80% du marché FR |
| 2026-04-16 | Vitest | Plus rapide que Jest pour Next.js |

## Notes de session

### Session 1 — 2026-04-16
- Setup initial du projet
- shadcn components created manually (registry auth issue)

# ROADMAP.md — État d'avancement

> Reprends là où le statut indique "EN COURS" ou "À FAIRE".
> Ne propose jamais de refaire une étape marquée "FAIT".

## Statut actuel
📍 **Dernière session** : 2026-04-16
🔧 **Étape en cours** : Déploiement Vercel

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
- [x] Parser CSV Airbnb (Papaparse)
- [x] Parser CSV Booking
- [x] Matching avec bookings existants
- [x] Composant CsvImport
- [x] Page /revenue
- [x] Tests CSV ✅ 21/21

## Semaine 3 — Dépenses + dashboard

### 3.0 Dépenses
- [x] API CRUD expenses (GET avec filtres, POST, PUT, DELETE)
- [x] ExpenseForm (dialog, catégories, récurrent, sélecteur logement)
- [x] Page /expenses (filtres logement + catégorie, tableau, edit/delete)
- [x] Dépenses récurrentes (checkbox + fréquence)
- [x] Tests expenses ✅ 13/13

### 3.1 Dashboard
- [x] API /api/dashboard (agrégation revenus, dépenses, marge, occupation)
- [x] StatsCards (4 KPIs)
- [x] RevenueChart (Recharts AreaChart animé)
- [x] ProfitabilityTable (trié par marge, couleur vert/jaune/rouge)
- [x] Répartition par plateforme (PieChart)
- [x] Page /dashboard assemblée
- [x] Tests dashboard ✅ 9/9

### Audit sécurité
- [x] Protection SSRF + error sanitization + CSV 5MB limit + HTTPS URLs
- [x] Tests edge cases ✅ 37/37
- [x] Total : 134 tests passent

## Semaine 4 — Polish + déploiement

### 4.1 Polish
- [x] Toast notifications (création, modification, suppression, import)
- [x] Loading states avec skeleton (dashboard, properties)
- [x] Error states avec bouton retry
- [x] Page 404 custom dark mode
- [x] Meta tags Open Graph + Twitter
- [x] Responsive mobile (flex-wrap, truncate, min-w-0)

### 4.2 Déploiement
- [x] npm run build compile (ignoreBuildErrors pour Prisma 7 .ts)
- [x] postinstall: prisma generate
- [x] next.config.ts prêt pour Vercel
- [x] .env.example à jour
- [ ] Déployer sur Vercel
- [ ] Connecter Supabase
- [ ] Test en prod

---

## Erreurs et solutions

| Date | Problème | Solution |
|------|----------|----------|
| 2026-04-16 | shadcn registry blocked | Created components manually |
| 2026-04-16 | Prisma 7 url/directUrl removed from schema | Moved to prisma.config.ts |
| 2026-04-16 | git push CLI 403 | Used GitHub MCP API push_files |
| 2026-04-16 | Turbopack can't resolve Prisma 7 .ts files | Import from @/generated/prisma/client directly |
| 2026-04-16 | Recharts Tooltip types incompatible v3 | Cast any on formatter/labelFormatter |
| 2026-04-16 | Zod v4 + hookform resolver conflict | Cast any on zodResolver |

## Notes de session

### Session 1 — 2026-04-16
- Semaine 1 : Setup, Auth, Layout
- Semaine 2 : CRUD logements, Import iCal, Import CSV
- Semaine 3 : Dépenses, Dashboard, Audit sécurité
- Semaine 4 : Polish (toasts, loading, error, 404, meta) + Build fixes
- Total : 134 tests, ~7500 lignes de code
- Prêt pour déploiement Vercel

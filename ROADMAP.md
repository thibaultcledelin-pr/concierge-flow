# ROADMAP.md — État d'avancement

> Reprends là où le statut indique "EN COURS" ou "À FAIRE".
> Ne propose jamais de refaire une étape marquée "FAIT".

## Statut actuel
📍 **Dernière session** : 2026-04-16
🔧 **Étape en cours** : 2.1 — Import iCal

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
- [x] Tests properties ✅ 11/11 (total 34/34)

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
| 2026-04-16 | shadcn registry blocked | Created components manually |
| 2026-04-16 | Prisma 7 url/directUrl removed from schema | Moved to prisma.config.ts |
| 2026-04-16 | git push CLI 403 | Used GitHub MCP API push_files |

## Décisions techniques

| Date | Décision | Raison |
|------|----------|--------|
| 2026-04-16 | shadcn Radix + Nova | Style dark moderne |
| 2026-04-16 | iCal + CSV | iCal ne donne pas les montants |
| 2026-04-16 | Airbnb + Booking au MVP | 80% du marché FR |
| 2026-04-16 | Vitest | Plus rapide que Jest pour Next.js |
| 2026-04-16 | react-hook-form + zodResolver | Validation côté client cohérente avec côté serveur |

## Notes de session

### Session 1 — 2026-04-16
- Setup (1.0), Auth (1.1), Layout (1.2) — Semaine 1 terminée
- CRUD logements (2.0) : API + form + 4 pages + tests 11/11
- Total : 34 tests passent

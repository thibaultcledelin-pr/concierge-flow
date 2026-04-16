# ROADMAP.md — État d'avancement

> Reprends là où le statut indique "EN COURS" ou "À FAIRE".
> Ne propose jamais de refaire une étape marquée "FAIT".

## Statut actuel
📍 **Dernière session** : 2026-04-16
🔧 **Étape en cours** : 4.0 — Calculateur gratuit

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
- [x] StatsCards (4 KPIs : revenu, dépenses, marge %, occupation %)
- [x] RevenueChart (Recharts AreaChart animé, revenus vs dépenses)
- [x] ProfitabilityTable (tous logements triés par marge, couleur vert/jaune/rouge)
- [x] Répartition par plateforme (PieChart Airbnb vs Booking)
- [x] Page /dashboard assemblée
- [x] Tests dashboard ✅ 9/9

### Audit sécurité + tests
- [x] Protection SSRF sur sync-ical (isAllowedUrl)
- [x] Sanitization des messages d'erreur
- [x] Tests validators Zod (14 edge cases)
- [x] Tests iCal edge cases (6 : sans UID, sans dates, malformé, vide)
- [x] Tests CSV edge cases (7 : vide, headers seuls, dates invalides, caractères spéciaux)
- [x] Tests utils (8 : formatCurrency, calculateMargin, calculateNights)
- [x] Total : 131 tests passent ✅

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
| 2026-04-16 | Select renders text twice in DOM | Used getAllByText in test |
| 2026-04-16 | File.text() unstable in jsdom | Mocked csv-parser module in API tests |
| 2026-04-16 | Error messages leaked internal info | Sanitized to generic messages |
| 2026-04-16 | No SSRF protection on iCal fetch | Added isAllowedUrl() validation |

## Décisions techniques

| Date | Décision | Raison |
|------|----------|--------|
| 2026-04-16 | shadcn Radix + Nova | Style dark moderne |
| 2026-04-16 | iCal + CSV | iCal ne donne pas les montants |
| 2026-04-16 | Airbnb + Booking au MVP | 80% du marché FR |
| 2026-04-16 | Vitest | Plus rapide que Jest pour Next.js |
| 2026-04-16 | totalAmount=0 pour iCal bookings | Enrichi ensuite par CSV |
| 2026-04-16 | ExpenseForm en Dialog | UX fluide sans changer de page |
| 2026-04-16 | Dashboard agregé côté serveur | Pas de calcul lourd côté client |

## Notes de session

### Session 1 — 2026-04-16
- Semaine 1 : Setup (1.0), Auth (1.1), Layout (1.2)
- Semaine 2 : CRUD logements (2.0), Import iCal (2.1), Import CSV (2.2)
- Semaine 3 : Dépenses (3.0), Dashboard (3.1)
- Audit sécurité : SSRF fix, error sanitization, +35 tests edge cases
- Total : 131 tests passent
- Prochaine étape : Semaine 4 (calculateur, polish, déploiement)

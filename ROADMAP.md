# ROADMAP.md — Etat d'avancement

> Reprends la ou le statut indique "EN COURS" ou "A FAIRE".
> Ne propose jamais de refaire une etape marquee "FAIT".

## Statut actuel
📍 **Derniere session** : 2026-04-20
🔧 **En cours** : Design polish + deploiement Vercel
📊 **Stats** : 189 tests, 97 fichiers source, ~21k lignes de code

---

## Phase 1 — Fondations ✅

### 1.0 Setup projet ✅
- [x] Next.js 16 + Tailwind CSS 4 + shadcn/ui
- [x] Prisma 7 + PrismaPg adapter + Supabase PostgreSQL
- [x] Middleware auth + .env.example
- [x] CI GitHub Actions (tests + lint)

### 1.1 Auth ✅
- [x] Login / Register / Callback
- [x] Layout auth (centre, sans sidebar)
- [x] Deconnexion avec window.location.href (vide le cache)

### 1.2 Layout ✅
- [x] Sidebar (violet active state, 6 liens nav, logo cliquable)
- [x] Topbar (avatar, dropdown deconnexion)
- [x] MobileNav (Sheet responsive)

## Phase 2 — Donnees ✅

### 2.0 CRUD logements ✅
- [x] API routes (GET, POST, PUT, DELETE)
- [x] PropertyForm (react-hook-form + Zod)
- [x] Pages (liste cards, new, detail mini-dashboard, edit)
- [x] Champs proprietaire (ownerName, ownerEmail) — PR en attente

### 2.1 Import iCal ✅
- [x] Parser ical.js (parseIcal + detectPlatform)
- [x] API sync-ical par logement
- [x] API sync-all (tous les logements en un clic)
- [x] Bouton SyncButton dans le dashboard
- [x] Dedoublonnage externalId

### 2.2 Import CSV ✅
- [x] Parser Airbnb + Booking (Papaparse)
- [x] Matching avec bookings existants (enrichissement montants)
- [x] Composant CsvImport

## Phase 3 — Suivi ✅

### 3.0 Depenses ✅
- [x] API CRUD expenses (filtres + pagination)
- [x] ExpenseForm (dialog, categories, recurrent, selecteur logement)
- [x] Page /expenses (filtres logement + categorie)
- [x] Depenses recurrentes (WEEKLY/MONTHLY/QUARTERLY/YEARLY) — PR en attente
- [x] Bouton "Generer recurrentes" + endpoint cron

### 3.1 Dashboard ✅
- [x] API /api/dashboard (aggregation, filtrage par logement)
- [x] 6 KPIs cliquables avec hover + info tooltip
- [x] Donut chart occupation (% au centre)
- [x] Comparaison mois vs mois (+15% / -8%) — PR en attente
- [x] Graphiques : occupation timeline, revenus vs depenses, revenu/nuit, occupation par logement
- [x] Selecteur de logement (filtre tout le dashboard)
- [x] Table rentabilite (triee par marge)
- [x] Onboarding wizard (3 etapes si 0 logements)

### 3.2 Page detail logement ✅
- [x] API /api/properties/[id]/stats
- [x] Mini-dashboard dedie (6 KPIs + graphique + reservations + depenses)

### 3.3 Alertes ✅
- [x] API /api/alerts (analyse automatique de tous les logements)
- [x] 5 types : marge negative, marge faible, occupation basse, aucune reservation, occupation excellente
- [x] Page /alerts avec cartes colorees

### 3.4 Rapports ✅
- [x] API /api/properties/[id]/report (donnees avec filtre par mois)
- [x] Generation PDF (jsPDF + jspdf-autotable)
- [x] Page /reports (3 boutons par logement)
- [x] Envoi email proprietaire via Resend — PR en attente
- [x] Boutons SendReportButton + ReportButton

## Phase 4 — Polish + deploiement

### 4.0 UX/Design 🔧
- [x] Dark mode oklch
- [x] Toast notifications
- [x] Loading states + error states avec retry
- [x] Logo cliquable → dashboard
- [x] Tooltips sombres sur graphiques
- [x] Focus outline supprime sur Recharts
- [ ] Ameliorer le design global (moins "IA", plus crypto/dark dashboard)
- [ ] Responsive mobile polish

### 4.1 Securite ✅
- [x] Protection SSRF sur URLs iCal
- [x] Sanitization erreurs (pas d'infos internes cote client)
- [x] Limite 5MB sur upload CSV
- [x] HTTPS obligatoire sur iCal URLs
- [x] Auth + ownership check sur toutes les routes API

### 4.2 Tests ✅
- [x] 189 tests (35 fichiers)
- [x] Tests API : auth, CRUD, edge cases, division par zero
- [x] Tests composants : rendu, interactions, formulaires
- [x] Tests regression fusionnes dans fichiers parents

### 4.3 Deploiement ⏳
- [ ] Deployer sur Vercel
- [ ] Connecter Supabase prod
- [ ] Configurer Resend (domaine + API key)
- [ ] Configurer cron Vercel pour depenses recurrentes
- [ ] Test en prod

---

## PRs en attente de merge (au 2026-04-20)

| PR | Branche | Description |
|----|---------|-------------|
| #41 | `claude/fix-occupancy-over-100` | Fix occupation >100% |
| #42 | `claude/feat-recurring-expenses` | Depenses recurrentes automatiques |
| #43 | `claude/feat-owner-email` | Gestion proprietaires + email rapports |
| #44 | `claude/feat-period-comparison` | Comparaison mois vs mois sur KPIs |

**Ordre de merge recommande** : #41 → #44 → #42 → #43

---

## Prochaines etapes

1. **Design** — Refaire le style general (inspiration crypto dashboard dark)
2. **Deploiement Vercel** — Mettre en ligne
3. **Vue calendrier** — Afficher les reservations sur un calendrier mensuel
4. **Cmd+K recherche** — Recherche globale proprietes/reservations/depenses
5. **Export CSV** — Exporter toutes les donnees

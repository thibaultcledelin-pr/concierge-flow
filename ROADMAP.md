# Roadmap — ConciergeFlow

> État d'avancement du projet. ✅ fait · 🔧 en cours · ⏳ à venir

---

## ✅ Fondations
- Setup Next.js 16 + TypeScript + Tailwind + shadcn/ui
- Base PostgreSQL (Supabase) + Prisma 7
- Authentification (login, register, callback, déconnexion)
- Middleware de protection des routes
- Layout dashboard (sidebar, topbar, navigation mobile)
- CI GitHub Actions (tests + lint)

## ✅ Gestion des logements
- CRUD complet (création, liste, détail, édition, suppression)
- Page détail = mini-dashboard par logement
- Champs propriétaire (nom + email pour les rapports)

## ✅ Import des données
- Parser iCal (Airbnb + Booking) + détection de plateforme
- Synchronisation iCal en un clic + automatique chaque heure
- Import CSV avec matching intelligent (enrichissement des montants)
- Dédoublonnage des réservations

## ✅ Suivi financier
- Dépenses catégorisées avec filtres
- Dépenses récurrentes (hebdo / mensuel / trimestriel / annuel) + génération automatique
- Dashboard : 6 KPIs cliquables, donut occupation, comparaison mois/mois
- Graphiques : occupation, revenus vs dépenses, revenu/nuit, occupation par logement
- Sélecteur de logement (filtre tout le dashboard)
- Vue calendrier des réservations

## ✅ Rapports & alertes
- Rapports propriétaire en PDF (résumé financier, réservations, dépenses)
- Envoi des rapports par email (Resend)
- Alertes intelligentes (marge négative, occupation basse, etc.)

## ✅ Expérience utilisateur
- Onboarding wizard en 4 étapes (logement + dépenses)
- Checklist de progression sur le dashboard
- Empty states avec guidage et boutons d'action
- Page paramètres (profil, conciergerie, mot de passe, export, suppression)
- Design dark mode (palette ambre/orange)

## ✅ Sécurité & qualité
- Audit sécurité (SSRF, open redirect, fuite de données)
- Headers de sécurité HTTP (CSP, HSTS, X-Frame-Options…)
- Sanitization HTML des emails
- Filtrage des champs sensibles des réponses API
- Déconnexion automatique après 30 min + sauvegarde des brouillons
- 217 tests automatisés

---

## 🔧 En cours
- **Déploiement Vercel** + connexion Supabase production
- Validation du design en conditions réelles

## ⏳ Prochaines étapes
- Nom & logo définitifs (Voltaflow ?)
- Monétisation : page tarifs publique ✅ — branchement Stripe Checkout + webhooks à venir
- Recherche globale (Cmd+K)
- Notifications email (résumé hebdomadaire)
- Application mobile / PWA

---

## Notes techniques

| Sujet | Décision |
|-------|----------|
| Prisma 7 | Generator `prisma-client-js` + adapter `PrismaPg` |
| Occupation | Calculée sur le mois courant uniquement, plafonnée à 100 % |
| Recharts | Overrides CSS hors `@layer` pour priorité maximale |
| Déconnexion | `window.location.href` (vide le cache client) |
| Tests | Colocalisés, pas de fichiers regression séparés |

# ConciergeFlow

> Le back-office de votre conciergerie. Revenus, dépenses, rapports propriétaire — fini les tableaux Excel.

ConciergeFlow est un SaaS de suivi de rentabilité pour conciergeries Airbnb / Booking. Il centralise les réservations, les dépenses et calcule la marge nette réelle de chaque logement — sur toutes les plateformes, mois par mois.

![Stack](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tests](https://img.shields.io/badge/tests-217%20passing-green)

---

## Le problème

Les conciergeries utilisent Lodgify pour gérer les réservations, PriceLabs pour les prix — mais aucun outil ne leur dit **combien elles gagnent vraiment** par logement, net de toutes charges. La plupart bricolent sur Excel et envoient des rapports manuels à chaque propriétaire.

## La solution

ConciergeFlow réunit tout en un seul endroit :

- **Import automatique** des réservations via iCal (Airbnb + Booking), synchronisé chaque heure
- **Import CSV** des montants depuis les dashboards plateformes
- **Suivi des dépenses** catégorisées, avec récurrence automatique
- **Dashboard de rentabilité** : marge nette, occupation, RevPAR, ADR par logement
- **Rapports propriétaire** en PDF, envoyés par email en un clic
- **Alertes intelligentes** quand un logement perd de l'argent

---

## Stack technique

| Outil | Rôle |
|-------|------|
| **Next.js 16** (App Router) | Framework full-stack React |
| **TypeScript** | Typage strict de bout en bout |
| **Supabase** | Authentification + base PostgreSQL |
| **Prisma 7** | ORM (requêtes typées, anti-injection SQL) |
| **Tailwind CSS 4** | Styles utilitaires (dark mode) |
| **shadcn/ui** (Radix) | Composants UI accessibles |
| **Recharts** | Graphiques du dashboard |
| **jsPDF** | Génération des rapports PDF |
| **Resend** | Envoi d'emails transactionnels |
| **Vitest** | Tests unitaires & composants (217 tests) |

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env   # puis remplir les clés (voir ci-dessous)

# 3. Générer le client Prisma et appliquer le schéma
npx prisma generate
npx prisma db push

# 4. (Optionnel) Données de démo
npm run seed

# 5. Lancer le serveur de développement
npm run dev            # → http://localhost:3000
```

## Variables d'environnement

```env
# Supabase — obligatoire
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
DATABASE_URL=postgresql://...

# Email — optionnel (envoi des rapports propriétaire)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=ConciergeFlow <rapport@votredomaine.com>

# Cron — optionnel (sync iCal + dépenses récurrentes automatiques)
CRON_SECRET=un-secret-aleatoire
```

## Configuration Supabase

1. **Authentication → Settings** : décocher *Enable email confirmations* (dev)
2. **Authentication → URL Configuration** : Site URL `http://localhost:3000`, Redirect `http://localhost:3000/callback`
3. **Settings → Database** : copier le *Connection string* pour `DATABASE_URL`
4. **Settings → API** : copier *Project URL* et *anon public key*

---

## Scripts

```bash
npm run dev      # serveur de développement
npm run build    # build de production
npm run start    # serveur de production
npm test         # lancer les 217 tests (~25s)
npm run lint     # ESLint
npm run seed     # peupler la base avec des données de démo
```

---

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — structure technique détaillée, routes API, modèle de données
- **[ROADMAP.md](./ROADMAP.md)** — état d'avancement et prochaines étapes

---

## Déploiement

ConciergeFlow se déploie sur **Vercel** en quelques clics :

1. Importer le repo sur [vercel.com](https://vercel.com)
2. Renseigner les variables d'environnement
3. Déployer — chaque push sur `main` redéploie automatiquement

Les tâches planifiées (sync iCal horaire, dépenses récurrentes quotidiennes) sont gérées via `vercel.json`.

---

## Sécurité

- Authentification + vérification de propriété sur **toutes** les routes API
- Requêtes typées Prisma (pas d'injection SQL)
- Headers de sécurité HTTP (CSP, HSTS, X-Frame-Options…)
- Protection SSRF sur les URLs iCal, sanitization HTML des emails
- Données sensibles (URLs iCal, emails propriétaires) filtrées des réponses API
- Déconnexion automatique après 30 min d'inactivité

---

## Licence

Projet privé — © 2026 ConciergeFlow.

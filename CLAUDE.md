# CLAUDE.md — Folly OS

## Projet

Folly OS est un dashboard de productivite unifie (style Linear) qui integre 4 outils open-source via iframes + API Gateway. Usage interne mono-utilisateur.

## Stack

- **Framework** : Next.js 14 (App Router), React 18, TypeScript
- **Styling** : Tailwind CSS 3.4, shadcn/ui (Radix UI), design system dark Linear
- **State** : Zustand avec persist (localStorage)
- **Auth** : Supabase Auth
- **DB meta** : Supabase PostgreSQL (projets, mappings)
- **Deploiement dashboard** : Vercel
- **Services backend** : Oracle Cloud ARM (Coolify) — Plane, Cal.com, Docmost, Vaultwarden

## Architecture

```
Vercel (Dashboard Next.js + API Gateway)
    |
    ├── Supabase (Auth + projets + mappings)
    |
    └── Oracle Cloud (Coolify)
        ├── Plane (taches) — plane.folly-os.dev
        ├── Cal.com (calendrier) — cal.folly-os.dev
        ├── Docmost (notes) — notes.folly-os.dev
        ├── Vaultwarden (passwords) — vault.folly-os.dev
        ├── PostgreSQL 16 (partage)
        └── Redis 8
```

## Structure du code

```
src/
├── app/
│   ├── (auth)/login/page.tsx        # Page login
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Layout avec sidebar + auth guard
│   │   ├── page.tsx                 # Redirection vers projet
│   │   └── projects/[id]/
│   │       ├── page.tsx             # Vue d'ensemble projet
│   │       ├── tasks/page.tsx       # Iframe Plane
│   │       ├── calendar/page.tsx    # Iframe Cal.com
│   │       ├── notes/page.tsx       # Iframe Docmost
│   │       └── passwords/page.tsx   # Iframe Vaultwarden
│   ├── api/
│   │   ├── projects/route.ts       # CRUD projets (Supabase)
│   │   ├── tasks/route.ts          # Proxy Plane API
│   │   ├── calendar/route.ts       # Proxy Cal.com API
│   │   ├── notes/route.ts          # Proxy Docmost API
│   │   ├── vault/route.ts          # Proxy Vaultwarden API
│   │   └── health/route.ts         # Health check tous services
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx              # Sidebar projets
│   │   ├── project-header.tsx       # Header avec nom + statut + onglets
│   │   └── iframe-toolbar.tsx       # Toolbar au-dessus des iframes
│   ├── overview/
│   │   ├── stat-card.tsx            # Carte statistique
│   │   ├── widget.tsx               # Widget liste (taches, rdv, notes)
│   │   └── overview-grid.tsx        # Grille vue d'ensemble
│   ├── iframe-view.tsx              # Composant iframe reutilisable
│   └── ui/                          # shadcn/ui (ne pas modifier)
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── api/
│   │   ├── plane.ts                 # Client Plane API
│   │   ├── calcom.ts                # Client Cal.com API
│   │   ├── docmost.ts               # Client Docmost API
│   │   └── vaultwarden.ts           # Client Vaultwarden API
│   ├── store.ts                     # Zustand store (projets)
│   └── utils.ts
├── types/
│   └── index.ts                     # Types centralises
└── middleware.ts                     # Auth middleware
```

## Conventions

- **Langue UI** : francais
- **Langue code** : anglais (variables, fonctions, commentaires)
- **Design tokens** : utiliser les variables CSS du design system Linear (voir PRD.md)
- **Composants** : shadcn/ui pour tous les composants UI de base
- **API routes** : Next.js Route Handlers (app/api/), pas de pages API
- **Pas de console.log** en production, utiliser des erreurs explicites
- **Imports** : alias `@/` pour `src/`

## Commandes

```bash
npm run dev      # Dev server (localhost:3000)
npm run build    # Build production
npm run start    # Start production
```

## Variables d'environnement

Fichier `.env.local` (ne jamais commiter) :

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PLANE_BASE_URL=
PLANE_API_KEY=
CALCOM_BASE_URL=
CALCOM_API_KEY=
DOCMOST_BASE_URL=
DOCMOST_API_KEY=
VAULTWARDEN_BASE_URL=
VAULTWARDEN_ADMIN_TOKEN=
```

## Documents de reference

- `docs/PRD.md` — Product Requirements Document complet
- `docs/superpowers/plans/` — Plans d'implementation
- `mockup-dashboard.html` — Mockup visuel de reference (ouvrir dans un navigateur)
- `supabase/schema.sql` — Schema base de donnees

## Regles pour les agents

- Toujours lire le PRD avant de commencer une tache
- Toujours verifier le mockup HTML pour le rendu visuel attendu
- Utiliser les API des services (Plane, Cal.com, Docmost, Vaultwarden) via les clients dans `lib/api/`
- Ne jamais hardcoder les URLs des services — utiliser les variables d'env
- Les iframes doivent etre dynamiques : l'URL change selon le projet selectionne
- L'API Gateway doit authentifier via Supabase token ou API key

# CLAUDE.md — Folly OS v3

## Projet

Folly OS est un dashboard de productivite natif (style Linear) avec 4 modules integres : Taches/Kanban, Calendrier/RDV, Notes/Wiki, Coffre-fort Passwords. Inclut une page de booking public type Calendly. Usage interne mono-utilisateur.

## Stack

- **Framework** : Next.js 14 (App Router), React 18, TypeScript
- **Styling** : Tailwind CSS 3.4, shadcn/ui (Radix UI)
- **State** : Zustand
- **DB + Auth** : Supabase (PostgreSQL + Auth + RLS)
- **Rich text** : Tiptap
- **Drag & drop** : @dnd-kit
- **Dates** : date-fns
- **Email** : Resend
- **Chiffrement** : AES-256-GCM (crypto Node.js)
- **Deploiement** : Vercel (gratuit)

## Architecture

```
Vercel (Next.js)
├── Pages privees (auth Supabase)
│   ├── /projects — sidebar + projets
│   ├── /projects/[id] — dashboard vue d'ensemble
│   ├── /projects/[id]/tasks — kanban + liste
│   ├── /projects/[id]/calendar — mois/semaine/jour
│   ├── /projects/[id]/notes — wiki avec Tiptap
│   ├── /projects/[id]/vault — coffre-fort passwords
│   └── /settings — config booking + dispos
├── Page publique (sans auth)
│   └── /book/[slug] — booking clients
└── API Gateway
    └── /api/* — CRUD pour agents IA
```

## Conventions

- **Langue UI** : francais
- **Langue code** : anglais (variables, fonctions)
- **Design tokens** : voir PRD.md section Design System
- **Composants** : shadcn/ui pour UI de base, composants custom pour les modules
- **API routes** : Next.js Route Handlers (app/api/)
- **Imports** : alias `@/` pour `src/`
- **Pas de console.log** en production
- **Sauvegarde auto** : debounce 1s pour les notes

## Commandes

```bash
npm run dev      # Dev server
npm run build    # Build production
npm run start    # Start production
```

## Documents de reference

- `docs/PRD.md` — PRD complet avec schema DB, features, architecture
- `docs/superpowers/plans/` — Plans d'implementation
- `mockup-dashboard.html` — Mockup visuel de reference

## Regles pour les agents

- Toujours lire le PRD avant de commencer une tache
- Les mots de passe doivent etre chiffres AES-256-GCM avant stockage
- Les routes /book/* sont publiques, tout le reste est protege par auth
- L'API Gateway doit authentifier via Supabase token (sauf routes booking)
- Utiliser Supabase RLS : chaque user ne voit que ses propres donnees
- Les emails de booking sont envoyes via Resend
- Le drag & drop utilise @dnd-kit, pas react-beautiful-dnd
- L'editeur de notes utilise Tiptap, pas Slate ou Draft.js

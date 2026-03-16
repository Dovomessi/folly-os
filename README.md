# Folly OS

Dashboard de productivité professionnel style Linear - Projets, Tâches, Rendez-vous, Notes, Passwords.

## Architecture

- **Entité centrale : Le Projet**
- Sidebar avec liste des projets
- Chaque projet contient : Tâches, Rendez-vous, Notes, Passwords

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth + PostgreSQL)
- Déployé sur Vercel

## Design

Style Linear : sidebar sombre (#0F1115), accents violets (#5E6AD2), typographie Inter, dark mode natif.

## Fonctionnalités

1. **Auth Supabase** - Login/signup avec email
2. **CRUD Projets** - Créer, lire, modifier, supprimer des projets
3. **Tâches/Kanban** - Tableau type Trello par projet
4. **Rendez-vous** - Intégration calendrier par projet
5. **Notes** - Éditeur de notes par projet
6. **Passwords** - Vault chiffré par projet
7. **API** - Endpoints pour agents externes

## Développement

```bash
npm install
npm run dev
```

## Déploiement

```bash
vercel --prod
```

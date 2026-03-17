# Folly OS

Dashboard de productivite unifie style Linear. Centralise 4 outils open-source (Plane, Cal.com, Docmost, Vaultwarden) dans une interface unique organisee par projets, avec API Gateway pour agents IA.

**https://folly-os.vercel.app**

## Architecture

```
Vercel (Dashboard Next.js + API Gateway)
    |
    +-- Supabase (Auth + projets + mappings)
    |
    +-- Oracle Cloud ARM (Coolify)
        +-- Plane (taches) ........... plane.folly-os.dev
        +-- Cal.com (calendrier) ..... cal.folly-os.dev
        +-- Docmost (notes) .......... notes.folly-os.dev
        +-- Vaultwarden (passwords) .. vault.folly-os.dev
        +-- PostgreSQL 16 + Redis 8
```

## Stack technique

| Couche | Techno |
|--------|--------|
| Dashboard | Next.js 14, React 18, TypeScript, Tailwind CSS 3.4, shadcn/ui |
| State | Zustand |
| Auth + DB | Supabase (Auth + PostgreSQL) |
| Taches | [Plane](https://github.com/Dovomessi/folly-os-plane) (fork) |
| Calendrier | [Cal.com](https://github.com/calcom/cal.com) (fork) |
| Notes | [Docmost](https://github.com/Dovomessi/folly-os-notes) (fork) |
| Passwords | [Vaultwarden](https://github.com/dani-garcia/vaultwarden) |
| Infra | Oracle Cloud ARM (Coolify), Vercel |

## Fonctionnalites

- **Auth Supabase** — Login/signup email, session persistante
- **Projets** — CRUD avec couleurs, statut (actif/pause), description
- **Vue d'ensemble** — Widgets resumes par projet (taches, RDV, notes, passwords)
- **Taches** — Iframe Plane (kanban, liste, timeline) filtre par projet
- **Calendrier** — Iframe Cal.com (scheduling, event types)
- **Notes** — Iframe Docmost (wiki collaboratif, espaces par projet)
- **Passwords** — Iframe Vaultwarden (coffre-fort compatible Bitwarden)
- **API Gateway** — Proxy unifie pour agents IA (Claude, OpenClauw)
- **Design Linear** — Interface sombre, accents violets, animations fluides

## Demarrage

```bash
git clone https://github.com/Dovomessi/folly-os.git
cd folly-os
npm install
npm run dev
```

## Variables d'environnement

Creer `.env.local` :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Services (URLs des instances self-hosted)
NEXT_PUBLIC_PLANE_URL=https://plane.folly-os.dev
NEXT_PUBLIC_CALCOM_URL=https://cal.folly-os.dev
NEXT_PUBLIC_DOCMOST_URL=https://notes.folly-os.dev
NEXT_PUBLIC_VAULTWARDEN_URL=https://vault.folly-os.dev

# API Keys (server-side only)
PLANE_BASE_URL=https://plane.folly-os.dev
PLANE_API_KEY=
PLANE_WORKSPACE_SLUG=folly-os
CALCOM_BASE_URL=https://cal.folly-os.dev
CALCOM_API_KEY=
DOCMOST_BASE_URL=https://notes.folly-os.dev
DOCMOST_API_KEY=
VAULTWARDEN_BASE_URL=https://vault.folly-os.dev
VAULTWARDEN_ADMIN_TOKEN=
```

## API Gateway

Endpoints unifies pour agents IA :

| Endpoint | Methode | Proxied vers | Description |
|----------|---------|-------------|-------------|
| `/api/projects` | GET, POST | Supabase | CRUD projets |
| `/api/tasks` | GET, POST | Plane API | Work items |
| `/api/calendar` | GET, POST | Cal.com API | Bookings & event types |
| `/api/notes` | GET, POST | Docmost API | Spaces & pages |
| `/api/vault` | GET | Vaultwarden API | Vault info |
| `/api/health` | GET | Tous | Status de chaque service |

Authentification : Bearer token Supabase ou API key dans le header `Authorization`.

## Structure du projet

```
src/
+-- app/
|   +-- (dashboard)/
|   |   +-- layout.tsx              # Sidebar + auth guard
|   |   +-- projects/[id]/
|   |       +-- page.tsx            # Vue d'ensemble
|   |       +-- tasks/page.tsx      # Iframe Plane
|   |       +-- calendar/page.tsx   # Iframe Cal.com
|   |       +-- notes/page.tsx      # Iframe Docmost
|   |       +-- passwords/page.tsx  # Iframe Vaultwarden
|   +-- api/                        # API Gateway routes
+-- components/
|   +-- layout/                     # Sidebar, header, toolbar
|   +-- overview/                   # Stat cards, widgets
|   +-- ui/                         # shadcn/ui
+-- lib/
|   +-- api/                        # Clients API (Plane, Cal.com, Docmost, Vaultwarden)
|   +-- supabase/                   # Supabase client/server
|   +-- store.ts                    # Zustand store
+-- types/
    +-- index.ts                    # Types centralises
```

## Documentation

- `docs/PRD.md` — Product Requirements Document
- `docs/superpowers/plans/` — Plans d'implementation
- `mockup-dashboard.html` — Mockup visuel (ouvrir dans un navigateur)
- `CLAUDE.md` — Instructions pour agents IA
- `supabase/schema.sql` — Schema base de donnees

## Roadmap

- [x] Auth Supabase
- [x] CRUD Projets
- [x] Design system Linear
- [x] Iframes services externes
- [ ] Vue d'ensemble par projet (widgets)
- [ ] API Gateway complet
- [ ] Deploiement Oracle Cloud (Coolify)
- [ ] Mapping projets <-> services externes
- [ ] Recherche globale (Cmd+K)

## License

MIT - Folly Germain AMOUZOUVI DOVO

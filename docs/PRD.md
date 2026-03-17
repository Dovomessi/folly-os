# Folly OS — Product Requirements Document (PRD)

## Vision

Folly OS est un dashboard de productivite unifie pour usage interne. Il centralise 4 outils open-source forkes (Plane, Cal.com, Docmost, Vaultwarden) derriere une interface unique, organisee par projets, avec une API Gateway pour les agents IA (Claude, OpenClauw).

## Utilisateur cible

Folly Germain AMOUZOUVI DOVO — usage interne, mono-utilisateur.

---

## Architecture finale

```
                         INTERNET
                            |
                   ┌────────┴────────┐
                   │   Vercel (Free)  │
                   │   folly-os.app   │
                   │   Dashboard Next │
                   │   + API Gateway  │
                   └────────┬────────┘
                            |
              ┌─────────────┼─────────────┐
              |             |             |
     ┌────────┴──┐  ┌──────┴──────┐  ┌───┴────────┐
     │ Supabase  │  │ Oracle Cloud│  │ Agents IA  │
     │  (Free)   │  │  (Free ARM) │  │ Claude     │
     │  - Auth   │  │  - Coolify  │  │ OpenClauw  │
     │  - Projets│  │  - Plane    │  │ via API GW │
     │  - Meta   │  │  - Cal.com  │  └────────────┘
     └───────────┘  │  - Docmost  │
                    │  - Vaultw.  │
                    │  - PG+Redis │
                    └─────────────┘
```

## Stack finale

| Couche | Techno | Hebergement |
|--------|--------|-------------|
| Dashboard | Next.js 14, React 18, TypeScript, Tailwind, shadcn/ui, Zustand | Vercel (gratuit) |
| Auth + Meta-donnees | Supabase (Auth + PostgreSQL) | Supabase Cloud (gratuit) |
| Taches | Plane (fork) | Oracle Cloud ARM via Coolify |
| Calendrier | Cal.com (fork) | Oracle Cloud ARM via Coolify |
| Notes | Docmost (fork) | Oracle Cloud ARM via Coolify |
| Passwords | Vaultwarden | Oracle Cloud ARM via Coolify |
| Base de donnees | PostgreSQL (partage) + Redis | Oracle Cloud ARM via Coolify |
| API Gateway | Next.js API Routes (proxy) | Vercel (avec le dashboard) |

---

## Fonctionnalites

### F1 — Sidebar Projets (existant, a ameliorer)
- Liste des projets avec couleur, nom, compteur de taches
- CRUD projet (creer, editer, supprimer)
- Selection de projet change tout le contexte main
- Recherche rapide (Cmd+K)
- Indicateur de statut (Actif, En pause)

### F2 — Vue d'ensemble par projet (a creer)
Onglet par defaut quand on selectionne un projet. Affiche des widgets resumes :
- **Stat cards** : Taches ouvertes (via Plane API), RDV cette semaine (via Cal.com API), Notes (via Docmost API), Passwords (via Vaultwarden API)
- **Widget Taches recentes** : 4-5 dernieres taches avec priorite + statut
- **Widget Prochains RDV** : 3 prochains rendez-vous
- **Widget Notes recentes** : 3 dernieres notes modifiees
- Chaque widget a un lien "Voir tout" qui switch vers l'onglet correspondant

### F3 — Onglet Taches (iframe Plane)
- Toolbar : nom du service, boutons "Nouvelle tache", "Sync", "Ouvrir Plane"
- Iframe plein ecran pointant vers l'instance Plane self-hosted
- URL dynamique : `{PLANE_URL}/{workspace}/{project-id}/issues/`
- Le projet Plane correspond au projet Folly OS selectionne

### F4 — Onglet Calendrier (iframe Cal.com)
- Toolbar : nom du service, boutons "Nouveau RDV", "Sync", "Ouvrir Cal.com"
- Iframe plein ecran pointant vers l'instance Cal.com self-hosted
- URL dynamique basee sur le event-type lie au projet

### F5 — Onglet Notes (iframe Docmost)
- Toolbar : nom du service, boutons "Nouvelle note", "Sync", "Ouvrir Docmost"
- Iframe plein ecran pointant vers l'instance Docmost self-hosted
- URL dynamique : `{DOCMOST_URL}/s/{space-slug}` (1 space Docmost = 1 projet Folly OS)

### F6 — Onglet Passwords (iframe Vaultwarden)
- Toolbar : nom du service, boutons "Ajouter", "Generer", "Ouvrir Vaultwarden"
- Iframe plein ecran pointant vers l'instance Vaultwarden
- Vaultwarden web vault embarque

### F7 — API Gateway (a creer)
Proxy API dans Next.js Route Handlers. Un seul endpoint unifie pour agents IA.

| Route | Methode | Proxied vers | Description |
|-------|---------|-------------|-------------|
| `/api/projects` | GET, POST | Supabase | CRUD projets |
| `/api/projects/[id]` | GET, PUT, DELETE | Supabase | Projet specifique |
| `/api/tasks` | GET, POST | Plane API | Taches (work-items) |
| `/api/tasks/[id]` | GET, PUT, DELETE | Plane API | Tache specifique |
| `/api/calendar/event-types` | GET | Cal.com API | Types d'evenements |
| `/api/calendar/bookings` | GET, POST | Cal.com API | Reservations |
| `/api/notes/spaces` | GET | Docmost API | Espaces/projets |
| `/api/notes/pages` | GET, POST | Docmost API | Pages/notes |
| `/api/vault/items` | GET | Vaultwarden API | Entrees du coffre |
| `/api/health` | GET | Tous | Status de chaque service |

Auth : Chaque requete doit inclure un Bearer token Supabase ou une API key.

### F8 — Mapping Projet <-> Services
Table Supabase `project_service_mapping` :

```sql
CREATE TABLE project_service_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  service TEXT NOT NULL CHECK (service IN ('plane', 'calcom', 'docmost', 'vaultwarden')),
  external_id TEXT NOT NULL,  -- ID du projet/space/calendar dans le service externe
  external_slug TEXT,         -- slug pour les URLs
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, service)
);
```

---

## Design System (Style Linear)

Reference : `mockup-dashboard.html`

| Token | Valeur | Usage |
|-------|--------|-------|
| `--bg` | `#0F1115` | Fond principal |
| `--card` | `#161922` | Cartes, sidebar |
| `--popover` | `#1F232E` | Menus, headers |
| `--primary` | `#5E6AD2` | Accents, boutons |
| `--border` | `#2A2D37` | Bordures |
| `--text` | `#F7F8F8` | Texte principal |
| `--text-secondary` | `#8A8F98` | Texte secondaire |
| `--danger` | `#E5484D` | Urgent, erreur |
| `--success` | `#46A758` | Succes, done |
| `--warning` | `#F5A623` | En cours, attention |

---

## Infrastructure Oracle Cloud

### VM Always Free
- **Type** : ARM Ampere A1
- **Specs** : 4 OCPU, 24 GB RAM, 200 GB stockage
- **OS** : Ubuntu 22.04
- **PaaS** : Coolify (auto-deploiement Docker)

### Services deployes sur Coolify

| Service | Image Docker | RAM | Ports |
|---------|-------------|-----|-------|
| Plane | `makeplane/plane-*` | ~4 GB | 3000 |
| Cal.com | `calcom/cal.com` | ~2 GB | 3100 |
| Docmost | `docmost/docmost` | ~2 GB | 3200 |
| Vaultwarden | `vaultwarden/server` | ~512 MB | 3300 |
| PostgreSQL 16 | `postgres:16` | ~2 GB | 5432 |
| Redis 8 | `redis:8` | ~512 MB | 6379 |
| Coolify | built-in | ~1 GB | 8000 |
| **Total** | | **~12 GB / 24 GB** | |

### Domaines (via Coolify + Nginx)
- `plane.folly-os.dev`
- `cal.folly-os.dev`
- `notes.folly-os.dev`
- `vault.folly-os.dev`
- SSL via Let's Encrypt (automatique Coolify)

---

## Variables d'environnement requises

### Dashboard (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

PLANE_BASE_URL=https://plane.folly-os.dev
PLANE_API_KEY=

CALCOM_BASE_URL=https://cal.folly-os.dev
CALCOM_API_KEY=

DOCMOST_BASE_URL=https://notes.folly-os.dev
DOCMOST_API_KEY=

VAULTWARDEN_BASE_URL=https://vault.folly-os.dev
VAULTWARDEN_ADMIN_TOKEN=
```

---

## Hors scope (v1)

- Multi-utilisateur / equipes
- Drag & drop kanban natif (utilise celui de Plane)
- Mode offline
- Notifications push
- Chiffrement E2E des passwords dans le dashboard (Vaultwarden gere ca)
- Migration depuis les anciens forks (Padloc, Someday)

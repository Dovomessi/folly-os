# Folly OS v3 — Product Requirements Document

## Vision

Folly OS est un dashboard de productivite professionnel natif pour usage interne. Il regroupe 4 outils (Taches, Calendrier, Notes, Coffre-fort) dans une seule app, avec une page de booking public type Calendly pour les clients.

## Utilisateur cible

Folly Germain AMOUZOUVI DOVO — usage interne, mono-utilisateur. La page de booking est publique pour les clients.

## Principes

- **Zero service externe** : tout est dans Next.js + Supabase
- **Un seul login** : Supabase Auth
- **Design professionnel** : style Linear, dark theme, animations fluides
- **Cout 0 euros** : Vercel free + Supabase free
- **API pour agents IA** : Claude / OpenClauw peuvent interagir via l'API Gateway

---

## Architecture

```
folly-os.vercel.app (Next.js 14 + Supabase)
│
├── Auth (Supabase)           1 seul login
├── DB (Supabase PostgreSQL)  Toutes les donnees
│
├── /projects                 Sidebar + liste projets
├── /projects/[id]            Dashboard vue d'ensemble
├── /projects/[id]/tasks      Kanban drag & drop + vue liste
├── /projects/[id]/calendar   Calendrier mois/semaine/jour
├── /projects/[id]/notes      Wiki/notes editeur rich text
├── /projects/[id]/vault      Coffre-fort mots de passe
│
├── /book/[slug]              Page publique Calendly-like
│                             (clients reservent sans compte)
│
└── /api/*                    API Gateway pour agents IA
```

## Stack technique

| Couche | Techno |
|--------|--------|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 3.4, shadcn/ui (Radix UI) |
| State | Zustand (projets selectionnes, UI state) |
| DB + Auth | Supabase (PostgreSQL + Auth + RLS + Realtime) |
| Rich text editor | Tiptap (extensible, Markdown-compatible) |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable |
| Calendrier | date-fns (manipulation dates) + composants custom |
| Email | Resend (confirmation RDV booking) |
| Chiffrement vault | AES-256-GCM via crypto Node.js natif |
| Icons | Lucide React |
| Deploiement | Vercel (gratuit) |

---

## Fonctionnalites detaillees

### F1 — Sidebar & Projets

- Logo "Folly OS" + champ recherche (Cmd+K)
- Navigation rapide : Vue d'ensemble, Parametres
- Liste des projets avec :
  - Dot couleur personnalisable
  - Nom du projet
  - Compteur de taches ouvertes
  - Menu contextuel (modifier, supprimer)
- CRUD projet (nom, description, couleur, statut actif/pause/archive)
- Bouton "+ Nouveau Projet" en bas (bordure dashed)
- Profil utilisateur + bouton deconnexion
- Selection d'un projet change le contexte main (routing URL)

### F2 — Dashboard Vue d'ensemble

Onglet par defaut quand on selectionne un projet.

**4 stat cards :**
- Taches ouvertes (nombre + combien urgentes)
- RDV cette semaine (nombre + prochain RDV)
- Notes (nombre + combien modifiees aujourd'hui)
- Mots de passe (nombre + alerte si mots de passe faibles)

**Widget Taches recentes :**
- 5 dernieres taches avec dot priorite (couleur) + statut
- Lien "Voir tout" vers l'onglet Taches

**Widget Prochains RDV :**
- 3 prochains rendez-vous avec date/heure
- Lien "Voir tout" vers l'onglet Calendrier

**Widget Notes recentes :**
- 3 dernieres notes modifiees avec timestamp
- Lien "Voir tout" vers l'onglet Notes

**Widget Activite recente :**
- Timeline des 5 dernieres actions (tache creee, note modifiee, RDV reserve...)

### F3 — Taches / Kanban

**Vue Kanban (defaut) :**
- Colonnes : A faire, En cours, En revue, Termine
- Colonnes custom (creer, renommer, supprimer, reordonner)
- Drag & drop entre colonnes + reordonner dans une colonne
- Carte tache : titre, priorite (dot couleur), labels, date echeance, avatar

**Vue Liste :**
- Tableau avec colonnes : Titre, Statut, Priorite, Echeance, Labels
- Triable par chaque colonne
- Filtrable par priorite, statut, label

**Tache (detail modal/panel) :**
- Titre (editable inline)
- Description rich text (Tiptap)
- Statut : A faire / En cours / En revue / Termine
- Priorite : Urgent (rouge), Haute (orange), Moyenne (jaune), Basse (vert)
- Date d'echeance (date picker)
- Labels/tags (couleur + nom, creer a la volee)
- Sous-taches (checklist avec progression %)
- Commentaires (fil de discussion)
- Timestamps : cree le, modifie le

**Actions rapides :**
- Creer tache via bouton ou raccourci (Cmd+N)
- Supprimer tache (confirmation)
- Dupliquer tache
- Deplacer vers un autre projet

### F4 — Calendrier / RDV

**3 vues :**
- **Mois** : Grille calendrier, dots colores sur les jours avec RDV
- **Semaine** : Timeline heure par heure (7h-22h), blocs colores
- **Jour** : Detail heure par heure d'une journee

**Rendez-vous (detail) :**
- Titre
- Date + heure debut / fin
- Description
- Couleur (par type)
- Type : Reunion, Call, Demo, Personnel, Autre
- Invites : nom + email du client (si booking)
- Rappel : 15min, 30min, 1h, 1 jour avant (notification dans l'app)
- Statut : Confirme, En attente, Annule
- Lien vers le projet associe

**Actions :**
- Creer RDV en cliquant sur un creneau vide
- Drag & drop pour deplacer un RDV
- Resize pour changer la duree
- Filtrer par type, projet

### F5 — Booking Public (type Calendly)

Page publique accessible sans connexion : `/book/[slug]`

**Configuration (cote admin dans Parametres) :**
- Types d'evenement :
  - Nom (ex: "Call decouverte")
  - Slug URL (ex: "call-decouverte")
  - Duree (15, 30, 45, 60 min)
  - Couleur
  - Description
  - Actif/inactif
- Disponibilites :
  - Jours de la semaine actifs (ex: lun-ven)
  - Horaires par jour (ex: 9h-12h, 14h-18h)
  - Jours bloques (vacances, fermetures)
- Buffer entre RDV (ex: 15 min entre chaque)
- Delai minimum de reservation (ex: 2h a l'avance)
- Jours maximum a l'avance (ex: 30 jours)

**Page publique (cote client) :**
- Photo + nom + bio du professionnel
- Liste des types d'evenement disponibles
- Selecteur de date (calendrier)
- Creneaux disponibles (calcules en temps reel depuis les dispos - les RDV existants)
- Formulaire : nom, email, telephone (optionnel), notes
- Confirmation instantanee + email envoye au client et au pro

**Emails (via Resend) :**
- Confirmation au client : "Votre RDV est confirme le [date] a [heure]"
- Notification au pro : "Nouveau RDV reserve par [nom] le [date]"
- Rappel au client : 1h avant le RDV (optionnel, phase 2)

### F6 — Notes / Wiki

**Liste des notes :**
- Grille de cartes ou vue liste
- Tri par date de modification, titre, favori
- Recherche full-text dans le titre et le contenu
- Notes epinglees en haut (favoris)

**Editeur de note :**
- Titre editable
- Editeur rich text Tiptap :
  - Titres (H1, H2, H3)
  - Gras, italique, souligne, barre
  - Listes a puces et numerotees
  - Blocs de code (avec syntax highlighting)
  - Liens
  - Separateurs
  - Citations (blockquote)
  - Tableaux
- Sauvegarde automatique (debounce 1s)
- Compteur de mots/caracteres
- Export Markdown

**Templates :**
- Notes de reunion (titre, participants, points, actions)
- Specs techniques (contexte, objectifs, architecture, taches)
- Template vide

### F7 — Coffre-fort Mots de passe

**Liste :**
- Recherche instantanee par nom de service
- Filtres par categorie (Pro, Perso, API Keys, Crypto)
- Tri par nom, date de creation

**Entree :**
- Nom du service (ex: "GitHub")
- URL du site
- Nom d'utilisateur / email
- Mot de passe (chiffre AES-256-GCM en DB)
- Notes supplementaires
- Categorie
- Favicon automatique (via `https://www.google.com/s2/favicons?domain=...`)

**Actions :**
- Copier username (1 clic, notification "Copie !")
- Copier password (1 clic, masque apres copie)
- Show/Hide password (toggle oeil)
- Generateur de mot de passe :
  - Longueur (8-64 caracteres, slider)
  - Options : majuscules, minuscules, chiffres, symboles
  - Indicateur de force (faible/moyen/fort/tres fort)
  - Copier le mot de passe genere
- Modifier / Supprimer entree

**Securite :**
- Mots de passe chiffres AES-256-GCM cote serveur avant stockage
- Cle de chiffrement dans variable d'env (VAULT_ENCRYPTION_KEY)
- RLS Supabase : chaque user ne voit que ses propres entrees
- Jamais de mot de passe en clair dans les logs ou l'API

### F8 — API Gateway (pour agents IA)

| Route | Methode | Description |
|-------|---------|-------------|
| `/api/projects` | GET, POST | CRUD projets |
| `/api/projects/[id]` | GET, PUT, DELETE | Projet specifique |
| `/api/tasks` | GET, POST | Taches (filtrable par project_id) |
| `/api/tasks/[id]` | GET, PUT, DELETE | Tache specifique |
| `/api/appointments` | GET, POST | RDV (filtrable par project_id) |
| `/api/appointments/[id]` | GET, PUT, DELETE | RDV specifique |
| `/api/notes` | GET, POST | Notes (filtrable par project_id) |
| `/api/notes/[id]` | GET, PUT, DELETE | Note specifique |
| `/api/vault` | GET, POST | Entrees vault (passwords decryptes) |
| `/api/vault/[id]` | GET, PUT, DELETE | Entree vault specifique |
| `/api/booking/availability` | GET | Creneaux dispo (public) |
| `/api/booking/reserve` | POST | Reserver un creneau (public) |
| `/api/health` | GET | Status de l'app |

Auth : Bearer token Supabase pour les routes privees. Routes booking publiques (pas de token).

---

## Schema DB Supabase

```sql
-- ============================================
-- PROJETS
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#5E6AD2',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================
-- TACHES
-- ============================================
CREATE TABLE task_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  position INT NOT NULL DEFAULT 0,
  column_id UUID REFERENCES task_columns(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  labels TEXT[] DEFAULT '{}',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  position INT NOT NULL DEFAULT 0,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================
-- CALENDRIER / RDV
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  color TEXT DEFAULT '#5E6AD2',
  type TEXT DEFAULT 'meeting' CHECK (type IN ('meeting', 'call', 'demo', 'personal', 'other')),
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================
-- BOOKING PUBLIC
-- ============================================
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  duration_minutes INT NOT NULL DEFAULT 30,
  color TEXT DEFAULT '#5E6AD2',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  buffer_minutes INT DEFAULT 0,
  min_notice_hours INT DEFAULT 2,
  max_days_advance INT DEFAULT 30,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE availabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(user_id, day_of_week, start_time)
);

CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  reason TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE booking_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  timezone TEXT DEFAULT 'Europe/Paris',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE
);

-- ============================================
-- NOTES
-- ============================================
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Sans titre',
  content TEXT DEFAULT '',
  content_html TEXT DEFAULT '',
  is_pinned BOOLEAN DEFAULT false,
  template TEXT,
  word_count INT DEFAULT 0,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================
-- COFFRE-FORT
-- ============================================
CREATE TABLE vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT,
  username TEXT,
  encrypted_password TEXT NOT NULL,
  notes TEXT,
  category TEXT DEFAULT 'pro' CHECK (category IN ('pro', 'personal', 'api_keys', 'crypto', 'other')),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================
-- ACTIVITE
-- ============================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_title TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

## Design System (Style Linear)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--bg` | `#0F1115` | Fond principal |
| `--card` | `#161922` | Cartes, sidebar, panels |
| `--popover` | `#1F232E` | Menus, dropdowns, modales |
| `--primary` | `#5E6AD2` | Accents, boutons, liens actifs |
| `--primary-hover` | `#4F5BC7` | Hover boutons |
| `--border` | `#2A2D37` | Bordures |
| `--text` | `#F7F8F8` | Texte principal |
| `--text-secondary` | `#8A8F98` | Texte secondaire |
| `--text-muted` | `#555A65` | Texte discret |
| `--danger` | `#E5484D` | Urgent, erreur, supprimer |
| `--success` | `#46A758` | Succes, termine, en ligne |
| `--warning` | `#F5A623` | En cours, attention |

## Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Vault encryption
VAULT_ENCRYPTION_KEY=  # 32 bytes hex, genere avec: openssl rand -hex 32

# Resend (emails booking)
RESEND_API_KEY=
RESEND_FROM_EMAIL=rdv@ton-domaine.fr

# Booking
NEXT_PUBLIC_BOOKING_BASE_URL=https://folly-os.vercel.app/book
```

## Dependances a installer

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install @tiptap/extension-link @tiptap/extension-code-block-lowlight
npm install @tiptap/extension-table @tiptap/extension-table-row
npm install @tiptap/extension-table-cell @tiptap/extension-table-header
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install resend
npm install date-fns
```

## Structure du code

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Vue d'ensemble
│   │   │       ├── tasks/page.tsx        # Kanban + liste
│   │   │       ├── calendar/page.tsx     # Calendrier
│   │   │       ├── notes/page.tsx        # Notes
│   │   │       ├── notes/[noteId]/page.tsx  # Editeur note
│   │   │       └── vault/page.tsx        # Coffre-fort
│   │   └── settings/
│   │       ├── page.tsx                  # General
│   │       ├── booking/page.tsx          # Config booking
│   │       └── availability/page.tsx     # Horaires
│   ├── book/
│   │   ├── [slug]/page.tsx              # Page publique booking
│   │   └── [slug]/confirm/page.tsx      # Confirmation
│   ├── api/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── appointments/
│   │   ├── notes/
│   │   ├── vault/
│   │   ├── booking/
│   │   │   ├── availability/route.ts
│   │   │   └── reserve/route.ts
│   │   ├── email/route.ts
│   │   └── health/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── project-header.tsx
│   │   └── command-palette.tsx
│   ├── tasks/
│   │   ├── kanban-board.tsx
│   │   ├── kanban-column.tsx
│   │   ├── task-card.tsx
│   │   ├── task-detail.tsx
│   │   ├── task-list-view.tsx
│   │   └── subtask-list.tsx
│   ├── calendar/
│   │   ├── calendar-month.tsx
│   │   ├── calendar-week.tsx
│   │   ├── calendar-day.tsx
│   │   ├── appointment-form.tsx
│   │   └── time-slot.tsx
│   ├── notes/
│   │   ├── note-list.tsx
│   │   ├── note-editor.tsx
│   │   └── note-card.tsx
│   ├── vault/
│   │   ├── vault-list.tsx
│   │   ├── vault-item.tsx
│   │   ├── vault-form.tsx
│   │   └── password-generator.tsx
│   ├── booking/
│   │   ├── booking-page.tsx
│   │   ├── date-picker.tsx
│   │   ├── time-slots.tsx
│   │   └── booking-form.tsx
│   ├── overview/
│   │   ├── stat-card.tsx
│   │   ├── widget.tsx
│   │   └── activity-feed.tsx
│   └── ui/                            # shadcn/ui
├── lib/
│   ├── supabase/
│   ├── encryption.ts                  # AES-256-GCM
│   ├── booking.ts                     # Calcul creneaux dispo
│   ├── email.ts                       # Templates Resend
│   ├── store.ts                       # Zustand
│   └── utils.ts
└── types/
    └── index.ts
```

## Hors scope v1

- Multi-utilisateur / equipes
- Sync Google Calendar (phase 2)
- Notifications push navigateur
- App mobile
- Import/export CSV
- Integrations tierces (Slack, Discord)
- Rappels email automatiques avant RDV (phase 2)

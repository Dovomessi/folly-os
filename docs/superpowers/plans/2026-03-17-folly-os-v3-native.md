# Folly OS v3 — Plan d'implementation natif

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer les 4 services externes (Plane, Docmost, Vaultwarden, Cal.com) par des modules natifs dans l'app Next.js, avec booking public type Calendly.

**Architecture:** App monolithique Next.js 14 + Supabase. Tous les modules (taches, calendrier, notes, vault, booking) sont des composants React avec persistence Supabase. Zero service externe.

**Tech Stack:** Next.js 14, TypeScript, Tailwind, shadcn/ui, Tiptap, @dnd-kit, date-fns, Resend, Supabase.

**Reference:** `docs/PRD.md` pour les specs detaillees, `mockup-dashboard.html` pour le design.

---

## Phase 1 : Fondations (nettoyage + DB + types)

### Task 1: Nettoyer le code iframe

**Objectif:** Supprimer tout le code lie aux services externes (iframes, proxy, clients API).

**Files a supprimer:**
- `src/app/api/proxy/[...path]/route.ts`
- `src/lib/api/plane.ts`
- `src/lib/api/calcom.ts`
- `src/lib/api/docmost.ts`
- `src/lib/api/vaultwarden.ts`

**Files a modifier:**
- `src/app/api/health/route.ts` — Simplifier (juste retourner {status: "ok"})
- `src/app/(dashboard)/projects/[id]/tasks/page.tsx` — Vider, sera refait
- `src/app/(dashboard)/projects/[id]/calendar/page.tsx` — Vider, sera refait
- `src/app/(dashboard)/projects/[id]/notes/page.tsx` — Vider, sera refait
- `src/app/(dashboard)/projects/[id]/passwords/page.tsx` — Vider, sera refait
- `src/components/iframe-view.tsx` — Supprimer
- `src/components/layout/iframe-toolbar.tsx` — Supprimer
- `.env.local` — Retirer les vars Plane/Docmost/Vaultwarden/Cal.com

### Task 2: Migration DB Supabase

**Objectif:** Creer toutes les tables du schema v3.

**File:** `supabase/migrations/002_v3_native_schema.sql`

Tables a creer : task_columns, tasks, subtasks, task_comments, appointments, event_types, availabilities, blocked_dates, booking_profile, notes (update), vault_items, activity_log.

Executer via Supabase MCP tool `apply_migration`.

### Task 3: Types TypeScript centralises

**File:** `src/types/index.ts`

Definir tous les types correspondant au schema DB.

### Task 4: Installer les dependances

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-link @tiptap/extension-code-block-lowlight @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities resend date-fns lowlight
```

### Task 5: Utilitaires (encryption, booking, email)

**Files:**
- `src/lib/encryption.ts` — AES-256-GCM encrypt/decrypt
- `src/lib/booking.ts` — Calcul des creneaux disponibles
- `src/lib/email.ts` — Templates email Resend

---

## Phase 2 : Module Taches / Kanban

### Task 6: Composants Kanban

**Files:**
- `src/components/tasks/kanban-board.tsx` — Board avec colonnes drag & drop
- `src/components/tasks/kanban-column.tsx` — Colonne avec liste de taches
- `src/components/tasks/task-card.tsx` — Carte tache (titre, priorite, labels, echeance)
- `src/components/tasks/task-detail.tsx` — Panel/modal detail tache (description Tiptap, sous-taches, commentaires)
- `src/components/tasks/task-list-view.tsx` — Vue tableau triable/filtrable
- `src/components/tasks/subtask-list.tsx` — Checklist sous-taches

### Task 7: API routes taches

**Files:**
- `src/app/api/tasks/route.ts` — GET (list) + POST (create)
- `src/app/api/tasks/[id]/route.ts` — GET + PUT + DELETE

### Task 8: Page taches

**File:** `src/app/(dashboard)/projects/[id]/tasks/page.tsx`

Toggle entre vue Kanban et vue Liste. Bouton creer tache. Filtres.

---

## Phase 3 : Module Calendrier / RDV

### Task 9: Composants calendrier

**Files:**
- `src/components/calendar/calendar-month.tsx` — Grille mensuelle
- `src/components/calendar/calendar-week.tsx` — Vue semaine timeline
- `src/components/calendar/calendar-day.tsx` — Vue jour
- `src/components/calendar/appointment-form.tsx` — Modal creer/editer RDV
- `src/components/calendar/time-slot.tsx` — Bloc horaire visuel

### Task 10: API routes RDV

**Files:**
- `src/app/api/appointments/route.ts` — GET + POST
- `src/app/api/appointments/[id]/route.ts` — GET + PUT + DELETE

### Task 11: Page calendrier

**File:** `src/app/(dashboard)/projects/[id]/calendar/page.tsx`

Selecteur de vue (Mois/Semaine/Jour). Navigation date. Creer RDV en cliquant sur creneau.

---

## Phase 4 : Module Notes / Wiki

### Task 12: Composants notes

**Files:**
- `src/components/notes/note-list.tsx` — Liste/grille de notes
- `src/components/notes/note-card.tsx` — Carte note (titre, apercu, date)
- `src/components/notes/note-editor.tsx` — Editeur Tiptap complet

### Task 13: API routes notes

**Files:**
- `src/app/api/notes/route.ts` — GET + POST
- `src/app/api/notes/[id]/route.ts` — GET + PUT + DELETE

### Task 14: Pages notes

**Files:**
- `src/app/(dashboard)/projects/[id]/notes/page.tsx` — Liste des notes
- `src/app/(dashboard)/projects/[id]/notes/[noteId]/page.tsx` — Editeur note

---

## Phase 5 : Module Coffre-fort

### Task 15: Composants vault

**Files:**
- `src/components/vault/vault-list.tsx` — Liste des entrees
- `src/components/vault/vault-item.tsx` — Ligne entree (nom, url, copy, show/hide)
- `src/components/vault/vault-form.tsx` — Modal creer/editer
- `src/components/vault/password-generator.tsx` — Generateur avec options

### Task 16: API routes vault

**Files:**
- `src/app/api/vault/route.ts` — GET + POST (chiffrement)
- `src/app/api/vault/[id]/route.ts` — GET + PUT + DELETE

### Task 17: Page vault

**File:** `src/app/(dashboard)/projects/[id]/vault/page.tsx`

Recherche, filtres par categorie, liste avec actions rapides.

---

## Phase 6 : Booking Public (Calendly-like)

### Task 18: Config booking (admin)

**Files:**
- `src/app/(dashboard)/settings/page.tsx` — Page settings generale
- `src/app/(dashboard)/settings/booking/page.tsx` — Config event types
- `src/app/(dashboard)/settings/availability/page.tsx` — Config horaires

### Task 19: Page publique booking

**Files:**
- `src/app/book/[slug]/page.tsx` — Page publique (pas d'auth)
- `src/app/book/[slug]/confirm/page.tsx` — Confirmation apres reservation
- `src/components/booking/booking-page.tsx` — Layout page booking
- `src/components/booking/date-picker.tsx` — Selecteur de date
- `src/components/booking/time-slots.tsx` — Creneaux disponibles
- `src/components/booking/booking-form.tsx` — Formulaire reservation

### Task 20: API booking

**Files:**
- `src/app/api/booking/availability/route.ts` — GET creneaux dispo (public)
- `src/app/api/booking/reserve/route.ts` — POST reserver (public)
- `src/app/api/email/route.ts` — Envoi emails via Resend

---

## Phase 7 : Dashboard Vue d'ensemble + Polish

### Task 21: Vue d'ensemble enrichie

**File:** `src/app/(dashboard)/projects/[id]/page.tsx`

Mettre a jour avec des donnees reelles depuis Supabase (stats, widgets).

### Task 22: Widget activite

**Files:**
- `src/components/overview/activity-feed.tsx` — Timeline activite recente

### Task 23: Sidebar compteurs

**File:** `src/components/sidebar.tsx`

Compteur de taches ouvertes par projet (query Supabase).

### Task 24: API projects complete

**Files:**
- `src/app/api/projects/route.ts` — Ameliorer avec stats
- `src/app/api/projects/[id]/route.ts` — GET + PUT + DELETE

### Task 25: README + build final + deploiement

- Mettre a jour README.md
- Build production
- Push GitHub
- Verifier deploiement Vercel

---

## Ordre d'execution

```
Phase 1 (Fondations)     → Tasks 1-5    → Prerequis pour tout
Phase 2 (Taches)         → Tasks 6-8    → Module le plus complexe
Phase 3 (Calendrier)     → Tasks 9-11   → Depend de Phase 1
Phase 4 (Notes)          → Tasks 12-14  → Independant
Phase 5 (Vault)          → Tasks 15-17  → Independant
Phase 6 (Booking)        → Tasks 18-20  → Depend de Phase 3 (calendrier)
Phase 7 (Polish)         → Tasks 21-25  → Depend de tout
```

Phases 2, 3, 4, 5 peuvent etre parallelisees par des agents independants.

## Credentials necessaires avant de commencer

- [ ] Supabase URL + keys (deja configures)
- [ ] VAULT_ENCRYPTION_KEY : `openssl rand -hex 32`
- [ ] Resend API key : creer compte sur resend.com
- [ ] RESEND_FROM_EMAIL : email d'envoi (ex: rdv@lexanova.fr)

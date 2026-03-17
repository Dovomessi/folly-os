# Folly OS Dashboard v2 — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer le dashboard Folly OS en hub de productivite unifie avec vue d'ensemble par projet, iframes dynamiques (Plane, Cal.com, Docmost, Vaultwarden), et API Gateway pour agents IA.

**Architecture:** Dashboard Next.js 14 sur Vercel. Auth et meta-donnees dans Supabase. 4 services self-hosted sur Oracle Cloud (Coolify). API Gateway en Next.js Route Handlers qui proxifie les requetes vers chaque service. Les iframes chargent les UIs natives des forks, filtrees par projet.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Supabase, Plane API, Cal.com API, Docmost API, Vaultwarden API.

**Reference visuelle:** `mockup-dashboard.html` (ouvrir dans un navigateur pour voir le rendu)
**PRD complet:** `docs/PRD.md`

---

## File Structure

### Files to create
- `src/types/index.ts` — Types centralises
- `src/app/(dashboard)/layout.tsx` — Layout dashboard avec sidebar + auth guard
- `src/app/(dashboard)/page.tsx` — Redirection page d'accueil
- `src/app/(dashboard)/projects/[id]/page.tsx` — Vue d'ensemble projet
- `src/app/(dashboard)/projects/[id]/tasks/page.tsx` — Iframe Plane
- `src/app/(dashboard)/projects/[id]/calendar/page.tsx` — Iframe Cal.com
- `src/app/(dashboard)/projects/[id]/notes/page.tsx` — Iframe Docmost
- `src/app/(dashboard)/projects/[id]/passwords/page.tsx` — Iframe Vaultwarden
- `src/components/layout/project-header.tsx` — Header projet avec onglets
- `src/components/layout/iframe-toolbar.tsx` — Toolbar au-dessus des iframes
- `src/components/overview/stat-card.tsx` — Carte statistique
- `src/components/overview/widget.tsx` — Widget liste generique
- `src/components/overview/overview-grid.tsx` — Grille vue d'ensemble
- `src/lib/api/plane.ts` — Client Plane API
- `src/lib/api/calcom.ts` — Client Cal.com API
- `src/lib/api/docmost.ts` — Client Docmost API
- `src/lib/api/vaultwarden.ts` — Client Vaultwarden API
- `src/app/api/projects/route.ts` — API projects
- `src/app/api/projects/[id]/route.ts` — API project by ID
- `src/app/api/tasks/route.ts` — API proxy Plane
- `src/app/api/calendar/route.ts` — API proxy Cal.com
- `src/app/api/notes/route.ts` — API proxy Docmost
- `src/app/api/vault/route.ts` — API proxy Vaultwarden
- `src/app/api/health/route.ts` — Health check
- `supabase/migrations/001_project_service_mapping.sql` — Table mapping

### Files to modify
- `src/app/page.tsx` — Simplifier en redirection
- `src/components/sidebar.tsx` — Ajouter nav links, search, compteurs via API
- `src/lib/store.ts` — Simplifier (garder que projets + selectedProjectId)
- `src/app/layout.tsx` — Ajuster metadata
- `src/components/iframe-view.tsx` — Ajouter loading state, error boundary

### Files to delete
- `src/components/kanban-board.tsx` — Remplace par Plane
- `src/components/calendar-view.tsx` — Remplace par Cal.com
- `src/components/notes-view.tsx` — Remplace par Docmost
- `src/components/passwords-view.tsx` — Remplace par Vaultwarden

---

## Chunk 1: Fondations — Types, Store, et Structure

### Task 1: Types centralises

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Creer le fichier de types**

```typescript
// src/types/index.ts

export interface Project {
  id: string
  name: string
  description: string | null
  color: string
  status: 'active' | 'paused' | 'archived'
  created_at: string
  updated_at: string
}

export interface ProjectServiceMapping {
  id: string
  project_id: string
  service: 'plane' | 'calcom' | 'docmost' | 'vaultwarden'
  external_id: string
  external_slug: string | null
}

export interface ServiceConfig {
  name: string
  label: string
  baseUrl: string
  icon: string
}

// API Gateway types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface HealthStatus {
  service: string
  status: 'up' | 'down'
  latency_ms: number
}

// Overview widget types
export interface StatCard {
  label: string
  value: number
  sub: string
}

export interface WidgetItem {
  id: string
  title: string
  meta: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: string
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add centralized type definitions"
```

---

### Task 2: Simplifier le store Zustand

**Files:**
- Modify: `src/lib/store.ts`

- [ ] **Step 1: Reduire le store aux projets uniquement**

Le store ne gere plus tasks/appointments/notes/passwords (c'est dans les services externes).

```typescript
// src/lib/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project } from '@/types'

interface StoreState {
  projects: Project[]
  selectedProjectId: string | null
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  selectProject: (id: string | null) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      projects: [],
      selectedProjectId: null,
      setProjects: (projects) => set({ projects }),
      addProject: (project) => set((state) => ({
        projects: [...state.projects, project]
      })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
        ),
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
      })),
      selectProject: (id) => set({ selectedProjectId: id }),
    }),
    { name: 'folly-os-storage' }
  )
)
```

- [ ] **Step 2: Verifier que le build passe**

Run: `npm run build`
Expected: Build succeeds (des warnings sont OK si des composants importent les anciens types)

- [ ] **Step 3: Commit**

```bash
git add src/lib/store.ts
git commit -m "refactor: simplify store to projects only"
```

---

### Task 3: Migration SQL — table project_service_mapping

**Files:**
- Create: `supabase/migrations/001_project_service_mapping.sql`

- [ ] **Step 1: Creer le fichier de migration**

```sql
-- Ajouter colonne status aux projets
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
  CHECK (status IN ('active', 'paused', 'archived'));

-- Table de mapping projet <-> service externe
CREATE TABLE IF NOT EXISTS project_service_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  service TEXT NOT NULL CHECK (service IN ('plane', 'calcom', 'docmost', 'vaultwarden')),
  external_id TEXT NOT NULL,
  external_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, service)
);

-- RLS
ALTER TABLE project_service_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own mappings" ON project_service_mapping
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Index
CREATE INDEX idx_mapping_project_id ON project_service_mapping(project_id);
CREATE INDEX idx_mapping_service ON project_service_mapping(service);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/001_project_service_mapping.sql
git commit -m "feat: add project_service_mapping table and status column"
```

---

### Task 4: Supprimer les composants obsoletes

**Files:**
- Delete: `src/components/kanban-board.tsx`
- Delete: `src/components/calendar-view.tsx`
- Delete: `src/components/notes-view.tsx`
- Delete: `src/components/passwords-view.tsx`

- [ ] **Step 1: Supprimer les fichiers**

```bash
rm src/components/kanban-board.tsx
rm src/components/calendar-view.tsx
rm src/components/notes-view.tsx
rm src/components/passwords-view.tsx
```

- [ ] **Step 2: Verifier qu'aucun import ne reference ces fichiers**

Run: `grep -r "kanban-board\|calendar-view\|notes-view\|passwords-view" src/ --include="*.tsx" --include="*.ts"`
Expected: Aucun resultat (ou seulement page.tsx qu'on modifiera plus tard)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove obsolete local components (replaced by forks)"
```

---

## Chunk 2: Composants UI — Layout et Overview

### Task 5: Composant ProjectHeader avec onglets

**Files:**
- Create: `src/components/layout/project-header.tsx`

- [ ] **Step 1: Creer le composant**

```tsx
// src/components/layout/project-header.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Project } from '@/types'
import { LayoutGrid, CheckSquare, Calendar, FileText, Lock } from 'lucide-react'

interface ProjectHeaderProps {
  project: Project
}

const tabs = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutGrid, href: '' },
  { id: 'tasks', label: 'Taches', icon: CheckSquare, href: '/tasks' },
  { id: 'calendar', label: 'Calendrier', icon: Calendar, href: '/calendar' },
  { id: 'notes', label: 'Notes', icon: FileText, href: '/notes' },
  { id: 'passwords', label: 'Passwords', icon: Lock, href: '/passwords' },
]

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const pathname = usePathname()
  const basePath = `/projects/${project.id}`

  const activeTab = tabs.find(t =>
    t.href ? pathname.endsWith(t.href) : pathname === basePath
  )?.id || 'overview'

  return (
    <div className="border-b border-[#2A2D37] bg-[#0F1115]">
      <div className="px-7 pt-5 pb-0">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-xl font-semibold text-white">{project.name}</h1>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            project.status === 'active'
              ? 'bg-[#46A758]/15 text-[#46A758]'
              : 'bg-[#F5A623]/15 text-[#F5A623]'
          }`}>
            {project.status === 'active' ? 'Actif' : 'En pause'}
          </span>
        </div>
        {project.description && (
          <p className="text-sm text-[#8A8F98] mb-4">{project.description}</p>
        )}
      </div>

      <div className="flex px-7">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = tab.id === activeTab
          return (
            <Link
              key={tab.id}
              href={`${basePath}${tab.href}`}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'text-white border-[#5E6AD2]'
                  : 'text-[#8A8F98] border-transparent hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/project-header.tsx
git commit -m "feat: add ProjectHeader component with navigation tabs"
```

---

### Task 6: Composant IframeToolbar

**Files:**
- Create: `src/components/layout/iframe-toolbar.tsx`

- [ ] **Step 1: Creer le composant**

```tsx
// src/components/layout/iframe-toolbar.tsx
'use client'

import { ExternalLink, RefreshCw } from 'lucide-react'

interface IframeToolbarProps {
  serviceName: string
  serviceIcon: React.ReactNode
  projectName: string
  externalUrl: string
  actions?: { label: string; onClick: () => void }[]
}

export function IframeToolbar({
  serviceName,
  serviceIcon,
  projectName,
  externalUrl,
  actions = [],
}: IframeToolbarProps) {
  return (
    <div className="flex items-center justify-between px-7 py-2 bg-[#161922] border-b border-[#2A2D37] text-xs text-[#555A65]">
      <span className="flex items-center gap-2">
        {serviceIcon}
        {serviceName} — {projectName}
      </span>
      <div className="flex gap-2">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className="px-2.5 py-1 bg-[#1F232E] border border-[#2A2D37] rounded text-[#8A8F98] hover:border-[#5E6AD2] hover:text-white transition-colors"
          >
            {action.label}
          </button>
        ))}
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 bg-[#1F232E] border border-[#2A2D37] rounded text-[#8A8F98] hover:border-[#5E6AD2] hover:text-white transition-colors flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Ouvrir
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/iframe-toolbar.tsx
git commit -m "feat: add IframeToolbar component"
```

---

### Task 7: Composants Overview (stat-card, widget, overview-grid)

**Files:**
- Create: `src/components/overview/stat-card.tsx`
- Create: `src/components/overview/widget.tsx`
- Create: `src/components/overview/overview-grid.tsx`

- [ ] **Step 1: Creer stat-card**

```tsx
// src/components/overview/stat-card.tsx
interface StatCardProps {
  label: string
  value: number | string
  sub: string
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-[#161922] border border-[#2A2D37] rounded-xl p-5">
      <div className="text-xs text-[#8A8F98] mb-1.5">{label}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-xs text-[#555A65] mt-1">{sub}</div>
    </div>
  )
}
```

- [ ] **Step 2: Creer widget**

```tsx
// src/components/overview/widget.tsx
import type { WidgetItem } from '@/types'

interface WidgetProps {
  title: string
  actionLabel?: string
  onAction?: () => void
  items: WidgetItem[]
  renderMeta?: (item: WidgetItem) => React.ReactNode
}

const priorityColors: Record<string, string> = {
  urgent: '#E5484D',
  high: '#E5484D',
  medium: '#F5A623',
  low: '#46A758',
}

export function Widget({ title, actionLabel, onAction, items, renderMeta }: WidgetProps) {
  return (
    <div className="bg-[#161922] border border-[#2A2D37] rounded-xl">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2A2D37]">
        <span className="text-sm font-semibold text-white">{title}</span>
        {actionLabel && onAction && (
          <button onClick={onAction} className="text-xs text-[#5E6AD2] font-medium hover:underline">
            {actionLabel} →
          </button>
        )}
      </div>
      <div className="py-1">
        {items.length === 0 ? (
          <div className="px-5 py-4 text-sm text-[#555A65] text-center">Aucun element</div>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-2.5 text-sm border-b border-[#2A2D37]/50 last:border-b-0">
              {item.priority && (
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: priorityColors[item.priority] || '#555A65' }}
                />
              )}
              <span className="text-[#F7F8F8] flex-1">{item.title}</span>
              {renderMeta ? renderMeta(item) : (
                <span className="text-xs text-[#555A65]">{item.meta}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Creer overview-grid**

```tsx
// src/components/overview/overview-grid.tsx
'use client'

import { StatCard } from './stat-card'
import { Widget } from './widget'
import type { StatCard as StatCardType, WidgetItem } from '@/types'

interface OverviewGridProps {
  stats: StatCardType[]
  recentTasks: WidgetItem[]
  upcomingEvents: WidgetItem[]
  recentNotes: WidgetItem[]
  onNavigate: (tab: string) => void
}

export function OverviewGrid({
  stats,
  recentTasks,
  upcomingEvents,
  recentNotes,
  onNavigate,
}: OverviewGridProps) {
  return (
    <div className="p-7 overflow-y-auto flex-1">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {stats.map((s, i) => (
          <StatCard key={i} label={s.label} value={s.value} sub={s.sub} />
        ))}
      </div>

      {/* Recent tasks */}
      <div className="mb-5">
        <Widget
          title="Taches recentes"
          actionLabel="Voir tout"
          onAction={() => onNavigate('tasks')}
          items={recentTasks}
          renderMeta={(item) => (
            <span className={`text-xs px-2 py-0.5 rounded bg-[#1F232E] ${
              item.priority === 'urgent' || item.priority === 'high'
                ? 'text-[#E5484D]'
                : 'text-[#8A8F98]'
            }`}>
              {item.status || item.meta}
            </span>
          )}
        />
      </div>

      {/* Two-column widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Widget
          title="Prochains RDV"
          actionLabel="Voir tout"
          onAction={() => onNavigate('calendar')}
          items={upcomingEvents}
        />
        <Widget
          title="Notes recentes"
          actionLabel="Voir tout"
          onAction={() => onNavigate('notes')}
          items={recentNotes}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/overview/
git commit -m "feat: add overview components (stat-card, widget, overview-grid)"
```

---

## Chunk 3: Routing et Pages

### Task 8: Dashboard layout avec auth guard

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Creer le layout**

```tsx
// src/app/(dashboard)/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [supabase, setSupabase] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      try {
        const { createBrowserClient } = await import('@supabase/ssr')
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!url || !key) { setIsLoading(false); return }

        const client = createBrowserClient(url, key)
        setSupabase(client)

        const { data: { user } } = await client.auth.getUser()
        if (user) {
          setUser(user)
          setIsAuthenticated(true)
        }
        setIsLoading(false)

        const { data: { subscription } } = client.auth.onAuthStateChange((_: any, session: any) => {
          if (session?.user) {
            setUser(session.user)
            setIsAuthenticated(true)
          } else {
            setUser(null)
            setIsAuthenticated(false)
          }
        })
        return () => subscription.unsubscribe()
      } catch {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut()
    setIsAuthenticated(false)
    setUser(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="text-[#8A8F98]">Chargement...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Import AuthForm dynamically to avoid circular deps
    const AuthForm = require('@/components/auth-form').AuthForm
    return <AuthForm onAuth={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="flex h-screen bg-[#0F1115]">
      <Sidebar onLogout={handleLogout} userEmail={user?.email} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/layout.tsx
git commit -m "feat: add dashboard layout with auth guard"
```

---

### Task 9: Page vue d'ensemble projet

**Files:**
- Create: `src/app/(dashboard)/projects/[id]/page.tsx`

- [ ] **Step 1: Creer la page**

```tsx
// src/app/(dashboard)/projects/[id]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ProjectHeader } from '@/components/layout/project-header'
import { OverviewGrid } from '@/components/overview/overview-grid'
import { FolderOpen } from 'lucide-react'

export default function ProjectOverview() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { projects } = useStore()
  const project = projects.find(p => p.id === id)

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FolderOpen className="w-16 h-16 text-[#2A2D37] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#8A8F98]">Projet introuvable</h2>
        </div>
      </div>
    )
  }

  // TODO: Fetch real data from API Gateway when services are connected
  const stats = [
    { label: 'Taches ouvertes', value: 0, sub: 'Connecter Plane' },
    { label: 'RDV cette semaine', value: 0, sub: 'Connecter Cal.com' },
    { label: 'Notes', value: 0, sub: 'Connecter Docmost' },
    { label: 'Mots de passe', value: 0, sub: 'Connecter Vaultwarden' },
  ]

  const handleNavigate = (tab: string) => {
    router.push(`/projects/${id}/${tab}`)
  }

  return (
    <>
      <ProjectHeader project={project} />
      <OverviewGrid
        stats={stats}
        recentTasks={[]}
        upcomingEvents={[]}
        recentNotes={[]}
        onNavigate={handleNavigate}
      />
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/projects/\[id\]/page.tsx
git commit -m "feat: add project overview page"
```

---

### Task 10: Pages iframe (tasks, calendar, notes, passwords)

**Files:**
- Create: `src/app/(dashboard)/projects/[id]/tasks/page.tsx`
- Create: `src/app/(dashboard)/projects/[id]/calendar/page.tsx`
- Create: `src/app/(dashboard)/projects/[id]/notes/page.tsx`
- Create: `src/app/(dashboard)/projects/[id]/passwords/page.tsx`

- [ ] **Step 1: Creer la page tasks**

```tsx
// src/app/(dashboard)/projects/[id]/tasks/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ProjectHeader } from '@/components/layout/project-header'
import { IframeToolbar } from '@/components/layout/iframe-toolbar'
import { IframeView } from '@/components/iframe-view'
import { CheckSquare } from 'lucide-react'

export default function TasksPage() {
  const { id } = useParams<{ id: string }>()
  const project = useStore(s => s.projects.find(p => p.id === id))

  if (!project) return null

  const planeUrl = process.env.NEXT_PUBLIC_PLANE_URL || 'https://plane.folly-os.dev'

  return (
    <>
      <ProjectHeader project={project} />
      <IframeToolbar
        serviceName="Plane"
        serviceIcon={<CheckSquare className="w-3.5 h-3.5" />}
        projectName={project.name}
        externalUrl={planeUrl}
      />
      <div className="flex-1 overflow-hidden">
        <IframeView src={planeUrl} title={`Plane - ${project.name}`} />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Creer la page calendar**

```tsx
// src/app/(dashboard)/projects/[id]/calendar/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ProjectHeader } from '@/components/layout/project-header'
import { IframeToolbar } from '@/components/layout/iframe-toolbar'
import { IframeView } from '@/components/iframe-view'
import { Calendar } from 'lucide-react'

export default function CalendarPage() {
  const { id } = useParams<{ id: string }>()
  const project = useStore(s => s.projects.find(p => p.id === id))

  if (!project) return null

  const calcomUrl = process.env.NEXT_PUBLIC_CALCOM_URL || 'https://cal.folly-os.dev'

  return (
    <>
      <ProjectHeader project={project} />
      <IframeToolbar
        serviceName="Cal.com"
        serviceIcon={<Calendar className="w-3.5 h-3.5" />}
        projectName={project.name}
        externalUrl={calcomUrl}
      />
      <div className="flex-1 overflow-hidden">
        <IframeView src={calcomUrl} title={`Cal.com - ${project.name}`} />
      </div>
    </>
  )
}
```

- [ ] **Step 3: Creer la page notes**

```tsx
// src/app/(dashboard)/projects/[id]/notes/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ProjectHeader } from '@/components/layout/project-header'
import { IframeToolbar } from '@/components/layout/iframe-toolbar'
import { IframeView } from '@/components/iframe-view'
import { FileText } from 'lucide-react'

export default function NotesPage() {
  const { id } = useParams<{ id: string }>()
  const project = useStore(s => s.projects.find(p => p.id === id))

  if (!project) return null

  const docmostUrl = process.env.NEXT_PUBLIC_DOCMOST_URL || 'https://notes.folly-os.dev'

  return (
    <>
      <ProjectHeader project={project} />
      <IframeToolbar
        serviceName="Docmost"
        serviceIcon={<FileText className="w-3.5 h-3.5" />}
        projectName={project.name}
        externalUrl={docmostUrl}
      />
      <div className="flex-1 overflow-hidden">
        <IframeView src={docmostUrl} title={`Docmost - ${project.name}`} />
      </div>
    </>
  )
}
```

- [ ] **Step 4: Creer la page passwords**

```tsx
// src/app/(dashboard)/projects/[id]/passwords/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ProjectHeader } from '@/components/layout/project-header'
import { IframeToolbar } from '@/components/layout/iframe-toolbar'
import { IframeView } from '@/components/iframe-view'
import { Lock } from 'lucide-react'

export default function PasswordsPage() {
  const { id } = useParams<{ id: string }>()
  const project = useStore(s => s.projects.find(p => p.id === id))

  if (!project) return null

  const vaultUrl = process.env.NEXT_PUBLIC_VAULTWARDEN_URL || 'https://vault.folly-os.dev'

  return (
    <>
      <ProjectHeader project={project} />
      <IframeToolbar
        serviceName="Vaultwarden"
        serviceIcon={<Lock className="w-3.5 h-3.5" />}
        projectName={project.name}
        externalUrl={vaultUrl}
      />
      <div className="flex-1 overflow-hidden">
        <IframeView src={vaultUrl} title={`Vaultwarden - ${project.name}`} />
      </div>
    </>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(dashboard\)/projects/\[id\]/
git commit -m "feat: add iframe pages for tasks, calendar, notes, passwords"
```

---

### Task 11: Mettre a jour la page d'accueil et la sidebar

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/sidebar.tsx`

- [ ] **Step 1: Simplifier page.tsx en redirection**

Remplacer tout le contenu de `src/app/page.tsx` par une redirection vers le layout dashboard :

```tsx
// src/app/page.tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/projects')
}
```

Note: La page `/projects` sera geree par le layout `(dashboard)` qui affichera la sidebar + un message "selectionnez un projet".

- [ ] **Step 2: Creer la page projects index**

```tsx
// src/app/(dashboard)/projects/page.tsx
'use client'

import { FolderOpen } from 'lucide-react'

export default function ProjectsIndex() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <FolderOpen className="w-16 h-16 text-[#2A2D37] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#8A8F98] mb-2">
          Aucun projet selectionne
        </h2>
        <p className="text-[#555A65]">
          Creez un nouveau projet ou selectionnez-en un dans la sidebar
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Mettre a jour la sidebar pour utiliser le routing**

Modifier `src/components/sidebar.tsx` : remplacer `selectProject(project.id)` par `router.push(`/projects/${project.id}`)` et ajouter le hook `useRouter`.

- [ ] **Step 4: Verifier que le build passe**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/\(dashboard\)/projects/page.tsx src/components/sidebar.tsx
git commit -m "feat: add URL-based project routing with sidebar navigation"
```

---

## Chunk 4: API Gateway

### Task 12: Clients API pour chaque service

**Files:**
- Create: `src/lib/api/plane.ts`
- Create: `src/lib/api/calcom.ts`
- Create: `src/lib/api/docmost.ts`
- Create: `src/lib/api/vaultwarden.ts`

- [ ] **Step 1: Client Plane**

```typescript
// src/lib/api/plane.ts
const PLANE_BASE_URL = process.env.PLANE_BASE_URL || ''
const PLANE_API_KEY = process.env.PLANE_API_KEY || ''

async function planeRequest(path: string, options?: RequestInit) {
  const res = await fetch(`${PLANE_BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': PLANE_API_KEY,
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(`Plane API error: ${res.status}`)
  return res.json()
}

export const planeApi = {
  listProjects: (workspaceSlug: string) =>
    planeRequest(`/workspaces/${workspaceSlug}/projects/`),

  listWorkItems: (workspaceSlug: string, projectId: string) =>
    planeRequest(`/workspaces/${workspaceSlug}/projects/${projectId}/work-items/`),

  createWorkItem: (workspaceSlug: string, projectId: string, data: any) =>
    planeRequest(`/workspaces/${workspaceSlug}/projects/${projectId}/work-items/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getWorkItem: (workspaceSlug: string, projectId: string, itemId: string) =>
    planeRequest(`/workspaces/${workspaceSlug}/projects/${projectId}/work-items/${itemId}/`),

  healthCheck: async () => {
    try {
      const start = Date.now()
      await fetch(`${PLANE_BASE_URL}/api/v1/users/me/`, {
        headers: { 'X-API-Key': PLANE_API_KEY },
      })
      return { status: 'up' as const, latency_ms: Date.now() - start }
    } catch {
      return { status: 'down' as const, latency_ms: 0 }
    }
  },
}
```

- [ ] **Step 2: Client Cal.com**

```typescript
// src/lib/api/calcom.ts
const CALCOM_BASE_URL = process.env.CALCOM_BASE_URL || ''
const CALCOM_API_KEY = process.env.CALCOM_API_KEY || ''

async function calcomRequest(path: string, options?: RequestInit) {
  const res = await fetch(`${CALCOM_BASE_URL}/api/v2${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CALCOM_API_KEY}`,
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(`Cal.com API error: ${res.status}`)
  return res.json()
}

export const calcomApi = {
  listEventTypes: () => calcomRequest('/event-types'),

  listBookings: (params?: { status?: string }) => {
    const query = params?.status ? `?status=${params.status}` : ''
    return calcomRequest(`/bookings${query}`)
  },

  createBooking: (data: any) =>
    calcomRequest('/bookings', { method: 'POST', body: JSON.stringify(data) }),

  healthCheck: async () => {
    try {
      const start = Date.now()
      await fetch(`${CALCOM_BASE_URL}/api/v2/me`, {
        headers: { 'Authorization': `Bearer ${CALCOM_API_KEY}` },
      })
      return { status: 'up' as const, latency_ms: Date.now() - start }
    } catch {
      return { status: 'down' as const, latency_ms: 0 }
    }
  },
}
```

- [ ] **Step 3: Client Docmost**

```typescript
// src/lib/api/docmost.ts
const DOCMOST_BASE_URL = process.env.DOCMOST_BASE_URL || ''
const DOCMOST_API_KEY = process.env.DOCMOST_API_KEY || ''

async function docmostRequest(path: string, options?: RequestInit) {
  const res = await fetch(`${DOCMOST_BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DOCMOST_API_KEY}`,
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(`Docmost API error: ${res.status}`)
  return res.json()
}

export const docmostApi = {
  listSpaces: () => docmostRequest('/spaces'),
  listPages: (spaceId: string) => docmostRequest(`/spaces/${spaceId}/pages`),
  createPage: (spaceId: string, data: any) =>
    docmostRequest(`/spaces/${spaceId}/pages`, { method: 'POST', body: JSON.stringify(data) }),

  healthCheck: async () => {
    try {
      const start = Date.now()
      await fetch(`${DOCMOST_BASE_URL}/api/v1/spaces`, {
        headers: { 'Authorization': `Bearer ${DOCMOST_API_KEY}` },
      })
      return { status: 'up' as const, latency_ms: Date.now() - start }
    } catch {
      return { status: 'down' as const, latency_ms: 0 }
    }
  },
}
```

- [ ] **Step 4: Client Vaultwarden**

```typescript
// src/lib/api/vaultwarden.ts
const VAULTWARDEN_BASE_URL = process.env.VAULTWARDEN_BASE_URL || ''
const VAULTWARDEN_ADMIN_TOKEN = process.env.VAULTWARDEN_ADMIN_TOKEN || ''

async function vaultwardenRequest(path: string, options?: RequestInit) {
  const res = await fetch(`${VAULTWARDEN_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VAULTWARDEN_ADMIN_TOKEN}`,
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(`Vaultwarden API error: ${res.status}`)
  return res.json()
}

export const vaultwardenApi = {
  listUsers: () => vaultwardenRequest('/admin/users'),

  healthCheck: async () => {
    try {
      const start = Date.now()
      await fetch(`${VAULTWARDEN_BASE_URL}/alive`)
      return { status: 'up' as const, latency_ms: Date.now() - start }
    } catch {
      return { status: 'down' as const, latency_ms: 0 }
    }
  },
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/api/
git commit -m "feat: add API clients for Plane, Cal.com, Docmost, Vaultwarden"
```

---

### Task 13: API Route Handlers

**Files:**
- Create: `src/app/api/projects/route.ts`
- Create: `src/app/api/tasks/route.ts`
- Create: `src/app/api/calendar/route.ts`
- Create: `src/app/api/notes/route.ts`
- Create: `src/app/api/vault/route.ts`
- Create: `src/app/api/health/route.ts`

- [ ] **Step 1: API projects (Supabase)**

```typescript
// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('projects')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
```

- [ ] **Step 2: API tasks (proxy Plane)**

```typescript
// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { planeApi } from '@/lib/api/plane'

const WORKSPACE_SLUG = process.env.PLANE_WORKSPACE_SLUG || 'folly-os'

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get('project_id')
  if (!projectId) return NextResponse.json({ error: 'project_id required' }, { status: 400 })

  try {
    const data = await planeApi.listWorkItems(WORKSPACE_SLUG, projectId)
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { project_id, ...taskData } = body
  if (!project_id) return NextResponse.json({ error: 'project_id required' }, { status: 400 })

  try {
    const data = await planeApi.createWorkItem(WORKSPACE_SLUG, project_id, taskData)
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
```

- [ ] **Step 3: API calendar (proxy Cal.com)**

```typescript
// src/app/api/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { calcomApi } from '@/lib/api/calcom'

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') || 'bookings'

  try {
    const data = type === 'event-types'
      ? await calcomApi.listEventTypes()
      : await calcomApi.listBookings()
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  try {
    const data = await calcomApi.createBooking(body)
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
```

- [ ] **Step 4: API notes (proxy Docmost)**

```typescript
// src/app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { docmostApi } from '@/lib/api/docmost'

export async function GET(request: NextRequest) {
  const spaceId = request.nextUrl.searchParams.get('space_id')

  try {
    const data = spaceId
      ? await docmostApi.listPages(spaceId)
      : await docmostApi.listSpaces()
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { space_id, ...pageData } = body
  if (!space_id) return NextResponse.json({ error: 'space_id required' }, { status: 400 })

  try {
    const data = await docmostApi.createPage(space_id, pageData)
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
```

- [ ] **Step 5: API vault (proxy Vaultwarden)**

```typescript
// src/app/api/vault/route.ts
import { NextResponse } from 'next/server'
import { vaultwardenApi } from '@/lib/api/vaultwarden'

export async function GET() {
  try {
    const data = await vaultwardenApi.listUsers()
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
```

- [ ] **Step 6: API health**

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { planeApi } from '@/lib/api/plane'
import { calcomApi } from '@/lib/api/calcom'
import { docmostApi } from '@/lib/api/docmost'
import { vaultwardenApi } from '@/lib/api/vaultwarden'

export async function GET() {
  const [plane, calcom, docmost, vaultwarden] = await Promise.all([
    planeApi.healthCheck(),
    calcomApi.healthCheck(),
    docmostApi.healthCheck(),
    vaultwardenApi.healthCheck(),
  ])

  return NextResponse.json({
    services: {
      plane: { service: 'plane', ...plane },
      calcom: { service: 'calcom', ...calcom },
      docmost: { service: 'docmost', ...docmost },
      vaultwarden: { service: 'vaultwarden', ...vaultwarden },
    },
    all_up: [plane, calcom, docmost, vaultwarden].every(s => s.status === 'up'),
  })
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/api/
git commit -m "feat: add API Gateway route handlers for all services"
```

---

## Chunk 5: Finalisation et README

### Task 14: Mettre a jour le README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Reecrire le README**

Mettre a jour le README avec :
- Nouvelle architecture (Vercel + Supabase + Oracle Cloud)
- Nouveaux services (Cal.com remplace Someday, Vaultwarden remplace Padloc)
- API Gateway documentation
- Instructions d'installation et deploiement
- Variables d'environnement

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with v2 architecture and API Gateway"
```

---

### Task 15: Nettoyer et verifier le build

**Files:**
- Various cleanup

- [ ] **Step 1: Supprimer les imports morts**

Verifier et corriger tous les imports qui referenceaient les anciens composants ou types.

- [ ] **Step 2: Build complet**

Run: `npm run build`
Expected: Build succeeds without errors

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "chore: cleanup dead imports and verify build"
```

---

## Execution Notes

### Ordre d'execution
Les chunks sont sequentiels : 1 → 2 → 3 → 4 → 5

### Dependances externes
- Les API clients (Chunk 4) ne fonctionneront qu'une fois les services deployes sur Oracle Cloud
- Les variables d'env doivent etre fournies par l'utilisateur
- Le build Next.js doit passer meme sans les variables d'env (fallback sur chaines vides)

### Ce qui reste apres ce plan
1. Creer le compte Oracle Cloud et deployer Coolify
2. Deployer Plane, Cal.com, Docmost, Vaultwarden sur Coolify
3. Configurer les domaines et SSL
4. Fournir les variables d'env et les ajouter sur Vercel
5. Executer la migration SQL sur Supabase
6. Creer les mappings projet ↔ service

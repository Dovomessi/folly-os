'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ProjectHeader } from '@/components/layout/project-header'
import { OverviewGrid } from '@/components/overview/overview-grid'
import { ActivityFeed } from '@/components/overview/activity-feed'
import { FolderOpen } from 'lucide-react'
import type { Task, Appointment, Note, VaultItem, StatCard, WidgetItem } from '@/types'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function isThisWeek(dateStr: string): boolean {
  const now = new Date()
  const date = new Date(dateStr)
  const startOfWeek = new Date(now)
  startOfWeek.setHours(0, 0, 0, 0)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  return date >= startOfWeek && date < endOfWeek
}

function isToday(dateStr: string): boolean {
  const now = new Date()
  const date = new Date(dateStr)
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export default function ProjectOverview() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { projects } = useStore()
  const rawProject = projects.find(p => p.id === id)
  const project = rawProject ? { ...rawProject, status: rawProject.status || 'active' as const } : undefined

  const [tasks, setTasks] = useState<Task[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [vaultCount, setVaultCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function fetchAll() {
      try {
        const [tasksRes, apptsRes, notesRes, vaultRes] = await Promise.all([
          fetch(`/api/tasks?project_id=${id}`),
          fetch(`/api/appointments?project_id=${id}`),
          fetch(`/api/notes?project_id=${id}`),
          fetch(`/api/vault?project_id=${id}`),
        ])

        const [tasksJson, apptsJson, notesJson, vaultJson] = await Promise.all([
          tasksRes.ok ? tasksRes.json() : { data: [] },
          apptsRes.ok ? apptsRes.json() : { data: [] },
          notesRes.ok ? notesRes.json() : { data: [] },
          vaultRes.ok ? vaultRes.json() : { data: [] },
        ])

        setTasks(tasksJson.data || [])
        setAppointments(apptsJson.data || [])
        setNotes(notesJson.data || [])
        setVaultCount((vaultJson.data || []).length)
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [id])

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

  // Compute stats
  const openTasks = tasks.filter(t => t.status !== 'done')
  const urgentTasks = openTasks.filter(t => t.priority === 'urgent' || t.priority === 'high')
  const weekAppointments = appointments.filter(a => isThisWeek(a.start_time))
  const nextAppointment = appointments
    .filter(a => new Date(a.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0]
  const todayNotes = notes.filter(n => isToday(n.updated_at))

  const stats: StatCard[] = [
    {
      label: 'Taches ouvertes',
      value: openTasks.length,
      sub: urgentTasks.length > 0 ? `${urgentTasks.length} urgentes` : 'Aucune urgente',
    },
    {
      label: 'RDV cette semaine',
      value: weekAppointments.length,
      sub: nextAppointment
        ? `Prochain : ${formatShortDate(nextAppointment.start_time)}`
        : 'Aucun a venir',
    },
    {
      label: 'Notes',
      value: notes.length,
      sub: todayNotes.length > 0 ? `${todayNotes.length} modifiee(s) aujourd'hui` : 'Aucune modifiee aujourd\'hui',
    },
    {
      label: 'Mots de passe',
      value: vaultCount,
      sub: vaultCount === 0 ? 'Aucun stocke' : `${vaultCount} entree(s)`,
    },
  ]

  // Recent tasks (last 5, open tasks)
  const recentTasks: WidgetItem[] = tasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      title: t.title,
      subtitle: t.status,
      priority: t.priority,
      status: t.status === 'todo' ? 'A faire' : t.status === 'in_progress' ? 'En cours' : t.status === 'in_review' ? 'En revue' : 'Termine',
    }))

  // Upcoming appointments (next 3)
  const upcomingEvents: WidgetItem[] = appointments
    .filter(a => new Date(a.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 3)
    .map(a => ({
      id: a.id,
      title: a.title,
      subtitle: formatDate(a.start_time),
      meta: formatDate(a.start_time),
    }))

  // Recent notes (last 3)
  const recentNotes: WidgetItem[] = notes
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3)
    .map(n => ({
      id: n.id,
      title: n.title || 'Sans titre',
      subtitle: formatDate(n.updated_at),
      meta: formatDate(n.updated_at),
    }))

  const handleNavigate = (tab: string) => {
    router.push(`/projects/${id}/${tab}`)
  }

  return (
    <>
      <ProjectHeader project={project} />
      <div className="p-7 overflow-y-auto flex-1">
        <OverviewGrid
          stats={stats}
          recentTasks={recentTasks}
          upcomingEvents={upcomingEvents}
          recentNotes={recentNotes}
          onNavigate={handleNavigate}
          loading={loading}
        />
        <div className="mt-4">
          <ActivityFeed projectId={id} />
        </div>
      </div>
    </>
  )
}

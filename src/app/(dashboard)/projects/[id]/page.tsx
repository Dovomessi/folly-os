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
  const rawProject = projects.find(p => p.id === id)
  const project = rawProject ? { ...rawProject, status: rawProject.status || 'active' as const } : undefined

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

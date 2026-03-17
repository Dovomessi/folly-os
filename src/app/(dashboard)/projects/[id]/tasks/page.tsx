'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ProjectHeader } from '@/components/layout/project-header'
import { IframeToolbar } from '@/components/layout/iframe-toolbar'
import { IframeView } from '@/components/iframe-view'
import { CheckSquare } from 'lucide-react'

export default function TasksPage() {
  const { id } = useParams<{ id: string }>()
  const rawProject = useStore(s => s.projects.find(p => p.id === id))
  const project = rawProject ? { ...rawProject, status: rawProject.status || ('active' as const) } : undefined

  if (!project) return null

  const planeExternal = process.env.NEXT_PUBLIC_PLANE_URL || 'https://plane-web-production-c63d.up.railway.app'

  return (
    <>
      <ProjectHeader project={project} />
      <IframeToolbar
        serviceName="Plane"
        serviceIcon={<CheckSquare className="w-3.5 h-3.5" />}
        projectName={project.name}
        externalUrl={planeExternal}
        actions={[
          { label: '+ Nouvelle tache', onClick: () => window.open(planeExternal, '_blank') },
        ]}
      />
      <div className="flex-1 overflow-hidden">
        <IframeView src={planeExternal} title={`Plane - ${project.name}`} />
      </div>
    </>
  )
}

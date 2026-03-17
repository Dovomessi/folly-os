'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ProjectHeader } from '@/components/layout/project-header'
import { IframeToolbar } from '@/components/layout/iframe-toolbar'
import { IframeView } from '@/components/iframe-view'
import { Calendar } from 'lucide-react'

export default function CalendarPage() {
  const { id } = useParams<{ id: string }>()
  const rawProject = useStore(s => s.projects.find(p => p.id === id))
  const project = rawProject ? { ...rawProject, status: rawProject.status || ('active' as const) } : undefined

  if (!project) return null

  const calcomExternal = process.env.NEXT_PUBLIC_CALCOM_URL || 'https://app.cal.com'

  return (
    <>
      <ProjectHeader project={project} />
      <IframeToolbar
        serviceName="Cal.com"
        serviceIcon={<Calendar className="w-3.5 h-3.5" />}
        projectName={project.name}
        externalUrl={calcomExternal}
        actions={[
          { label: '+ Nouveau RDV', onClick: () => window.open(calcomExternal, '_blank') },
        ]}
      />
      <div className="flex-1 overflow-hidden">
        <IframeView src={calcomExternal} title={`Cal.com - ${project.name}`} />
      </div>
    </>
  )
}

'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ProjectHeader } from '@/components/layout/project-header'
import { IframeToolbar } from '@/components/layout/iframe-toolbar'
import { IframeView } from '@/components/iframe-view'
import { FileText } from 'lucide-react'

export default function NotesPage() {
  const { id } = useParams<{ id: string }>()
  const rawProject = useStore(s => s.projects.find(p => p.id === id))
  const project = rawProject ? { ...rawProject, status: rawProject.status || ('active' as const) } : undefined

  if (!project) return null

  const docmostExternal = process.env.NEXT_PUBLIC_DOCMOST_URL || 'https://docmost-production-3a43.up.railway.app'

  return (
    <>
      <ProjectHeader project={project} />
      <IframeToolbar
        serviceName="Docmost"
        serviceIcon={<FileText className="w-3.5 h-3.5" />}
        projectName={project.name}
        externalUrl={docmostExternal}
        actions={[
          { label: '+ Nouvelle note', onClick: () => window.open(docmostExternal, '_blank') },
        ]}
      />
      <div className="flex-1 overflow-hidden">
        <IframeView src={docmostExternal} title={`Docmost - ${project.name}`} />
      </div>
    </>
  )
}

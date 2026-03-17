'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ProjectHeader } from '@/components/layout/project-header'
import { IframeToolbar } from '@/components/layout/iframe-toolbar'
import { IframeView } from '@/components/iframe-view'
import { Lock } from 'lucide-react'

export default function PasswordsPage() {
  const { id } = useParams<{ id: string }>()
  const rawProject = useStore(s => s.projects.find(p => p.id === id))
  const project = rawProject ? { ...rawProject, status: rawProject.status || ('active' as const) } : undefined

  if (!project) return null

  const vaultExternal = process.env.NEXT_PUBLIC_VAULTWARDEN_URL || 'https://vaultwarden-production-39da.up.railway.app'

  return (
    <>
      <ProjectHeader project={project} />
      <IframeToolbar
        serviceName="Vaultwarden"
        serviceIcon={<Lock className="w-3.5 h-3.5" />}
        projectName={project.name}
        externalUrl={vaultExternal}
        actions={[
          { label: '+ Ajouter', onClick: () => window.open(vaultExternal, '_blank') },
        ]}
      />
      <div className="flex-1 overflow-hidden">
        <IframeView src="/api/proxy/vault" title={`Vaultwarden - ${project.name}`} />
      </div>
    </>
  )
}

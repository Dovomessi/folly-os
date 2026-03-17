'use client'

import { useEffect, useState } from 'react'
import type { ActivityLog } from '@/types'
import { CheckSquare, Calendar, FileText, Lock, Activity } from 'lucide-react'

interface ActivityFeedProps {
  projectId: string
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "il y a quelques secondes"
  if (diffMins < 60) return `il y a ${diffMins}min`
  if (diffHours < 24) return `il y a ${diffHours}h`
  if (diffDays === 1) return "il y a 1 jour"
  if (diffDays < 7) return `il y a ${diffDays} jours`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatActionLabel(action: string, entityType: string): string {
  const entityLabels: Record<string, string> = {
    task: 'Tache',
    appointment: 'RDV',
    note: 'Note',
    vault_item: 'Mot de passe',
  }

  const actionLabels: Record<string, string> = {
    created: 'cree',
    updated: 'modifie',
    deleted: 'supprime',
    completed: 'complete',
  }

  const entity = entityLabels[entityType] || entityType
  const actionStr = actionLabels[action] || action
  return `${entity} ${actionStr}`
}

function EntityIcon({ type }: { type: string }) {
  const iconProps = { className: "w-3.5 h-3.5" }
  switch (type) {
    case 'task': return <CheckSquare {...iconProps} />
    case 'appointment': return <Calendar {...iconProps} />
    case 'note': return <FileText {...iconProps} />
    case 'vault_item': return <Lock {...iconProps} />
    default: return <Activity {...iconProps} />
  }
}

function entityColor(type: string): string {
  switch (type) {
    case 'task': return '#5E6AD2'
    case 'appointment': return '#46A758'
    case 'note': return '#F5A623'
    case 'vault_item': return '#E5484D'
    default: return '#8A8F98'
  }
}

export function ActivityFeed({ projectId }: ActivityFeedProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch(`/api/activity?project_id=${projectId}`)
        if (!res.ok) return
        const json = await res.json()
        setLogs(json.data || [])
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    }
    fetchActivity()
  }, [projectId])

  return (
    <div className="bg-[#161922] border border-[#2A2D37] rounded-xl">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2A2D37]">
        <span className="text-sm font-semibold text-white">Activite recente</span>
      </div>

      <div className="py-1">
        {loading ? (
          <div className="px-5 py-4 text-sm text-[#555A65] text-center">Chargement...</div>
        ) : logs.length === 0 ? (
          <div className="px-5 py-4 text-sm text-[#555A65] text-center">Aucune activite</div>
        ) : (
          <div className="relative px-5 py-3">
            {/* Vertical timeline line */}
            <div className="absolute left-[26px] top-3 bottom-3 w-px bg-[#2A2D37]" />

            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 relative">
                  {/* Timeline dot with icon */}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 border border-[#2A2D37]"
                    style={{ backgroundColor: entityColor(log.entity_type) + '22', color: entityColor(log.entity_type) }}
                  >
                    <EntityIcon type={log.entity_type} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm text-[#F7F8F8] leading-tight">
                      <span className="text-[#8A8F98]">{formatActionLabel(log.action, log.entity_type)}</span>
                      {log.entity_title && (
                        <> : <span className="font-medium">{log.entity_title}</span></>
                      )}
                    </p>
                    <p className="text-xs text-[#555A65] mt-0.5">
                      {formatRelativeTime(log.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

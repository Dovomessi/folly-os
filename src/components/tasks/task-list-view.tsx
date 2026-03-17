'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Task } from '@/types'

interface TaskListViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  filterStatus: string
  filterPriority: string
}

type SortField = 'title' | 'status' | 'priority' | 'due_date'
type SortDir = 'asc' | 'desc'

const STATUS_LABELS: Record<string, string> = {
  todo: 'A faire',
  in_progress: 'En cours',
  in_review: 'En revue',
  done: 'Terminé',
}

const STATUS_COLORS: Record<string, string> = {
  todo: '#8A8F98',
  in_progress: '#5E6AD2',
  in_review: '#F5A623',
  done: '#46A758',
}

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgent',
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#E5484D',
  high: '#E5484D',
  medium: '#F5A623',
  low: '#46A758',
}

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

const STATUS_ORDER: Record<string, number> = {
  todo: 0,
  in_progress: 1,
  in_review: 2,
  done: 3,
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ChevronsUpDown className="w-3.5 h-3.5 text-[#555A65]" />
  return sortDir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-[#5E6AD2]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#5E6AD2]" />
}

export function TaskListView({ tasks, onTaskClick, filterStatus, filterPriority }: TaskListViewProps) {
  const [sortField, setSortField] = useState<SortField>('status')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterStatus && filterStatus !== 'all' && t.status !== filterStatus) return false
      if (filterPriority && filterPriority !== 'all' && t.priority !== filterPriority) return false
      return true
    })
  }, [tasks, filterStatus, filterPriority])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title)
          break
        case 'status':
          cmp = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
          break
        case 'priority':
          cmp = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)
          break
        case 'due_date': {
          const da = a.due_date ? new Date(a.due_date).getTime() : Infinity
          const db = b.due_date ? new Date(b.due_date).getTime() : Infinity
          cmp = da - db
          break
        }
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
  }, [filtered, sortField, sortDir])

  const thClass = 'px-4 py-3 text-left text-xs font-medium text-[#8A8F98] uppercase tracking-wider cursor-pointer hover:text-[#F7F8F8] select-none'

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#2A2D37]">
            <th className={thClass} onClick={() => handleSort('title')}>
              <div className="flex items-center gap-1.5">
                Titre
                <SortIcon field="title" sortField={sortField} sortDir={sortDir} />
              </div>
            </th>
            <th className={thClass} onClick={() => handleSort('status')}>
              <div className="flex items-center gap-1.5">
                Statut
                <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
              </div>
            </th>
            <th className={thClass} onClick={() => handleSort('priority')}>
              <div className="flex items-center gap-1.5">
                Priorité
                <SortIcon field="priority" sortField={sortField} sortDir={sortDir} />
              </div>
            </th>
            <th className={thClass} onClick={() => handleSort('due_date')}>
              <div className="flex items-center gap-1.5">
                Échéance
                <SortIcon field="due_date" sortField={sortField} sortDir={sortDir} />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#8A8F98] uppercase tracking-wider">
              Labels
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#555A65]">
                Aucune tâche trouvée
              </td>
            </tr>
          ) : (
            sorted.map(task => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date()
              return (
                <tr
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="border-b border-[#2A2D37] hover:bg-[#161922] cursor-pointer transition-colors"
                >
                  {/* Title */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: PRIORITY_COLORS[task.priority] ?? '#8A8F98' }}
                      />
                      <span className="text-sm text-[#F7F8F8] font-medium">{task.title}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: `${STATUS_COLORS[task.status]}20`,
                        color: STATUS_COLORS[task.status] ?? '#8A8F98',
                      }}
                    >
                      {STATUS_LABELS[task.status] ?? task.status}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium" style={{ color: PRIORITY_COLORS[task.priority] ?? '#8A8F98' }}>
                      {PRIORITY_LABELS[task.priority] ?? task.priority}
                    </span>
                  </td>

                  {/* Due date */}
                  <td className="px-4 py-3">
                    {task.due_date ? (
                      <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-[#E5484D]' : 'text-[#8A8F98]'}`}>
                        <CalendarDays className="w-3.5 h-3.5" />
                        {format(new Date(task.due_date), 'd MMM yyyy', { locale: fr })}
                      </div>
                    ) : (
                      <span className="text-xs text-[#555A65]">—</span>
                    )}
                  </td>

                  {/* Labels */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {task.labels && task.labels.length > 0 ? (
                        task.labels.slice(0, 3).map(label => (
                          <span
                            key={label}
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#2A2D37] text-[#8A8F98] border border-[#3A3D47]"
                          >
                            {label}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#555A65]">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

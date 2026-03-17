'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarDays, MessageSquare, CheckSquare, Repeat, Bell } from 'lucide-react'
import type { Task } from '@/types'

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#E5484D',
  high: '#E5484D',
  medium: '#F5A623',
  low: '#46A758',
}

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgent',
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const priorityColor = PRIORITY_COLORS[task.priority] ?? '#8A8F98'
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="bg-[#161922] border border-[#2A2D37] rounded-lg p-3 cursor-pointer hover:border-[#5E6AD2]/50 hover:bg-[#1a1f2e] transition-all group"
    >
      {/* Priority dot + title */}
      <div className="flex items-start gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
          style={{ backgroundColor: priorityColor }}
          title={PRIORITY_LABELS[task.priority]}
        />
        <span className="text-sm text-[#F7F8F8] leading-snug line-clamp-2 flex-1">
          {task.title}
        </span>
      </div>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 ml-4">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#2A2D37] text-[#8A8F98] border border-[#3A3D47]"
            >
              {label}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] text-[#555A65]">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer: due date + meta */}
      <div className="flex items-center gap-3 ml-4 mt-1">
        {(task.due_date || task.next_due_at) && (
          <div className={`flex items-center gap-1 text-[11px] ${isOverdue ? 'text-[#E5484D]' : 'text-[#555A65]'}`}>
            <CalendarDays className="w-3 h-3" />
            <span>
              {task.next_due_at
                ? format(new Date(task.next_due_at), 'd MMM HH:mm', { locale: fr })
                : format(new Date(task.due_date!), 'd MMM', { locale: fr })}
            </span>
          </div>
        )}
        {task.recurrence && (
          <div className="flex items-center gap-1 text-[11px] text-[#5E6AD2]" title={`Récurrence: ${task.recurrence}`}>
            <Repeat className="w-3 h-3" />
          </div>
        )}
        {task.notify_before_minutes != null && (
          <div className="flex items-center gap-1 text-[11px] text-[#F5A623]" title="Rappel Telegram activé">
            <Bell className="w-3 h-3" />
          </div>
        )}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-[#555A65]">
            <CheckSquare className="w-3 h-3" />
            <span>
              {task.subtasks.filter(s => s.is_completed).length}/{task.subtasks.length}
            </span>
          </div>
        )}
        {task.comments && task.comments.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-[#555A65]">
            <MessageSquare className="w-3 h-3" />
            <span>{task.comments.length}</span>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import type { Task, TaskColumn } from '@/types'
import { TaskCard } from './task-card'

interface KanbanColumnProps {
  column: TaskColumn
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onAddTask: (column: TaskColumn) => void
}

const COLUMN_COLORS: Record<string, string> = {
  todo: '#8A8F98',
  in_progress: '#5E6AD2',
  in_review: '#F5A623',
  done: '#46A758',
}

export function KanbanColumn({ column, tasks, onTaskClick, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const statusKey = column.status || ''
  const headerColor = COLUMN_COLORS[statusKey] ?? '#8A8F98'

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: headerColor }} />
          <span className="text-sm font-medium text-[#F7F8F8]">{column.name}</span>
          <span className="text-xs text-[#555A65] bg-[#2A2D37] px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column)}
          className="p-1 rounded text-[#555A65] hover:text-[#F7F8F8] hover:bg-[#2A2D37] transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks list */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 min-h-[200px] rounded-lg p-2 transition-colors ${
          isOver ? 'bg-[#5E6AD2]/10 border border-[#5E6AD2]/30' : 'bg-transparent'
        }`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-[#555A65]">Aucune tâche</span>
          </div>
        )}
      </div>
    </div>
  )
}

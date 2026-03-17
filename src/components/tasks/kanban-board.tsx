'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { Task, TaskColumn } from '@/types'
import { KanbanColumn } from './kanban-column'
import { TaskCard } from './task-card'

interface KanbanBoardProps {
  columns: (TaskColumn & { status?: string })[]
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onAddTask: (column: TaskColumn & { status?: string }) => void
  onTasksChange: (tasks: Task[]) => void
}

const STATUS_MAP: Record<string, string> = {
  todo: 'todo',
  in_progress: 'in_progress',
  in_review: 'in_review',
  done: 'done',
}

export function KanbanBoard({ columns, tasks, onTaskClick, onAddTask, onTasksChange }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const getColumnByTaskId = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    return task?.column_id ?? null
  }, [tasks])

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeTaskId = active.id as string
    const overId = over.id as string

    // Check if over is a column or a task
    const overIsColumn = columns.some(c => c.id === overId)
    const overTask = tasks.find(t => t.id === overId)

    const targetColumnId = overIsColumn ? overId : (overTask?.column_id ?? null)
    const activeTask = tasks.find(t => t.id === activeTaskId)

    if (!activeTask || activeTask.column_id === targetColumnId) return

    // Find the target column's status
    const targetColumn = columns.find(c => c.id === targetColumnId)
    const newStatus = (targetColumn as any)?.status as Task['status'] | undefined

    onTasksChange(
      tasks.map(t =>
        t.id === activeTaskId
          ? { ...t, column_id: targetColumnId, ...(newStatus ? { status: newStatus } : {}) }
          : t
      )
    )
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over || active.id === over.id) return

    const activeTaskId = active.id as string
    const overId = over.id as string

    const overIsColumn = columns.some(c => c.id === overId)
    const overTask = tasks.find(t => t.id === overId)

    const targetColumnId = overIsColumn ? overId : (overTask?.column_id ?? null)
    const activeTask = tasks.find(t => t.id === activeTaskId)

    if (!activeTask) return

    const targetColumn = columns.find(c => c.id === targetColumnId)
    const newStatus = (targetColumn as any)?.status as Task['status'] | undefined

    // Reorder within same column or move to new column
    const columnTasks = tasks
      .filter(t => t.column_id === targetColumnId)
      .sort((a, b) => a.position - b.position)

    let newTasks = [...tasks]

    if (activeTask.column_id !== targetColumnId) {
      // Cross-column move
      newTasks = newTasks.map(t =>
        t.id === activeTaskId
          ? { ...t, column_id: targetColumnId, ...(newStatus ? { status: newStatus } : {}) }
          : t
      )

      // Persist column change + status
      await fetch(`/api/tasks/${activeTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          column_id: targetColumnId,
          ...(newStatus ? { status: newStatus } : {}),
        }),
      })
    } else if (!overIsColumn) {
      // Same column reorder
      const activeIdx = columnTasks.findIndex(t => t.id === activeTaskId)
      const overIdx = columnTasks.findIndex(t => t.id === overId)

      if (activeIdx !== -1 && overIdx !== -1) {
        const reordered = arrayMove(columnTasks, activeIdx, overIdx)

        // Update positions
        const updates = reordered.map((t, idx) => ({ ...t, position: idx }))
        newTasks = newTasks.map(t => {
          const updated = updates.find(u => u.id === t.id)
          return updated ?? t
        })

        // Persist new positions
        await Promise.all(
          updates.map(t =>
            fetch(`/api/tasks/${t.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ position: t.position }),
            })
          )
        )
      }
    }

    onTasksChange(newTasks)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 h-full overflow-x-auto pb-4">
        {columns.map(column => {
          const columnTasks = tasks
            .filter(t => t.column_id === column.id)
            .sort((a, b) => a.position - b.position)

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-2 opacity-90">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

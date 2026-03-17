'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { LayoutGrid, List, Plus, FolderOpen } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ProjectHeader } from '@/components/layout/project-header'
import { KanbanBoard } from '@/components/tasks/kanban-board'
import { TaskListView } from '@/components/tasks/task-list-view'
import { TaskDetail } from '@/components/tasks/task-detail'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import type { Task, TaskColumn, TaskView } from '@/types'

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'todo', label: 'A faire' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'in_review', label: 'En revue' },
  { value: 'done', label: 'Terminé' },
]

const PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'Toutes priorités' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'Haute' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'low', label: 'Basse' },
]

export default function TasksPage() {
  const { id } = useParams<{ id: string }>()
  const rawProject = useStore(s => s.projects.find(p => p.id === id))
  const project = rawProject
    ? { ...rawProject, status: rawProject.status || ('active' as const) }
    : undefined

  const [view, setView] = useState<TaskView>('kanban')
  const [columns, setColumns] = useState<TaskColumn[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [createModal, setCreateModal] = useState<{
    open: boolean
    columnId?: string
    status?: string
  }>({ open: false })

  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const [colRes, taskRes] = await Promise.all([
        fetch(`/api/tasks/columns?project_id=${id}`),
        fetch(`/api/tasks?project_id=${id}`),
      ])

      if (!colRes.ok || !taskRes.ok) {
        setError('Erreur lors du chargement des données')
        return
      }

      const { data: cols } = await colRes.json()
      const { data: tks } = await taskRes.json()

      setColumns(cols ?? [])
      setTasks(tks ?? [])
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTaskClick = useCallback(async (task: Task) => {
    // Load full task with subtasks + comments via API
    const res = await fetch(`/api/tasks/${task.id}`)
    if (res.ok) {
      const { data } = await res.json()
      setSelectedTask(data)
    } else {
      setSelectedTask(task)
    }
  }, [])

  const handleTaskUpdate = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      const { data } = await res.json()
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...data } : t))
      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, ...data } : null)
      }
    }
  }, [selectedTask])

  const handleTaskDelete = useCallback(async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    if (res.ok) {
      setTasks(prev => prev.filter(t => t.id !== taskId))
      setSelectedTask(null)
    }
  }, [])

  const handleTaskCreated = useCallback((task: Task) => {
    setTasks(prev => [...prev, task])
  }, [])

  const handleAddTaskFromColumn = useCallback((column: TaskColumn) => {
    setCreateModal({
      open: true,
      columnId: column.id,
      status: column.status || 'todo',
    })
  }, [])

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

  return (
    <>
      <ProjectHeader project={project} />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#2A2D37] bg-[#0F1115]">
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-[#1F232E] border border-[#2A2D37] rounded-lg p-0.5">
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'kanban'
                  ? 'bg-[#2A2D37] text-[#F7F8F8]'
                  : 'text-[#8A8F98] hover:text-[#F7F8F8]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'list'
                  ? 'bg-[#2A2D37] text-[#F7F8F8]'
                  : 'text-[#8A8F98] hover:text-[#F7F8F8]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Liste
            </button>
          </div>

          {/* Filters */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-1.5 text-xs text-[#8A8F98] outline-none focus:border-[#5E6AD2] transition-colors"
          >
            {STATUS_FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-1.5 text-xs text-[#8A8F98] outline-none focus:border-[#5E6AD2] transition-colors"
          >
            {PRIORITY_FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <span className="text-xs text-[#555A65]">
            {tasks.length} tâche{tasks.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Create task button */}
        <button
          onClick={() => setCreateModal({ open: true })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5E6AD2] hover:bg-[#7A82E0] text-white text-xs font-medium rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nouvelle tâche
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#5E6AD2] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[#555A65]">Chargement...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-[#E5484D] mb-3">{error}</p>
              <button
                onClick={fetchData}
                className="px-4 py-2 text-sm bg-[#2A2D37] hover:bg-[#3A3D47] text-[#F7F8F8] rounded-md transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : view === 'kanban' ? (
          <div className="flex-1 overflow-auto px-6 py-5">
            <KanbanBoard
              columns={columns}
              tasks={filterTasks(tasks, filterStatus, filterPriority)}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTaskFromColumn}
              onTasksChange={setTasks}
            />
          </div>
        ) : (
          <TaskListView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            filterStatus={filterStatus}
            filterPriority={filterPriority}
          />
        )}
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}

      {/* Create task modal */}
      {createModal.open && (
        <CreateTaskModal
          projectId={id}
          defaultColumnId={createModal.columnId}
          defaultStatus={createModal.status}
          onClose={() => setCreateModal({ open: false })}
          onCreate={handleTaskCreated}
        />
      )}
    </>
  )
}

function filterTasks(tasks: Task[], status: string, priority: string): Task[] {
  return tasks.filter(t => {
    if (status && status !== 'all' && t.status !== status) return false
    if (priority && priority !== 'all' && t.priority !== priority) return false
    return true
  })
}

'use client'

import { useState } from 'react'
import { useStore, type Task } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { generateId } from '@/lib/utils'
import { Plus, MoreHorizontal, Trash2, GripVertical } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface KanbanBoardProps {
  projectId: string
}

type TaskStatus = 'todo' | 'in_progress' | 'done'

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'À faire' },
  { id: 'in_progress', title: 'En cours' },
  { id: 'done', title: 'Terminé' },
]

const PRIORITY_COLORS = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks, addTask, updateTask, deleteTask, getTasksByProject } = useStore()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')

  const projectTasks = getTasksByProject(projectId)

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: generateId(),
      title: newTaskTitle,
      description: newTaskDescription || null,
      status: 'todo',
      priority: newTaskPriority,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    addTask(newTask)
    resetForm()
    setIsCreateOpen(false)
  }

  const handleEditTask = () => {
    if (!editingTask || !newTaskTitle.trim()) return

    updateTask(editingTask.id, {
      title: newTaskTitle,
      description: newTaskDescription || null,
      priority: newTaskPriority,
    })

    setEditingTask(null)
    resetForm()
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setNewTaskTitle(task.title)
    setNewTaskDescription(task.description || '')
    setNewTaskPriority(task.priority)
    setIsCreateOpen(true)
  }

  const resetForm = () => {
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskPriority('medium')
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Supprimer cette tâche ?')) {
      deleteTask(taskId)
    }
  }

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus })
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return projectTasks.filter((task) => task.status === status)
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Tâches</h2>
        <Button
          onClick={() => {
            resetForm()
            setEditingTask(null)
            setIsCreateOpen(true)
          }}
          size="sm"
          className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 h-[calc(100vh-280px)]">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className="bg-[#161922] rounded-lg border border-[#2A2D37] flex flex-col"
          >
            <div className="p-3 border-b border-[#2A2D37]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#F7F8F8]">{column.title}</h3>
                <span className="text-xs text-[#8A8F98] bg-[#0F1115] px-2 py-0.5 rounded-full">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-y-auto scrollbar-thin">
              {getTasksByStatus(column.id).map((task) => (
                <div
                  key={task.id}
                  className="group bg-[#1F232E] rounded-md p-3 border border-[#2A2D37] hover:border-[#5E6AD2]/50 transition-colors cursor-pointer"
                  onClick={() => openEditDialog(task)}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#F7F8F8] font-medium truncate">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-[#8A8F98] mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[task.priority]}`}
                          title={`Priorité: ${task.priority}`}
                        />
                        <span className="text-xs text-[#8A8F98] capitalize">
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2A2D37] rounded transition-opacity"
                        >
                          <MoreHorizontal className="w-3 h-3 text-[#8A8F98]" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1F232E] border-[#2A2D37]">
                        {column.id !== 'todo' && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              moveTask(task.id, 'todo')
                            }}
                            className="text-[#F7F8F8] focus:bg-[#2A2D37]"
                          >
                            Déplacer vers À faire
                          </DropdownMenuItem>
                        )}
                        {column.id !== 'in_progress' && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              moveTask(task.id, 'in_progress')
                            }}
                            className="text-[#F7F8F8] focus:bg-[#2A2D37]"
                          >
                            Déplacer vers En cours
                          </DropdownMenuItem>
                        )}
                        {column.id !== 'done' && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              moveTask(task.id, 'done')
                            }}
                            className="text-[#F7F8F8] focus:bg-[#2A2D37]"
                          >
                            Déplacer vers Terminé
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTask(task.id)
                          }}
                          className="text-red-400 focus:bg-[#2A2D37]"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Task Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#161922] border-[#2A2D37] text-white">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Titre de la tâche"
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Description (optionnel)"
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </Select>
            </div>
            {editingTask && (
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={editingTask.status}
                  onChange={(e) => updateTask(editingTask.id, { status: e.target.value as TaskStatus })}
                  className="bg-[#0F1115] border-[#2A2D37] text-white"
                >
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="done">Terminé</option>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false)
                setEditingTask(null)
                resetForm()
              }}
              className="border-[#2A2D37] text-[#F7F8F8] hover:bg-[#1F232E]"
            >
              Annuler
            </Button>
            <Button
              onClick={editingTask ? handleEditTask : handleCreateTask}
              className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
            >
              {editingTask ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

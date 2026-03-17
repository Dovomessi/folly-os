'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Trash2, Send } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Task, Subtask, TaskComment } from '@/types'
import { SubtaskList } from './subtask-list'
import { Button } from '@/components/ui/button'

interface TaskDetailProps {
  task: Task | null
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'A faire' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'in_review', label: 'En revue' },
  { value: 'done', label: 'Terminé' },
]

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent', color: '#E5484D' },
  { value: 'high', label: 'Haute', color: '#E5484D' },
  { value: 'medium', label: 'Moyenne', color: '#F5A623' },
  { value: 'low', label: 'Basse', color: '#46A758' },
]

export function TaskDetail({ task, onClose, onUpdate, onDelete }: TaskDetailProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Task['status']>('todo')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [dueDate, setDueDate] = useState('')
  const [labelsInput, setLabelsInput] = useState('')
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [comments, setComments] = useState<TaskComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [postingComment, setPostingComment] = useState(false)

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description ?? '')
    setStatus(task.status)
    setPriority(task.priority)
    setDueDate(task.due_date ?? '')
    setLabelsInput(task.labels?.join(', ') ?? '')
    loadSubtasks(task.id)
    loadComments(task.id)
  }, [task?.id])

  const loadSubtasks = async (taskId: string) => {
    const res = await fetch(`/api/tasks/subtasks?task_id=${taskId}`)
    if (res.ok) {
      const { data } = await res.json()
      setSubtasks(data ?? [])
    }
  }

  const loadComments = async (taskId: string) => {
    const res = await fetch(`/api/tasks/comments?task_id=${taskId}`)
    if (res.ok) {
      const { data } = await res.json()
      setComments(data ?? [])
    }
  }

  const handleSave = useCallback(async (field: string, value: unknown) => {
    if (!task) return
    setSaving(true)
    try {
      await onUpdate(task.id, { [field]: value } as Partial<Task>)
    } finally {
      setSaving(false)
    }
  }, [task, onUpdate])

  const handleTitleBlur = () => {
    if (task && title !== task.title && title.trim()) {
      handleSave('title', title.trim())
    }
  }

  const handleDescriptionBlur = () => {
    if (task && description !== (task.description ?? '')) {
      handleSave('description', description || null)
    }
  }

  const handleStatusChange = (val: string) => {
    setStatus(val as Task['status'])
    handleSave('status', val)
  }

  const handlePriorityChange = (val: string) => {
    setPriority(val as Task['priority'])
    handleSave('priority', val)
  }

  const handleDueDateChange = (val: string) => {
    setDueDate(val)
    handleSave('due_date', val || null)
  }

  const handleLabelsBlur = () => {
    if (!task) return
    const labels = labelsInput
      .split(',')
      .map(l => l.trim())
      .filter(Boolean)
    const current = task.labels?.join(', ') ?? ''
    if (labelsInput !== current) {
      handleSave('labels', labels)
    }
  }

  const handleDelete = async () => {
    if (!task || !confirm('Supprimer cette tâche ?')) return
    setDeleting(true)
    try {
      await onDelete(task.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  const handleAddSubtask = async (title: string) => {
    if (!task) return
    const res = await fetch('/api/tasks/subtasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, task_id: task.id }),
    })
    if (res.ok) {
      const { data } = await res.json()
      setSubtasks(prev => [...prev, data])
    }
  }

  const handleToggleSubtask = async (subtask: Subtask) => {
    const res = await fetch('/api/tasks/subtasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: subtask.id, is_completed: !subtask.is_completed }),
    })
    if (res.ok) {
      setSubtasks(prev =>
        prev.map(s => s.id === subtask.id ? { ...s, is_completed: !s.is_completed } : s)
      )
    }
  }

  const handleDeleteSubtask = async (id: string) => {
    const res = await fetch(`/api/tasks/subtasks?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSubtasks(prev => prev.filter(s => s.id !== id))
    }
  }

  const handlePostComment = async () => {
    if (!task || !newComment.trim()) return
    setPostingComment(true)
    try {
      const res = await fetch('/api/tasks/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim(), task_id: task.id }),
      })
      if (res.ok) {
        const { data } = await res.json()
        setComments(prev => [...prev, data])
        setNewComment('')
      }
    } finally {
      setPostingComment(false)
    }
  }

  const handleDeleteComment = async (id: string) => {
    const res = await fetch(`/api/tasks/comments?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setComments(prev => prev.filter(c => c.id !== id))
    }
  }

  if (!task) return null

  const priorityColor = PRIORITY_OPTIONS.find(p => p.value === priority)?.color ?? '#8A8F98'

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="w-[560px] bg-[#161922] border-l border-[#2A2D37] flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2D37]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: priorityColor }} />
            {saving && <span className="text-xs text-[#555A65]">Sauvegarde...</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 rounded text-[#555A65] hover:text-[#E5484D] hover:bg-[#E5484D]/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded text-[#555A65] hover:text-[#F7F8F8] hover:bg-[#2A2D37] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="text-xl font-semibold text-[#F7F8F8] bg-transparent outline-none w-full placeholder-[#555A65] border-b border-transparent focus:border-[#2A2D37] pb-1 transition-colors"
            placeholder="Titre de la tâche"
          />

          {/* Meta fields row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="text-xs text-[#8A8F98] uppercase tracking-wider mb-1.5 block">Statut</label>
              <select
                value={status}
                onChange={e => handleStatusChange(e.target.value)}
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] outline-none focus:border-[#5E6AD2] transition-colors"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs text-[#8A8F98] uppercase tracking-wider mb-1.5 block">Priorité</label>
              <select
                value={priority}
                onChange={e => handlePriorityChange(e.target.value)}
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] outline-none focus:border-[#5E6AD2] transition-colors"
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Due date */}
            <div>
              <label className="text-xs text-[#8A8F98] uppercase tracking-wider mb-1.5 block">Échéance</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => handleDueDateChange(e.target.value)}
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] outline-none focus:border-[#5E6AD2] transition-colors"
              />
            </div>

            {/* Labels */}
            <div>
              <label className="text-xs text-[#8A8F98] uppercase tracking-wider mb-1.5 block">Labels</label>
              <input
                type="text"
                value={labelsInput}
                onChange={e => setLabelsInput(e.target.value)}
                onBlur={handleLabelsBlur}
                placeholder="tag1, tag2, ..."
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] placeholder-[#555A65] outline-none focus:border-[#5E6AD2] transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[#8A8F98] uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Ajouter une description..."
              rows={4}
              className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] placeholder-[#555A65] outline-none focus:border-[#5E6AD2] transition-colors resize-none"
            />
          </div>

          {/* Subtasks */}
          <div className="border-t border-[#2A2D37] pt-4">
            <SubtaskList
              subtasks={subtasks}
              onAdd={handleAddSubtask}
              onToggle={handleToggleSubtask}
              onDelete={handleDeleteSubtask}
            />
          </div>

          {/* Comments */}
          <div className="border-t border-[#2A2D37] pt-4">
            <span className="text-xs font-medium text-[#8A8F98] uppercase tracking-wider mb-3 block">
              Commentaires ({comments.length})
            </span>

            <div className="flex flex-col gap-3 mb-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-2 group">
                  <div className="w-6 h-6 rounded-full bg-[#5E6AD2] flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                    M
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#555A65]">
                        {format(new Date(comment.created_at), 'd MMM yyyy à HH:mm', { locale: fr })}
                      </span>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#555A65] hover:text-[#E5484D] transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm text-[#F7F8F8] mt-0.5 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* New comment */}
            <div className="flex gap-2">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePostComment()
                }}
                placeholder="Ajouter un commentaire... (Ctrl+Enter pour envoyer)"
                rows={2}
                className="flex-1 bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] placeholder-[#555A65] outline-none focus:border-[#5E6AD2] transition-colors resize-none"
              />
              <button
                onClick={handlePostComment}
                disabled={postingComment || !newComment.trim()}
                className="p-2 rounded-md bg-[#5E6AD2] hover:bg-[#7A82E0] disabled:bg-[#2A2D37] disabled:cursor-not-allowed text-white transition-colors self-end"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

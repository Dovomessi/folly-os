'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Task, TaskColumn } from '@/types'
import { Button } from '@/components/ui/button'

interface CreateTaskModalProps {
  projectId: string
  defaultColumnId?: string
  defaultStatus?: string
  onClose: () => void
  onCreate: (task: Task) => void
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'A faire' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'in_review', label: 'En revue' },
  { value: 'done', label: 'Terminé' },
]

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'Haute' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'low', label: 'Basse' },
]

export function CreateTaskModal({ projectId, defaultColumnId, defaultStatus, onClose, onCreate }: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState(defaultStatus || 'todo')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [labels, setLabels] = useState('')
  const [description, setDescription] = useState('')
  const [recurrence, setRecurrence] = useState('')
  const [notifyBefore, setNotifyBefore] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const needsTime = recurrence || notifyBefore

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Le titre est requis')
      return
    }
    if (needsTime && dueDate && !dueTime) {
      setError('L\'heure est requise pour les tâches récurrentes ou avec rappel')
      return
    }
    if (needsTime && !dueDate) {
      setError('La date est requise pour les tâches récurrentes ou avec rappel')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority,
          due_date: dueDate || null,
          labels: labels.split(',').map(l => l.trim()).filter(Boolean),
          column_id: defaultColumnId || null,
          project_id: projectId,
          recurrence: recurrence || null,
          next_due_at: dueDate && dueTime ? new Date(`${dueDate}T${dueTime}`).toISOString() : (dueDate ? new Date(`${dueDate}T09:00`).toISOString() : null),
          notify_before_minutes: notifyBefore ? parseInt(notifyBefore) : null,
          notify_channels: notifyBefore ? ['telegram'] : [],
        }),
      })

      if (!res.ok) {
        const { error: err } = await res.json()
        setError(err || 'Erreur lors de la création')
        return
      }

      const { data } = await res.json()
      onCreate(data)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#161922] border border-[#2A2D37] rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2D37]">
          <h2 className="text-base font-semibold text-[#F7F8F8]">Nouvelle tâche</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#555A65] hover:text-[#F7F8F8] hover:bg-[#2A2D37] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="text-xs text-[#8A8F98] uppercase tracking-wider mb-1.5 block">
              Titre <span className="text-[#E5484D]">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Titre de la tâche"
              className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] placeholder-[#555A65] outline-none focus:border-[#5E6AD2] transition-colors"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#8A8F98] uppercase tracking-wider mb-1.5 block">Statut</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] outline-none focus:border-[#5E6AD2] transition-colors"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8A8F98] uppercase tracking-wider mb-1.5 block">Priorité</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] outline-none focus:border-[#5E6AD2] transition-colors"
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date + time + Labels */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-[#8A8F98] uppercase tracking-wider mb-1.5 block">
                Date {needsTime && <span className="text-[#E5484D]">*</span>}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] outline-none focus:border-[#5E6AD2] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[#8A8F98] uppercase tracking-wider mb-1.5 block">
                Heure {needsTime && <span className="text-[#E5484D]">*</span>}
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] outline-none focus:border-[#5E6AD2] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[#8A8F98] uppercase tracking-wider mb-1.5 block">Labels</label>
              <input
                type="text"
                value={labels}
                onChange={e => setLabels(e.target.value)}
                placeholder="tag1, tag2"
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] placeholder-[#555A65] outline-none focus:border-[#5E6AD2] transition-colors"
              />
            </div>
          </div>

          {/* Recurrence + Notification */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#8A8F98] uppercase tracking-wider mb-1.5 block">Récurrence</label>
              <select
                value={recurrence}
                onChange={e => setRecurrence(e.target.value)}
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] outline-none focus:border-[#5E6AD2] transition-colors"
              >
                <option value="">Aucune</option>
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="biweekly">Bi-hebdomadaire</option>
                <option value="monthly">Mensuelle</option>
                <option value="quarterly">Trimestrielle</option>
                <option value="yearly">Annuelle</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8A8F98] uppercase tracking-wider mb-1.5 block">Rappel Telegram</label>
              <select
                value={notifyBefore}
                onChange={e => setNotifyBefore(e.target.value)}
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] outline-none focus:border-[#5E6AD2] transition-colors"
              >
                <option value="">Aucun</option>
                <option value="0">Au moment</option>
                <option value="15">15 min avant</option>
                <option value="30">30 min avant</option>
                <option value="60">1h avant</option>
                <option value="120">2h avant</option>
                <option value="1440">1 jour avant</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[#8A8F98] uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description optionnelle..."
              rows={3}
              className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] placeholder-[#555A65] outline-none focus:border-[#5E6AD2] transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-[#E5484D]">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#8A8F98] hover:text-[#F7F8F8] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="px-4 py-2 text-sm bg-[#5E6AD2] hover:bg-[#7A82E0] disabled:bg-[#2A2D37] disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              {submitting ? 'Création...' : 'Créer la tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

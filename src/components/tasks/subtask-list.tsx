'use client'

import { useState } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import type { Subtask } from '@/types'

interface SubtaskListProps {
  subtasks: Subtask[]
  onAdd: (title: string) => Promise<void>
  onToggle: (subtask: Subtask) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function SubtaskList({ subtasks, onAdd, onToggle, onDelete }: SubtaskListProps) {
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [showInput, setShowInput] = useState(false)

  const completed = subtasks.filter(s => s.is_completed).length

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      await onAdd(newTitle.trim())
      setNewTitle('')
      setShowInput(false)
    } finally {
      setAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') {
      setShowInput(false)
      setNewTitle('')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#8A8F98] uppercase tracking-wider">
          Sous-tâches {subtasks.length > 0 && `(${completed}/${subtasks.length})`}
        </span>
        <button
          onClick={() => setShowInput(true)}
          className="p-1 rounded text-[#555A65] hover:text-[#F7F8F8] hover:bg-[#2A2D37] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div className="h-1 bg-[#2A2D37] rounded-full mb-3">
          <div
            className="h-full bg-[#46A758] rounded-full transition-all"
            style={{ width: `${(completed / subtasks.length) * 100}%` }}
          />
        </div>
      )}

      {/* Subtask items */}
      <div className="flex flex-col gap-1">
        {subtasks.map(subtask => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 group py-1 px-2 rounded hover:bg-[#2A2D37] transition-colors"
          >
            <button
              onClick={() => onToggle(subtask)}
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                subtask.is_completed
                  ? 'bg-[#46A758] border-[#46A758]'
                  : 'border-[#2A2D37] hover:border-[#5E6AD2]'
              }`}
            >
              {subtask.is_completed && <Check className="w-2.5 h-2.5 text-white" />}
            </button>
            <span className={`text-sm flex-1 ${subtask.is_completed ? 'line-through text-[#555A65]' : 'text-[#F7F8F8]'}`}>
              {subtask.title}
            </span>
            <button
              onClick={() => onDelete(subtask.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#555A65] hover:text-[#E5484D] transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add input */}
      {showInput && (
        <div className="flex items-center gap-2 mt-2 pl-2">
          <div className="w-4 h-4 rounded border border-[#2A2D37] shrink-0" />
          <input
            autoFocus
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nouvelle sous-tâche..."
            className="flex-1 bg-transparent text-sm text-[#F7F8F8] placeholder-[#555A65] outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newTitle.trim()}
            className="text-xs text-[#5E6AD2] hover:text-[#7A82E0] disabled:text-[#555A65] disabled:cursor-not-allowed transition-colors"
          >
            {adding ? '...' : 'Ajouter'}
          </button>
          <button
            onClick={() => { setShowInput(false); setNewTitle('') }}
            className="text-xs text-[#555A65] hover:text-[#F7F8F8] transition-colors"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  )
}

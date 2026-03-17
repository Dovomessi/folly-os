'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { NoteEditor } from '@/components/notes/note-editor'
import {
  ArrowLeft,
  Pin,
  Trash2,
  Save,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import type { Note } from '@/types'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function NoteEditorPage() {
  const { id: projectId, noteId } = useParams<{ id: string; noteId: string }>()
  const router = useRouter()

  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [deleting, setDeleting] = useState(false)

  const titleDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingUpdates = useRef<Partial<Note>>({})

  const rawProject = useStore(s => s.projects.find(p => p.id === projectId))

  const fetchNote = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/notes/${noteId}`)
    if (res.ok) {
      const json = await res.json()
      setNote(json.data)
      setTitle(json.data.title || '')
    } else if (res.status === 404) {
      router.push(`/projects/${projectId}/notes`)
    }
    setLoading(false)
  }, [noteId, projectId, router])

  useEffect(() => {
    fetchNote()
  }, [fetchNote])

  const saveNote = useCallback(async (updates: Partial<Note>) => {
    if (!note) return
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const json = await res.json()
        setNote(json.data)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    }
  }, [note, noteId])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (titleDebounceTimer.current) clearTimeout(titleDebounceTimer.current)
    titleDebounceTimer.current = setTimeout(() => {
      saveNote({ title: value })
    }, 1000)
  }

  const handleEditorUpdate = (content: string, contentHtml: string, wordCount: number) => {
    saveNote({ content, content_html: contentHtml, word_count: wordCount })
  }

  const handleTogglePin = async () => {
    if (!note) return
    const newPinned = !note.is_pinned
    setNote(prev => prev ? { ...prev, is_pinned: newPinned } : null)
    await saveNote({ is_pinned: newPinned })
  }

  const handleDelete = async () => {
    if (!note) return
    if (!window.confirm('Supprimer cette note définitivement ?')) return
    setDeleting(true)
    const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push(`/projects/${projectId}/notes`)
    }
    setDeleting(false)
  }

  useEffect(() => {
    return () => {
      if (titleDebounceTimer.current) clearTimeout(titleDebounceTimer.current)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#5E6AD2] animate-spin" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#8A8F98]">
        Note introuvable
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#0F1115]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#2A2D37] bg-[#0F1115] shrink-0">
        {/* Left: Back + project name */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/projects/${projectId}/notes`)}
            className="flex items-center gap-1.5 text-sm text-[#8A8F98] hover:text-[#F7F8F8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {rawProject?.name || 'Notes'}
          </button>
        </div>

        {/* Right: Save status + actions */}
        <div className="flex items-center gap-2">
          {/* Save status */}
          <div className="flex items-center gap-1.5 text-xs text-[#555A65] min-w-[80px] justify-end">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sauvegarde...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#46A758]" />
                <span className="text-[#46A758]">Sauvegardé</span>
              </>
            )}
            {saveStatus === 'error' && (
              <span className="text-[#EF4444]">Erreur de sauvegarde</span>
            )}
          </div>

          {/* Pin */}
          <button
            onClick={handleTogglePin}
            title={note.is_pinned ? 'Désépingler' : 'Épingler'}
            className={`p-2 rounded-lg transition-colors ${
              note.is_pinned
                ? 'bg-[#5E6AD2]/15 text-[#5E6AD2]'
                : 'text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-[#2A2D37]'
            }`}
          >
            <Pin className={`w-4 h-4 ${note.is_pinned ? 'fill-[#5E6AD2]' : ''}`} />
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Supprimer la note"
            className="p-2 rounded-lg text-[#8A8F98] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-8 pt-6 pb-2 shrink-0">
        <input
          type="text"
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Sans titre"
          autoFocus
          className="w-full text-3xl font-bold text-[#F7F8F8] bg-transparent border-none outline-none placeholder:text-[#555A65] leading-tight"
        />
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 bg-[#0F1115]">
        <NoteEditor
          content={note.content_html || note.content || ''}
          onUpdate={handleEditorUpdate}
        />
      </div>

      {/* Footer: word count + last updated */}
      <div className="flex items-center justify-between px-8 py-2 border-t border-[#2A2D37] shrink-0">
        <span className="text-xs text-[#555A65]">
          {note.word_count > 0 ? `${note.word_count} mots` : '0 mot'}
        </span>
        <span className="text-xs text-[#555A65]">
          Modifié {new Date(note.updated_at).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}

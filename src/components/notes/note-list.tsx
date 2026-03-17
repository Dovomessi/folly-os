'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, SortAsc, Calendar, FileText } from 'lucide-react'
import { NoteCard } from './note-card'
import type { Note } from '@/types'

type SortOption = 'updated_at' | 'title' | 'created_at'

interface NoteListProps {
  projectId: string
}

export function NoteList({ projectId }: NoteListProps) {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('updated_at')
  const [creating, setCreating] = useState(false)

  const fetchNotes = useCallback(async (searchQuery?: string) => {
    setLoading(true)
    const params = new URLSearchParams({ project_id: projectId })
    if (searchQuery) params.set('search', searchQuery)

    const res = await fetch(`/api/notes?${params}`)
    if (res.ok) {
      const json = await res.json()
      setNotes(json.data || [])
    }
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes(search || undefined)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, fetchNotes])

  const handleCreate = async () => {
    setCreating(true)
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Nouvelle note',
        content: '',
        content_html: '',
        project_id: projectId,
      }),
    })
    if (res.ok) {
      const json = await res.json()
      router.push(`/projects/${projectId}/notes/${json.data.id}`)
    }
    setCreating(false)
  }

  const handleTogglePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation()
    const res = await fetch(`/api/notes/${note.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_pinned: !note.is_pinned }),
    })
    if (res.ok) {
      setNotes(prev =>
        prev.map(n => n.id === note.id ? { ...n, is_pinned: !n.is_pinned } : n)
      )
    }
  }

  const sortedNotes = [...notes].sort((a, b) => {
    // Pinned first
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1

    if (sortBy === 'title') {
      return a.title.localeCompare(b.title, 'fr')
    }
    if (sortBy === 'created_at') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    // updated_at default
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-7 py-4 border-b border-[#2A2D37]">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555A65]" />
          <input
            type="text"
            placeholder="Rechercher une note..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#161922] border border-[#2A2D37] rounded-lg text-sm text-[#F7F8F8] placeholder:text-[#555A65] focus:outline-none focus:border-[#5E6AD2] transition-colors"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <SortAsc className="w-4 h-4 text-[#555A65]" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="bg-[#161922] border border-[#2A2D37] rounded-lg text-sm text-[#8A8F98] px-2 py-2 focus:outline-none focus:border-[#5E6AD2] cursor-pointer"
          >
            <option value="updated_at">Date modif.</option>
            <option value="created_at">Date création</option>
            <option value="title">Titre</option>
          </select>
        </div>

        {/* Create button */}
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-[#5E6AD2] hover:bg-[#6B76E0] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Nouvelle note
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-7 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#161922] border border-[#2A2D37] rounded-xl p-4 animate-pulse h-36"
              />
            ))}
          </div>
        ) : sortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="w-14 h-14 text-[#2A2D37] mb-4" />
            <h3 className="text-base font-medium text-[#8A8F98] mb-1">
              {search ? 'Aucune note trouvée' : 'Aucune note'}
            </h3>
            <p className="text-sm text-[#555A65]">
              {search
                ? 'Essayez un autre terme de recherche'
                : 'Créez votre première note pour commencer'}
            </p>
            {!search && (
              <button
                onClick={handleCreate}
                disabled={creating}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#5E6AD2] hover:bg-[#6B76E0] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvelle note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => router.push(`/projects/${projectId}/notes/${note.id}`)}
                onTogglePin={e => handleTogglePin(note, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

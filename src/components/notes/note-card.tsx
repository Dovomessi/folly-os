'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Pin, FileText } from 'lucide-react'
import type { Note } from '@/types'

interface NoteCardProps {
  note: Note
  onClick: () => void
  onTogglePin: (e: React.MouseEvent) => void
}

export function NoteCard({ note, onClick, onTogglePin }: NoteCardProps) {
  // Strip HTML tags to get plain text preview
  const getTextPreview = (html: string) => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  const preview = getTextPreview(note.content_html || note.content)

  return (
    <div
      onClick={onClick}
      className="bg-[#161922] border border-[#2A2D37] rounded-xl p-4 cursor-pointer hover:border-[#5E6AD2]/50 hover:bg-[#1a1f2e] transition-all group relative flex flex-col gap-3"
    >
      {/* Pin indicator */}
      {note.is_pinned && (
        <div className="absolute top-3 right-3">
          <Pin className="w-3.5 h-3.5 text-[#5E6AD2] fill-[#5E6AD2]" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-2 pr-6">
        <FileText className="w-4 h-4 text-[#5E6AD2] mt-0.5 shrink-0" />
        <h3 className="text-sm font-semibold text-[#F7F8F8] leading-snug line-clamp-2 flex-1">
          {note.title || 'Sans titre'}
        </h3>
      </div>

      {/* Preview */}
      {preview && (
        <p className="text-xs text-[#8A8F98] leading-relaxed line-clamp-3 ml-6">
          {preview}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between ml-6 mt-auto">
        <span className="text-[11px] text-[#555A65]">
          {format(new Date(note.updated_at), 'd MMM yyyy', { locale: fr })}
        </span>
        {note.word_count > 0 && (
          <span className="text-[11px] text-[#555A65]">
            {note.word_count} mots
          </span>
        )}
      </div>

      {/* Pin toggle button (hover) */}
      <button
        onClick={onTogglePin}
        className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-[#2A2D37] ${
          note.is_pinned ? 'opacity-100' : ''
        }`}
        title={note.is_pinned ? 'Désépingler' : 'Épingler'}
      >
        <Pin
          className={`w-3.5 h-3.5 transition-colors ${
            note.is_pinned
              ? 'text-[#5E6AD2] fill-[#5E6AD2]'
              : 'text-[#8A8F98] hover:text-[#5E6AD2]'
          }`}
        />
      </button>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useStore, type Note } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { generateId, formatDate } from '@/lib/utils'
import { Plus, FileText, Trash2, MoreVertical, Clock } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface NotesViewProps {
  projectId: string
}

export function NotesView({ projectId }: NotesViewProps) {
  const { notes, addNote, updateNote, deleteNote, getNotesByProject } = useStore()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  const projectNotes = getNotesByProject(projectId)

  const handleCreate = () => {
    if (!newTitle.trim()) return

    const newNote: Note = {
      id: generateId(),
      title: newTitle,
      content: newContent,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    addNote(newNote)
    resetForm()
    setIsCreateOpen(false)
  }

  const handleEdit = () => {
    if (!editingNote || !newTitle.trim()) return

    updateNote(editingNote.id, {
      title: newTitle,
      content: newContent,
    })

    setEditingNote(null)
    resetForm()
    setIsCreateOpen(false)
  }

  const openEditDialog = (note: Note) => {
    setEditingNote(note)
    setNewTitle(note.title)
    setNewContent(note.content)
    setIsCreateOpen(true)
  }

  const resetForm = () => {
    setNewTitle('')
    setNewContent('')
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette note ?')) {
      deleteNote(id)
    }
  }

  // Sort by updated_at desc
  const sortedNotes = [...projectNotes].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Notes</h2>
        <Button
          onClick={() => {
            resetForm()
            setEditingNote(null)
            setIsCreateOpen(true)
          }}
          size="sm"
          className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle note
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
        {sortedNotes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[#8A8F98]">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune note</p>
            <p className="text-sm mt-1">Créez votre première note</p>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => openEditDialog(note)}
              className="group bg-[#161922] rounded-lg border border-[#2A2D37] p-4 hover:border-[#5E6AD2]/50 transition-colors cursor-pointer flex flex-col"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-[#F7F8F8] font-medium line-clamp-1">{note.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2A2D37] rounded transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4 text-[#8A8F98]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1F232E] border-[#2A2D37]">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditDialog(note)
                      }}
                      className="text-[#F7F8F8] focus:bg-[#2A2D37]"
                    >
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(note.id)
                      }}
                      className="text-red-400 focus:bg-[#2A2D37]"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-[#8A8F98] line-clamp-4 flex-1">
                {note.content || <span className="italic">Aucun contenu</span>}
              </p>
              <div className="flex items-center gap-1 mt-3 text-xs text-[#8A8F98]">
                <Clock className="w-3 h-3" />
                Modifié le {formatDate(note.updated_at)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#161922] border-[#2A2D37] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? 'Modifier la note' : 'Nouvelle note'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Titre de la note"
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Contenu</Label>
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Contenu de la note..."
                className="bg-[#0F1115] border-[#2A2D37] text-white min-h-[300px] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false)
                setEditingNote(null)
                resetForm()
              }}
              className="border-[#2A2D37] text-[#F7F8F8] hover:bg-[#1F232E]"
            >
              Annuler
            </Button>
            <Button
              onClick={editingNote ? handleEdit : handleCreate}
              className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
            >
              {editingNote ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

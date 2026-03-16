'use client'

import { useState } from 'react'
import { useStore, type Password } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { generateId } from '@/lib/utils'
import { Plus, Lock, Eye, EyeOff, Copy, Trash2, MoreVertical, ExternalLink } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface PasswordsViewProps {
  projectId: string
}

export function PasswordsView({ projectId }: PasswordsViewProps) {
  const { passwords, addPassword, updatePassword, deletePassword, getPasswordsByProject } = useStore()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPassword, setEditingPassword] = useState<Password | null>(null)
  const [newName, setNewName] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const projectPasswords = getPasswordsByProject(projectId)

  const handleCreate = () => {
    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) return

    const newPasswordEntry: Password = {
      id: generateId(),
      name: newName,
      username: newUsername,
      password: newPassword,
      url: newUrl || null,
      notes: newNotes || null,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    addPassword(newPasswordEntry)
    resetForm()
    setIsCreateOpen(false)
  }

  const handleEdit = () => {
    if (!editingPassword || !newName.trim() || !newUsername.trim() || !newPassword.trim()) return

    updatePassword(editingPassword.id, {
      name: newName,
      username: newUsername,
      password: newPassword,
      url: newUrl || null,
      notes: newNotes || null,
    })

    setEditingPassword(null)
    resetForm()
    setIsCreateOpen(false)
  }

  const openEditDialog = (password: Password) => {
    setEditingPassword(password)
    setNewName(password.name)
    setNewUsername(password.username)
    setNewPassword(password.password)
    setNewUrl(password.url || '')
    setNewNotes(password.notes || '')
    setIsCreateOpen(true)
  }

  const resetForm = () => {
    setNewName('')
    setNewUsername('')
    setNewPassword('')
    setNewUrl('')
    setNewNotes('')
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce mot de passe ?')) {
      deletePassword(id)
    }
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let result = ''
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(result)
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Mots de passe</h2>
        <Button
          onClick={() => {
            resetForm()
            setEditingPassword(null)
            setIsCreateOpen(true)
          }}
          size="sm"
          className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau
        </Button>
      </div>

      <div className="space-y-2 h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
        {projectPasswords.length === 0 ? (
          <div className="text-center py-12 text-[#8A8F98]">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun mot de passe</p>
            <p className="text-sm mt-1">Ajoutez votre premier mot de passe</p>
          </div>
        ) : (
          projectPasswords.map((password) => (
            <div
              key={password.id}
              className="group bg-[#161922] rounded-lg border border-[#2A2D37] p-4 hover:border-[#5E6AD2]/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#5E6AD2]/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-[#5E6AD2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[#F7F8F8] font-medium truncate">{password.name}</h3>
                      {password.url && (
                        <a
                          href={password.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5E6AD2] hover:text-[#4F5BC7]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-[#8A8F98]">{password.username}</span>
                      <button
                        onClick={() => copyToClipboard(password.username, `user-${password.id}`)}
                        className="text-[#5E6AD2] hover:text-[#4F5BC7]"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {copiedField === `user-${password.id}` && (
                        <span className="text-xs text-green-500">Copié!</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-[#8A8F98] font-mono">
                        {showPassword[password.id] ? password.password : '••••••••••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(password.id)}
                        className="text-[#8A8F98] hover:text-[#F7F8F8]"
                      >
                        {showPassword[password.id] ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(password.password, `pass-${password.id}`)}
                        className="text-[#5E6AD2] hover:text-[#4F5BC7]"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {copiedField === `pass-${password.id}` && (
                        <span className="text-xs text-green-500">Copié!</span>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2A2D37] rounded transition-opacity">
                      <MoreVertical className="w-4 h-4 text-[#8A8F98]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1F232E] border-[#2A2D37]">
                    <DropdownMenuItem
                      onClick={() => openEditDialog(password)}
                      className="text-[#F7F8F8] focus:bg-[#2A2D37]"
                    >
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(password.id)}
                      className="text-red-400 focus:bg-[#2A2D37]"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {password.notes && (
                <p className="text-xs text-[#8A8F98] mt-2 pt-2 border-t border-[#2A2D37]">
                  {password.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#161922] border-[#2A2D37] text-white">
          <DialogHeader>
            <DialogTitle>
              {editingPassword ? 'Modifier le mot de passe' : 'Nouveau mot de passe'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="ex: Google, GitHub, etc."
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Nom d'utilisateur / Email</Label>
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="utilisateur@exemple.com"
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Mot de passe</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generatePassword}
                  className="text-[#5E6AD2] hover:text-[#4F5BC7] h-auto py-0"
                >
                  Générer
                </Button>
              </div>
              <Input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mot de passe"
                className="bg-[#0F1115] border-[#2A2D37] text-white font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>URL (optionnel)</Label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optionnel)</Label>
              <Input
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Notes additionnelles..."
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false)
                setEditingPassword(null)
                resetForm()
              }}
              className="border-[#2A2D37] text-[#F7F8F8] hover:bg-[#1F232E]"
            >
              Annuler
            </Button>
            <Button
              onClick={editingPassword ? handleEdit : handleCreate}
              className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
            >
              {editingPassword ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

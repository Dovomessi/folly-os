'use client'

import { useState } from 'react'
import { useStore, type Project } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { PROJECT_COLORS, generateId } from '@/lib/utils'
import { Plus, Folder, MoreVertical, Trash2, Edit2, LogOut } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface SidebarProps {
  onLogout?: () => void
  userEmail?: string
}

export function Sidebar({ onLogout, userEmail }: SidebarProps) {
  const { projects, selectedProjectId, selectProject, addProject, updateProject, deleteProject } = useStore()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0])

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return

    const newProject: Project = {
      id: generateId(),
      name: newProjectName,
      description: newProjectDescription || null,
      color: selectedColor,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    addProject(newProject)
    setNewProjectName('')
    setNewProjectDescription('')
    setSelectedColor(PROJECT_COLORS[0])
    setIsCreateOpen(false)
    selectProject(newProject.id)
  }

  const handleEditProject = () => {
    if (!editingProject || !newProjectName.trim()) return

    updateProject(editingProject.id, {
      name: newProjectName,
      description: newProjectDescription || null,
      color: selectedColor,
    })

    setIsEditOpen(false)
    setEditingProject(null)
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    setNewProjectName(project.name)
    setNewProjectDescription(project.description || '')
    setSelectedColor(project.color)
    setIsEditOpen(true)
  }

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      deleteProject(projectId)
    }
  }

  return (
    <aside className="w-64 h-screen bg-[#0F1115] border-r border-[#1F232E] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#1F232E]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#5E6AD2] flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-white font-semibold">Folly OS</span>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="w-full bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau projet
        </Button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        <div className="text-xs font-medium text-[#8A8F98] uppercase tracking-wider px-3 py-2">
          Projets
        </div>
        {projects.length === 0 ? (
          <div className="px-3 py-4 text-sm text-[#8A8F98] text-center">
            Aucun projet
          </div>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => selectProject(project.id)}
                className={`group flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  selectedProjectId === project.id
                    ? 'bg-[#1F232E] text-white'
                    : 'text-[#8A8F98] hover:bg-[#161922] hover:text-[#F7F8F8]'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <Folder className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-sm truncate">{project.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2A2D37] rounded transition-opacity"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1F232E] border-[#2A2D37]">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditDialog(project)
                      }}
                      className="text-[#F7F8F8] focus:bg-[#2A2D37] focus:text-white"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProject(project.id)
                      }}
                      className="text-red-400 focus:bg-[#2A2D37] focus:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#1F232E]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#5E6AD2] flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'FG'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">
              {userEmail ? userEmail.split('@')[0] : 'Folly Germain'}
            </p>
            <p className="text-xs text-[#8A8F98] truncate">
              {userEmail || 'Admin'}
            </p>
          </div>
        </div>
        {onLogout && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full border-[#2A2D37] text-[#8A8F98] hover:bg-[#1F232E] hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#161922] border-[#2A2D37] text-white">
          <DialogHeader>
            <DialogTitle>Nouveau projet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom du projet</Label>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Mon super projet"
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optionnel)</Label>
              <Input
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Description du projet..."
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      selectedColor === color ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="border-[#2A2D37] text-[#F7F8F8] hover:bg-[#1F232E]"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateProject}
              className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-[#161922] border-[#2A2D37] text-white">
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom du projet</Label>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      selectedColor === color ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="border-[#2A2D37] text-[#F7F8F8] hover:bg-[#1F232E]"
            >
              Annuler
            </Button>
            <Button
              onClick={handleEditProject}
              className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}

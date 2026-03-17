'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import type { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { PROJECT_COLORS, generateId } from '@/lib/utils'
import { Plus, MoreVertical, Trash2, Edit2, LogOut, LayoutGrid, Settings } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface SidebarProps {
  onLogout?: () => void
  userEmail?: string
}

export function Sidebar({ onLogout, userEmail }: SidebarProps) {
  const { projects, addProject, updateProject, deleteProject } = useStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0])
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({})

  const selectedProjectId = pathname.match(/\/projects\/([^/]+)/)?.[1] || null

  useEffect(() => {
    if (projects.length === 0) return

    async function fetchTaskCounts() {
      const counts: Record<string, number> = {}
      await Promise.all(
        projects.map(async (project) => {
          try {
            const res = await fetch(`/api/tasks?project_id=${project.id}`)
            if (!res.ok) return
            const json = await res.json()
            const openTasks = (json.data || []).filter(
              (t: { status: string }) => t.status !== 'done'
            )
            counts[project.id] = openTasks.length
          } catch {
            counts[project.id] = 0
          }
        })
      )
      setTaskCounts(counts)
    }

    fetchTaskCounts()
  }, [projects])

  const handleSelectProject = (id: string) => {
    router.push(`/projects/${id}`)
  }

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return
    const newProject: Project = {
      id: generateId(),
      name: newProjectName,
      description: newProjectDescription || null,
      color: selectedColor,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    addProject(newProject)
    setNewProjectName('')
    setNewProjectDescription('')
    setSelectedColor(PROJECT_COLORS[0])
    setIsCreateOpen(false)
    router.push(`/projects/${newProject.id}`)
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
    if (confirm('Supprimer ce projet ?')) {
      deleteProject(projectId)
      if (selectedProjectId === projectId) router.push('/projects')
    }
  }

  return (
    <aside className="w-[260px] min-w-[260px] h-screen bg-[#161922] border-r border-[#2A2D37] flex flex-col">
      {/* Header with logo + search */}
      <div className="p-4 pb-3 border-b border-[#2A2D37]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#5E6AD2] flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-[#F7F8F8] font-semibold text-[15px]">Folly OS</span>
        </div>
        <input
          type="text"
          placeholder="Rechercher... (Cmd+K)"
          className="w-full px-3 py-2 bg-[#0F1115] border border-[#2A2D37] rounded-md text-[13px] text-[#F7F8F8] placeholder:text-[#555A65] outline-none focus:border-[#5E6AD2]"
          readOnly
        />
      </div>

      {/* Quick nav */}
      <div className="py-3 border-b border-[#2A2D37]">
        <button
          onClick={() => router.push('/projects')}
          className="flex items-center gap-2.5 w-full px-4 py-[7px] text-[13px] text-[#8A8F98] hover:bg-[#1F232E] hover:text-[#F7F8F8] transition-colors"
        >
          <LayoutGrid className="w-4 h-4 opacity-60" />
          Vue d&apos;ensemble
        </button>
        <button
          onClick={() => router.push('/settings')}
          className={`flex items-center gap-2.5 w-full px-4 py-[7px] text-[13px] hover:bg-[#1F232E] hover:text-[#F7F8F8] transition-colors ${pathname.startsWith('/settings') ? 'bg-[#1F232E] text-[#F7F8F8]' : 'text-[#8A8F98]'}`}
        >
          <Settings className="w-4 h-4 opacity-60" />
          Parametres
        </button>
      </div>

      {/* Projects list */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#555A65]">
          Projets
        </div>
        {projects.length === 0 ? (
          <div className="px-4 py-4 text-sm text-[#555A65] text-center">
            Aucun projet
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleSelectProject(project.id)}
              className={`group flex items-center gap-2.5 px-4 py-2 cursor-pointer transition-colors text-[14px] ${
                selectedProjectId === project.id
                  ? 'bg-[#1F232E] text-[#F7F8F8]'
                  : 'text-[#8A8F98] hover:bg-[#1F232E]'
              }`}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span className="flex-1 truncate">{project.name}</span>
              <span className="text-[11px] text-[#555A65] bg-[#0F1115] px-1.5 py-0.5 rounded-full">
                {taskCounts[project.id] ?? 0}
              </span>
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
                    onClick={(e) => { e.stopPropagation(); openEditDialog(project) }}
                    className="text-[#F7F8F8] focus:bg-[#2A2D37] focus:text-white"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id) }}
                    className="text-red-400 focus:bg-[#2A2D37] focus:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>

      {/* Footer: new project button + user */}
      <div className="border-t border-[#2A2D37]">
        <div className="p-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full py-2 border border-dashed border-[#2A2D37] rounded-md text-[13px] text-[#8A8F98] hover:border-[#5E6AD2] hover:text-[#5E6AD2] hover:bg-[#5E6AD2]/5 transition-all"
          >
            + Nouveau Projet
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#5E6AD2] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-medium">
                {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'FG'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#F7F8F8] truncate">
                {userEmail ? userEmail.split('@')[0] : 'Folly Germain'}
              </p>
              <p className="text-xs text-[#555A65] truncate">
                {userEmail || 'Admin'}
              </p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-[#1F232E] rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Deconnexion
            </button>
          )}
        </div>
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
              <Input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Mon super projet" className="bg-[#0F1115] border-[#2A2D37] text-white" />
            </div>
            <div className="space-y-2">
              <Label>Description (optionnel)</Label>
              <Input value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} placeholder="Description du projet..." className="bg-[#0F1115] border-[#2A2D37] text-white" />
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map((color) => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={`w-8 h-8 rounded-full transition-transform ${selectedColor === color ? 'ring-2 ring-white scale-110' : ''}`} style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-[#2A2D37] text-[#F7F8F8] hover:bg-[#1F232E]">Annuler</Button>
            <Button onClick={handleCreateProject} className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white">Creer</Button>
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
              <Input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="bg-[#0F1115] border-[#2A2D37] text-white" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} className="bg-[#0F1115] border-[#2A2D37] text-white" />
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map((color) => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={`w-8 h-8 rounded-full transition-transform ${selectedColor === color ? 'ring-2 ring-white scale-110' : ''}`} style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-[#2A2D37] text-[#F7F8F8] hover:bg-[#1F232E]">Annuler</Button>
            <Button onClick={handleEditProject} className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}

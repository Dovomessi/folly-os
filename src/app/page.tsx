'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Sidebar } from '@/components/sidebar'
import { KanbanBoard } from '@/components/kanban-board'
import { CalendarView } from '@/components/calendar-view'
import { NotesView } from '@/components/notes-view'
import { PasswordsView } from '@/components/passwords-view'
import { AuthForm } from '@/components/auth-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutGrid, Calendar, FileText, Lock, FolderOpen } from 'lucide-react'

export default function Dashboard() {
  const { selectedProjectId, projects } = useStore()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const user = localStorage.getItem('folly-os-user')
    if (user) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleAuth = (email: string) => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('folly-os-user')
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="text-[#8A8F98]">Chargement...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthForm onAuth={handleAuth} />
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  return (
    <div className="flex h-screen bg-[#0F1115]">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedProject ? (
          <>
            {/* Project Header */}
            <header className="px-6 py-4 border-b border-[#1F232E] bg-[#0F1115]">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedProject.color }}
                />
                <h1 className="text-xl font-semibold text-white">{selectedProject.name}</h1>
                {selectedProject.description && (
                  <span className="text-[#8A8F98] text-sm">— {selectedProject.description}</span>
                )}
              </div>
            </header>

            {/* Tabs Content */}
            <div className="flex-1 overflow-hidden p-6">
              <Tabs defaultValue="tasks" className="h-full flex flex-col">
                <TabsList className="bg-[#161922] border border-[#2A2D37] w-fit">
                  <TabsTrigger
                    value="tasks"
                    className="data-[state=active]:bg-[#5E6AD2] data-[state=active]:text-white text-[#8A8F98]"
                  >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Tâches
                  </TabsTrigger>
                  <TabsTrigger
                    value="calendar"
                    className="data-[state=active]:bg-[#5E6AD2] data-[state=active]:text-white text-[#8A8F98]"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Rendez-vous
                  </TabsTrigger>
                  <TabsTrigger
                    value="notes"
                    className="data-[state=active]:bg-[#5E6AD2] data-[state=active]:text-white text-[#8A8F98]"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Notes
                  </TabsTrigger>
                  <TabsTrigger
                    value="passwords"
                    className="data-[state=active]:bg-[#5E6AD2] data-[state=active]:text-white text-[#8A8F98]"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Passwords
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 mt-4 overflow-hidden">
                  <TabsContent value="tasks" className="h-full mt-0">
                    <KanbanBoard projectId={selectedProject.id} />
                  </TabsContent>
                  <TabsContent value="calendar" className="h-full mt-0">
                    <CalendarView projectId={selectedProject.id} />
                  </TabsContent>
                  <TabsContent value="notes" className="h-full mt-0">
                    <NotesView projectId={selectedProject.id} />
                  </TabsContent>
                  <TabsContent value="passwords" className="h-full mt-0">
                    <PasswordsView projectId={selectedProject.id} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 text-[#2A2D37] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#8A8F98] mb-2">
                Aucun projet sélectionné
              </h2>
              <p className="text-[#8A8F98]">
                Créez un nouveau projet ou sélectionnez-en un dans la sidebar
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

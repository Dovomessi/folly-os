'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Sidebar } from '@/components/sidebar'
import { AuthForm } from '@/components/auth-form'
import { IframeView } from '@/components/iframe-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutGrid, Calendar, FileText, Lock, FolderOpen } from 'lucide-react'

// URLs des 4 forks déployés
const TOOL_URLS = {
  tasks: 'https://folly-os-plane.vercel.app',
  calendar: 'https://folly-os-calendar.vercel.app',
  notes: 'https://folly-os-notes.vercel.app',
  passwords: 'https://folly-os-vault.vercel.app',
}

// Supabase client creation with fallback for build time
function createSupabaseClient() {
  try {
    const { createBrowserClient } = require('@supabase/ssr')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      console.warn('Supabase env vars not available')
      return null
    }
    
    return createBrowserClient(url, key)
  } catch (e) {
    console.warn('Failed to create Supabase client:', e)
    return null
  }
}

export default function Dashboard() {
  const { selectedProjectId, projects } = useStore()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    const client = createSupabaseClient()
    setSupabase(client)

    if (!client) {
      setIsLoading(false)
      return
    }

    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { user } } = await client.auth.getUser()
      if (user) {
        setUser(user)
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setUser(session.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setIsAuthenticated(false)
    setUser(null)
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
      <Sidebar onLogout={handleLogout} userEmail={user?.email} />
      
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
                    <IframeView 
                      src={TOOL_URLS.tasks} 
                      title="Plane - Gestion des tâches" 
                    />
                  </TabsContent>
                  <TabsContent value="calendar" className="h-full mt-0">
                    <IframeView 
                      src={TOOL_URLS.calendar} 
                      title="Someday - Calendrier" 
                    />
                  </TabsContent>
                  <TabsContent value="notes" className="h-full mt-0">
                    <IframeView 
                      src={TOOL_URLS.notes} 
                      title="Docmost - Notes" 
                    />
                  </TabsContent>
                  <TabsContent value="passwords" className="h-full mt-0">
                    <IframeView 
                      src={TOOL_URLS.passwords} 
                      title="Padloc - Mots de passe" 
                    />
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

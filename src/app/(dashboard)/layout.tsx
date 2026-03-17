'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { AuthForm } from '@/components/auth-form'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const { createBrowserClient } = await import('@supabase/ssr')
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!url || !key) { setIsLoading(false); return }

        const client = createBrowserClient(url, key)
        setSupabase(client)

        const { data: { user } } = await client.auth.getUser()
        if (user) {
          setUser(user)
          setIsAuthenticated(true)
        }
        setIsLoading(false)

        const { data: { subscription } } = client.auth.onAuthStateChange((_: any, session: any) => {
          if (session?.user) {
            setUser(session.user)
            setIsAuthenticated(true)
          } else {
            setUser(null)
            setIsAuthenticated(false)
          }
        })
        return () => subscription.unsubscribe()
      } catch {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut()
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
    return <AuthForm onAuth={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="flex h-screen bg-[#0F1115]">
      <Sidebar onLogout={handleLogout} userEmail={user?.email} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}

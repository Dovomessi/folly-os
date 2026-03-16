'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface AuthFormProps {
  onAuth: () => void
}

export function AuthForm({ onAuth }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage('Vérifiez votre email pour confirmer votre inscription.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        onAuth()
      }
    } catch (error: any) {
      setMessage(error.message || 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#161922] border-[#2A2D37]">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-[#5E6AD2] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <CardTitle className="text-2xl text-white">
            {isSignUp ? 'Créer un compte' : 'Bienvenue sur Folly OS'}
          </CardTitle>
          <CardDescription className="text-[#8A8F98]">
            {isSignUp 
              ? 'Créez votre compte pour accéder au dashboard' 
              : 'Connectez-vous pour accéder à vos projets'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#8A8F98]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#0F1115] border-[#2A2D37] text-white placeholder:text-[#5A5F6A] focus:border-[#5E6AD2] focus:ring-[#5E6AD2]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#8A8F98]">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#0F1115] border-[#2A2D37] text-white placeholder:text-[#5A5F6A] focus:border-[#5E6AD2] focus:ring-[#5E6AD2]"
              />
            </div>
            
            {message && (
              <div className={`text-sm ${message.includes('erreur') || message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5E6AD2] hover:bg-[#4F58B3] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                isSignUp ? 'Créer un compte' : 'Se connecter'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-[#5E6AD2] hover:text-[#4F58B3]"
            >
              {isSignUp 
                ? 'Déjà un compte ? Se connecter' 
                : 'Pas de compte ? S\'inscrire'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

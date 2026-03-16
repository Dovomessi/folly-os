'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface AuthFormProps {
  onAuth: (email: string) => void
}

export function AuthForm({ onAuth }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate auth - in production, use Supabase auth
    setTimeout(() => {
      setIsLoading(false)
      if (email && password) {
        localStorage.setItem('folly-os-user', email)
        onAuth(email)
      } else {
        setError('Veuillez remplir tous les champs')
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1115] p-4">
      <Card className="w-full max-w-md bg-[#161922] border-[#2A2D37]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white">Folly OS</CardTitle>
          <CardDescription className="text-[#8A8F98]">
            {isLogin ? 'Connectez-vous à votre compte' : 'Créez un nouveau compte'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#F7F8F8]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0F1115] border-[#2A2D37] text-white placeholder:text-[#8A8F98]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#F7F8F8]">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#0F1115] border-[#2A2D37] text-white placeholder:text-[#8A8F98]"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : isLogin ? 'Se connecter' : 'S\'inscrire'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[#8A8F98] hover:text-[#5E6AD2] transition-colors"
            >
              {isLogin ? 'Pas de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

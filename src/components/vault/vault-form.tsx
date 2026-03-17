'use client'

import { useState, useEffect } from 'react'
import { X, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react'
import { PasswordGenerator } from './password-generator'
import type { VaultItem } from '@/types'

type Category = VaultItem['category']

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'pro', label: 'Pro' },
  { value: 'personal', label: 'Personnel' },
  { value: 'api_keys', label: 'Clés API' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'other', label: 'Autre' },
]

interface VaultFormProps {
  projectId: string
  item?: VaultItem & { password?: string }
  onClose: () => void
  onSave: () => void
}

export function VaultForm({ projectId, item, onClose, onSave }: VaultFormProps) {
  const [name, setName] = useState(item?.name || '')
  const [url, setUrl] = useState(item?.url || '')
  const [username, setUsername] = useState(item?.username || '')
  const [password, setPassword] = useState(item?.password || '')
  const [notes, setNotes] = useState(item?.notes || '')
  const [category, setCategory] = useState<Category>(item?.category || 'other')
  const [showPassword, setShowPassword] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Le nom est requis'); return }

    setSaving(true)
    setError('')

    const body = {
      name: name.trim(),
      url: url.trim() || null,
      username: username.trim() || null,
      password: password || undefined,
      notes: notes.trim() || null,
      category,
      project_id: projectId,
    }

    const res = await fetch(
      item ? `/api/vault/${item.id}` : '/api/vault',
      {
        method: item ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error || 'Une erreur est survenue')
      setSaving(false)
      return
    }

    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#161922] border border-[#2A2D37] rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2D37]">
          <h2 className="text-base font-semibold text-[#F7F8F8]">
            {item ? 'Modifier l\'entrée' : 'Nouvelle entrée'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#555A65] hover:text-[#F7F8F8] hover:bg-[#2A2D37] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="px-3 py-2 rounded-lg bg-[#E5484D]/10 border border-[#E5484D]/30 text-sm text-[#E5484D]">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8A8F98] uppercase tracking-wide">
                Nom <span className="text-[#E5484D]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: GitHub, Stripe..."
                autoFocus
                className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#2A2D37] rounded-lg text-sm text-[#F7F8F8] placeholder:text-[#555A65] focus:outline-none focus:border-[#5E6AD2] transition-colors"
              />
            </div>

            {/* URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8A8F98] uppercase tracking-wide">URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#2A2D37] rounded-lg text-sm text-[#F7F8F8] placeholder:text-[#555A65] focus:outline-none focus:border-[#5E6AD2] transition-colors"
              />
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8A8F98] uppercase tracking-wide">
                Identifiant / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="user@example.com"
                autoComplete="off"
                className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#2A2D37] rounded-lg text-sm text-[#F7F8F8] placeholder:text-[#555A65] focus:outline-none focus:border-[#5E6AD2] transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8A8F98] uppercase tracking-wide">
                Mot de passe {!item && <span className="text-[#E5484D]">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={item ? '(inchangé)' : 'Mot de passe'}
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 pr-10 bg-[#0F1115] border border-[#2A2D37] rounded-lg text-sm text-[#F7F8F8] placeholder:text-[#555A65] focus:outline-none focus:border-[#5E6AD2] transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555A65] hover:text-[#8A8F98] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password generator toggle */}
            <button
              type="button"
              onClick={() => setShowGenerator(!showGenerator)}
              className="flex items-center gap-2 text-xs text-[#5E6AD2] hover:text-[#8A8FE8] transition-colors"
            >
              {showGenerator ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showGenerator ? 'Masquer le générateur' : 'Générer un mot de passe'}
            </button>

            {showGenerator && (
              <PasswordGenerator onUse={(p) => { setPassword(p); setShowPassword(true) }} />
            )}

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8A8F98] uppercase tracking-wide">Catégorie</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      category === cat.value
                        ? 'bg-[#5E6AD2] border-[#5E6AD2] text-white'
                        : 'bg-[#0F1115] border-[#2A2D37] text-[#8A8F98] hover:border-[#5E6AD2] hover:text-[#F7F8F8]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8A8F98] uppercase tracking-wide">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notes optionnelles..."
                rows={3}
                className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#2A2D37] rounded-lg text-sm text-[#F7F8F8] placeholder:text-[#555A65] focus:outline-none focus:border-[#5E6AD2] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2A2D37]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#8A8F98] hover:text-[#F7F8F8] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#5E6AD2] hover:bg-[#6B76E0] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? 'Enregistrement...' : item ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

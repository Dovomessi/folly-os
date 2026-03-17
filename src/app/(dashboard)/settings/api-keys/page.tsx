'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Copy, Key, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  revoked: boolean
}

export default function ApiKeysPage() {
  const router = useRouter()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)

  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [creating, setCreating] = useState(false)

  // Reveal dialog (shows raw key after creation)
  const [isRevealOpen, setIsRevealOpen] = useState(false)
  const [rawKey, setRawKey] = useState('')
  const [copied, setCopied] = useState(false)

  // Revoke confirmation dialog
  const [isRevokeOpen, setIsRevokeOpen] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  useEffect(() => {
    fetchKeys()
  }, [])

  async function fetchKeys() {
    setLoading(true)
    const res = await fetch('/api/settings/api-keys')
    const data = await res.json()
    if (data.data) setApiKeys(data.data)
    setLoading(false)
  }

  async function handleCreate() {
    if (!newKeyName.trim()) return
    setCreating(true)
    const res = await fetch('/api/settings/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName.trim() }),
    })
    if (res.ok) {
      const { data } = await res.json()
      setApiKeys(prev => [...prev, data.apiKey])
      setRawKey(data.rawKey)
      setIsCreateOpen(false)
      setNewKeyName('')
      setIsRevealOpen(true)
    }
    setCreating(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(rawKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function openRevokeDialog(id: string) {
    setRevokingId(id)
    setIsRevokeOpen(true)
  }

  async function handleRevoke() {
    if (!revokingId) return
    const res = await fetch(`/api/settings/api-keys/${revokingId}`, { method: 'DELETE' })
    if (res.ok) {
      setApiKeys(prev =>
        prev.map(k => k.id === revokingId ? { ...k, revoked: true } : k)
      )
    }
    setIsRevokeOpen(false)
    setRevokingId(null)
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '—'
    return format(new Date(dateStr), 'd MMM yyyy', { locale: fr })
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0F1115]">
        <div className="text-[#8A8F98]">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-[#0F1115]">
      {/* Header */}
      <div className="border-b border-[#2A2D37] px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/settings/availability')}
            className="text-[#8A8F98] hover:text-[#F7F8F8] text-sm transition-colors"
          >
            Disponibilités
          </button>
          <span className="text-[#2A2D37]">/</span>
          <button
            onClick={() => router.push('/settings/booking')}
            className="text-[#8A8F98] hover:text-[#F7F8F8] text-sm transition-colors"
          >
            Types de RDV
          </button>
          <span className="text-[#2A2D37]">/</span>
          <span className="text-[#F7F8F8] text-sm font-medium">Clés API</span>
        </div>
        <h1 className="text-xl font-semibold text-[#F7F8F8] mt-1">Clés API</h1>
      </div>

      <div className="p-6 max-w-3xl space-y-8">
        {/* API Keys Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[#F7F8F8] font-semibold text-base">Vos clés API</h2>
              <p className="text-[#8A8F98] text-sm mt-1">
                Utilisez les clés API pour accéder à Folly OS depuis vos scripts et intégrations.
              </p>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white h-8 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nouvelle clé
            </Button>
          </div>

          {apiKeys.length === 0 ? (
            <div className="bg-[#161922] border border-dashed border-[#2A2D37] rounded-lg p-8 text-center">
              <Key className="w-8 h-8 text-[#555A65] mx-auto mb-3" />
              <p className="text-[#555A65] text-sm">Aucune clé API</p>
              <p className="text-[#555A65] text-xs mt-1">Créez votre première clé pour commencer</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map(key => (
                <div
                  key={key.id}
                  className={`bg-[#161922] border border-[#2A2D37] rounded-lg p-4 flex items-center gap-4 ${
                    key.revoked ? 'opacity-50' : ''
                  }`}
                >
                  <Key className="w-4 h-4 text-[#555A65] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[#F7F8F8] font-medium text-sm">{key.name}</span>
                      {key.revoked ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 h-4 border-red-500/40 text-red-400"
                        >
                          Révoquée
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 h-4 border-green-500/40 text-green-400"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-0.5">
                      <span className="text-[#8A8F98] text-xs font-mono">{key.key_prefix}...</span>
                      <span className="text-[#555A65] text-xs">
                        Créée le {formatDate(key.created_at)}
                      </span>
                      <span className="text-[#555A65] text-xs">
                        Dernière utilisation : {formatDate(key.last_used_at)}
                      </span>
                    </div>
                  </div>
                  {!key.revoked && (
                    <button
                      onClick={() => openRevokeDialog(key.id)}
                      className="p-1.5 text-[#555A65] hover:text-red-400 hover:bg-[#1F232E] rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create Key Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#161922] border-[#2A2D37] text-[#F7F8F8] max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle clé API</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[#8A8F98] text-xs">Nom de la clé</Label>
              <Input
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder="Ex : Script sync, Agent IA..."
                className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8] placeholder:text-[#555A65]"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
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
              onClick={handleCreate}
              disabled={!newKeyName.trim() || creating}
              className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
            >
              {creating ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal Key Dialog */}
      <Dialog open={isRevealOpen} onOpenChange={setIsRevealOpen}>
        <DialogContent className="bg-[#161922] border-[#2A2D37] text-[#F7F8F8] max-w-lg">
          <DialogHeader>
            <DialogTitle>Clé API créée</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-[#0F1115] border border-[#2A2D37] rounded-lg p-4">
              <div className="flex items-center justify-between gap-3">
                <code className="text-[#F7F8F8] text-sm font-mono break-all flex-1">
                  {rawKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="border-[#2A2D37] text-[#F7F8F8] hover:bg-[#1F232E] flex-shrink-0"
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5 mr-1" />Copié</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5 mr-1" />Copier</>
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-400 text-sm font-medium">
                Cette clé ne sera plus visible après fermeture
              </p>
              <p className="text-yellow-400/70 text-xs mt-1">
                Copiez-la maintenant et conservez-la en lieu sûr.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsRevealOpen(false)
                setRawKey('')
                setCopied(false)
              }}
              className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
        <DialogContent className="bg-[#161922] border-[#2A2D37] text-[#F7F8F8] max-w-sm">
          <DialogHeader>
            <DialogTitle>Révoquer cette clé ?</DialogTitle>
          </DialogHeader>
          <p className="text-[#8A8F98] text-sm py-2">
            Cette action est irréversible. Les requêtes utilisant cette clé seront rejetées immédiatement.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRevokeOpen(false)}
              className="border-[#2A2D37] text-[#F7F8F8] hover:bg-[#1F232E]"
            >
              Annuler
            </Button>
            <Button
              onClick={handleRevoke}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Révoquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, ExternalLink, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { EventType, BookingProfile } from '@/types'

const EVENT_COLORS = ['#5E6AD2', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function BookingSettingsPage() {
  const router = useRouter()
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [profile, setProfile] = useState<BookingProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Event type dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    duration_minutes: 30,
    color: '#5E6AD2',
    description: '',
    is_active: true,
    buffer_minutes: 0,
    min_notice_hours: 1,
    max_days_advance: 30,
  })

  // Profile form
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    slug: '',
    bio: '',
    timezone: 'Europe/Paris',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [etRes, profileRes] = await Promise.all([
      fetch('/api/settings/event-types'),
      fetch('/api/settings/booking-profile'),
    ])
    const etData = await etRes.json()
    const profileData = await profileRes.json()

    if (etData.data) setEventTypes(etData.data)
    if (profileData.data) {
      setProfile(profileData.data)
      setProfileForm({
        display_name: profileData.data.display_name || '',
        slug: profileData.data.slug || '',
        bio: profileData.data.bio || '',
        timezone: profileData.data.timezone || 'Europe/Paris',
      })
    }
    setLoading(false)
  }

  function openCreateDialog() {
    setEditingId(null)
    setForm({
      name: '',
      slug: '',
      duration_minutes: 30,
      color: '#5E6AD2',
      description: '',
      is_active: true,
      buffer_minutes: 0,
      min_notice_hours: 1,
      max_days_advance: 30,
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(et: EventType) {
    setEditingId(et.id)
    setForm({
      name: et.name,
      slug: et.slug,
      duration_minutes: et.duration_minutes,
      color: et.color,
      description: et.description || '',
      is_active: et.is_active,
      buffer_minutes: et.buffer_minutes,
      min_notice_hours: et.min_notice_hours,
      max_days_advance: et.max_days_advance,
    })
    setIsDialogOpen(true)
  }

  async function handleSaveEventType() {
    const payload = { ...form, description: form.description || null }
    if (editingId) {
      const res = await fetch(`/api/settings/event-types/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const { data } = await res.json()
        setEventTypes(prev => prev.map(et => et.id === editingId ? data : et))
      }
    } else {
      const res = await fetch('/api/settings/event-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const { data } = await res.json()
        setEventTypes(prev => [...prev, data])
      }
    }
    setIsDialogOpen(false)
  }

  async function handleDeleteEventType(id: string) {
    if (!confirm('Supprimer ce type de rendez-vous ?')) return
    const res = await fetch(`/api/settings/event-types/${id}`, { method: 'DELETE' })
    if (res.ok) setEventTypes(prev => prev.filter(et => et.id !== id))
  }

  async function handleSaveProfile() {
    setSavingProfile(true)
    const res = await fetch('/api/settings/booking-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    })
    if (res.ok) {
      const { data } = await res.json()
      setProfile(data)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    }
    setSavingProfile(false)
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
      <div className="border-b border-[#2A2D37] px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/settings/availability')}
              className="text-[#8A8F98] hover:text-[#F7F8F8] text-sm transition-colors"
            >
              Disponibilites
            </button>
            <span className="text-[#2A2D37]">/</span>
            <span className="text-[#F7F8F8] text-sm font-medium">Types de RDV</span>
            <span className="text-[#2A2D37]">/</span>
            <button
              onClick={() => router.push('/settings/api-keys')}
              className="text-[#8A8F98] hover:text-[#F7F8F8] text-sm transition-colors"
            >
              Clés API
            </button>
          </div>
          <h1 className="text-xl font-semibold text-[#F7F8F8] mt-1">Parametres Booking</h1>
        </div>
        {profile && (
          <a
            href={`/book/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#5E6AD2] hover:text-[#7B84D9] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Voir ma page
          </a>
        )}
      </div>

      <div className="p-6 max-w-4xl space-y-8">
        {/* Booking Profile Section */}
        <section>
          <h2 className="text-[#F7F8F8] font-semibold text-base mb-4">Profil de booking</h2>
          <div className="bg-[#161922] border border-[#2A2D37] rounded-lg p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#8A8F98] text-xs">Nom affiché</Label>
                <Input
                  value={profileForm.display_name}
                  onChange={e => setProfileForm(p => ({ ...p, display_name: e.target.value }))}
                  placeholder="Folly Germain"
                  className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8] placeholder:text-[#555A65]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8A8F98] text-xs">URL slug (ex: folly)</Label>
                <Input
                  value={profileForm.slug}
                  onChange={e => setProfileForm(p => ({ ...p, slug: slugify(e.target.value) }))}
                  placeholder="folly"
                  className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8] placeholder:text-[#555A65]"
                />
                {profileForm.slug && (
                  <p className="text-[11px] text-[#555A65]">/book/{profileForm.slug}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#8A8F98] text-xs">Bio (optionnel)</Label>
              <Textarea
                value={profileForm.bio}
                onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Consultant, développeur, coach..."
                className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8] placeholder:text-[#555A65] resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#8A8F98] text-xs">Fuseau horaire</Label>
              <Input
                value={profileForm.timezone}
                onChange={e => setProfileForm(p => ({ ...p, timezone: e.target.value }))}
                placeholder="Europe/Paris"
                className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8] placeholder:text-[#555A65]"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
              >
                {profileSaved ? (
                  <><Check className="w-4 h-4 mr-2" />Sauvegardé</>
                ) : savingProfile ? 'Sauvegarde...' : 'Enregistrer le profil'}
              </Button>
            </div>
          </div>
        </section>

        <Separator className="bg-[#2A2D37]" />

        {/* Event Types Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#F7F8F8] font-semibold text-base">Types de rendez-vous</h2>
            <Button
              onClick={openCreateDialog}
              className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white h-8 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nouveau type
            </Button>
          </div>

          {eventTypes.length === 0 ? (
            <div className="bg-[#161922] border border-dashed border-[#2A2D37] rounded-lg p-8 text-center">
              <p className="text-[#555A65] text-sm">Aucun type de rendez-vous</p>
              <p className="text-[#555A65] text-xs mt-1">Créez votre premier type pour commencer</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventTypes.map(et => (
                <div
                  key={et.id}
                  className="bg-[#161922] border border-[#2A2D37] rounded-lg p-4 flex items-center gap-4"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: et.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[#F7F8F8] font-medium text-sm">{et.name}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 h-4 ${et.is_active ? 'border-green-500/40 text-green-400' : 'border-[#2A2D37] text-[#555A65]'}`}
                      >
                        {et.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <p className="text-[#555A65] text-xs mt-0.5">
                      {et.duration_minutes} min · /book/{profile?.slug}/{et.slug}
                      {et.description && ` · ${et.description}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditDialog(et)}
                      className="p-1.5 text-[#555A65] hover:text-[#F7F8F8] hover:bg-[#1F232E] rounded transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEventType(et.id)}
                      className="p-1.5 text-[#555A65] hover:text-red-400 hover:bg-[#1F232E] rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Event Type Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#161922] border-[#2A2D37] text-[#F7F8F8] max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifier le type' : 'Nouveau type de RDV'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#8A8F98] text-xs">Nom</Label>
                <Input
                  value={form.name}
                  onChange={e => {
                    const name = e.target.value
                    setForm(f => ({ ...f, name, slug: editingId ? f.slug : slugify(name) }))
                  }}
                  placeholder="Consultation"
                  className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8] placeholder:text-[#555A65]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8A8F98] text-xs">Slug URL</Label>
                <Input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="consultation"
                  className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8] placeholder:text-[#555A65]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#8A8F98] text-xs">Description (optionnel)</Label>
              <Input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Appel de découverte..."
                className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8] placeholder:text-[#555A65]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[#8A8F98] text-xs">Durée (min)</Label>
                <Input
                  type="number"
                  value={form.duration_minutes}
                  onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))}
                  min={5}
                  step={5}
                  className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8A8F98] text-xs">Buffer (min)</Label>
                <Input
                  type="number"
                  value={form.buffer_minutes}
                  onChange={e => setForm(f => ({ ...f, buffer_minutes: Number(e.target.value) }))}
                  min={0}
                  step={5}
                  className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8A8F98] text-xs">Préavis (h)</Label>
                <Input
                  type="number"
                  value={form.min_notice_hours}
                  onChange={e => setForm(f => ({ ...f, min_notice_hours: Number(e.target.value) }))}
                  min={0}
                  className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#8A8F98] text-xs">Max jours à l'avance</Label>
                <Input
                  type="number"
                  value={form.max_days_advance}
                  onChange={e => setForm(f => ({ ...f, max_days_advance: Number(e.target.value) }))}
                  min={1}
                  className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8A8F98] text-xs">Statut</Label>
                <button
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-md border text-sm transition-colors ${
                    form.is_active
                      ? 'border-green-500/40 bg-green-500/10 text-green-400'
                      : 'border-[#2A2D37] bg-[#0F1115] text-[#555A65]'
                  }`}
                >
                  {form.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {form.is_active ? 'Actif' : 'Inactif'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#8A8F98] text-xs">Couleur</Label>
              <div className="flex gap-2 flex-wrap">
                {EVENT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setForm(f => ({ ...f, color }))}
                    className={`w-7 h-7 rounded-full transition-transform ${form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#161922] scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-[#2A2D37] text-[#F7F8F8] hover:bg-[#1F232E]"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveEventType}
              disabled={!form.name || !form.slug}
              className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
            >
              {editingId ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

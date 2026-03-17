'use client'

import { useState, useEffect } from 'react'
import { format, parseISO, addHours } from 'date-fns'
import { X, Trash2, Loader2 } from 'lucide-react'
import type { Appointment } from '@/types'

const TYPE_OPTIONS = [
  { value: 'meeting', label: 'Réunion' },
  { value: 'call', label: 'Call' },
  { value: 'demo', label: 'Démo' },
  { value: 'personal', label: 'Personnel' },
  { value: 'other', label: 'Autre' },
]

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'pending', label: 'En attente' },
  { value: 'cancelled', label: 'Annulé' },
]

const COLOR_OPTIONS = [
  '#5E6AD2',
  '#46A758',
  '#F5A623',
  '#E5484D',
  '#8A8F98',
  '#0EA5E9',
  '#A855F7',
  '#EC4899',
]

interface AppointmentFormProps {
  projectId: string
  appointment?: Appointment | null
  defaultDate?: Date
  defaultHour?: number
  onClose: () => void
  onSave: (appointment: Appointment) => void
  onDelete?: (id: string) => void
}

function toLocalDateTimeValue(isoString: string) {
  // Format for datetime-local input: YYYY-MM-DDTHH:mm
  try {
    const d = parseISO(isoString)
    return format(d, "yyyy-MM-dd'T'HH:mm")
  } catch {
    return ''
  }
}

function fromLocalDateTimeValue(value: string): string {
  // Convert datetime-local value to ISO string
  if (!value) return new Date().toISOString()
  return new Date(value).toISOString()
}

export function AppointmentForm({
  projectId,
  appointment,
  defaultDate,
  defaultHour,
  onClose,
  onSave,
  onDelete,
}: AppointmentFormProps) {
  const isEditing = !!appointment

  const getDefaultStartTime = () => {
    if (appointment) return toLocalDateTimeValue(appointment.start_time)
    const base = defaultDate ?? new Date()
    const h = defaultHour ?? base.getHours() + 1
    const d = new Date(base)
    d.setHours(h, 0, 0, 0)
    return format(d, "yyyy-MM-dd'T'HH:mm")
  }

  const getDefaultEndTime = () => {
    if (appointment) return toLocalDateTimeValue(appointment.end_time)
    const base = defaultDate ?? new Date()
    const h = (defaultHour ?? base.getHours() + 1) + 1
    const d = new Date(base)
    d.setHours(h, 0, 0, 0)
    return format(d, "yyyy-MM-dd'T'HH:mm")
  }

  const [title, setTitle] = useState(appointment?.title ?? '')
  const [description, setDescription] = useState(appointment?.description ?? '')
  const [startTime, setStartTime] = useState(getDefaultStartTime)
  const [endTime, setEndTime] = useState(getDefaultEndTime)
  const [type, setType] = useState<Appointment['type']>(appointment?.type ?? 'meeting')
  const [status, setStatus] = useState<Appointment['status']>(appointment?.status ?? 'confirmed')
  const [color, setColor] = useState(appointment?.color ?? '#5E6AD2')
  const [guestName, setGuestName] = useState(appointment?.guest_name ?? '')
  const [guestEmail, setGuestEmail] = useState(appointment?.guest_email ?? '')
  const [guestPhone, setGuestPhone] = useState(appointment?.guest_phone ?? '')

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  // Sync color with type when type changes (only if no custom color set)
  const TYPE_DEFAULT_COLORS: Record<string, string> = {
    meeting: '#5E6AD2',
    call: '#46A758',
    demo: '#F5A623',
    personal: '#E5484D',
    other: '#8A8F98',
  }

  const handleTypeChange = (newType: Appointment['type']) => {
    setType(newType)
    setColor(TYPE_DEFAULT_COLORS[newType] ?? '#5E6AD2')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return setError('Le titre est requis')
    if (!startTime || !endTime) return setError('Les horaires sont requis')
    if (new Date(startTime) >= new Date(endTime)) {
      return setError('L\'heure de fin doit être après l\'heure de début')
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        start_time: fromLocalDateTimeValue(startTime),
        end_time: fromLocalDateTimeValue(endTime),
        type,
        status,
        color,
        guest_name: guestName.trim() || null,
        guest_email: guestEmail.trim() || null,
        guest_phone: guestPhone.trim() || null,
        project_id: projectId,
      }

      const url = isEditing ? `/api/appointments/${appointment.id}` : '/api/appointments'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const { error: err } = await res.json()
        throw new Error(err || 'Erreur lors de la sauvegarde')
      }

      const { data } = await res.json()
      onSave(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!appointment || !onDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur lors de la suppression')
      onDelete(appointment.id)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#161922] border border-[#2A2D37] rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2D37]">
          <h2 className="text-base font-semibold text-[#F7F8F8]">
            {isEditing ? 'Modifier le RDV' : 'Nouveau RDV'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#555A65] hover:text-[#F7F8F8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
              Titre <span className="text-[#E5484D]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Titre du rendez-vous"
              className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] placeholder-[#555A65] outline-none focus:border-[#5E6AD2] transition-colors"
              autoFocus
            />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">Type</label>
              <select
                value={type}
                onChange={e => handleTypeChange(e.target.value as Appointment['type'])}
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] outline-none focus:border-[#5E6AD2] transition-colors"
              >
                {TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">Statut</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Appointment['status'])}
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] outline-none focus:border-[#5E6AD2] transition-colors"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Start + End time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                Début <span className="text-[#E5484D]">*</span>
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] outline-none focus:border-[#5E6AD2] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                Fin <span className="text-[#E5484D]">*</span>
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] outline-none focus:border-[#5E6AD2] transition-colors"
              />
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">Couleur</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#F7F8F8' : 'transparent',
                  }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-none outline-none"
                title="Couleur personnalisée"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Notes, agenda, lien visio..."
              rows={2}
              className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] placeholder-[#555A65] outline-none focus:border-[#5E6AD2] transition-colors resize-none"
            />
          </div>

          {/* Guest info */}
          <div className="border-t border-[#2A2D37] pt-4">
            <label className="block text-xs font-medium text-[#8A8F98] mb-3">
              Invité (optionnel)
            </label>
            <div className="space-y-2.5">
              <input
                type="text"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="Nom de l'invité"
                className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] placeholder-[#555A65] outline-none focus:border-[#5E6AD2] transition-colors"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] placeholder-[#555A65] outline-none focus:border-[#5E6AD2] transition-colors"
                />
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={e => setGuestPhone(e.target.value)}
                  placeholder="Téléphone"
                  className="w-full bg-[#1F232E] border border-[#2A2D37] rounded-md px-3 py-2 text-sm text-[#F7F8F8] placeholder-[#555A65] outline-none focus:border-[#5E6AD2] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs text-[#E5484D] bg-[#E5484D]/10 border border-[#E5484D]/20 rounded-md px-3 py-2">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2A2D37]">
          <div>
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#E5484D] hover:bg-[#E5484D]/10 rounded-md transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Supprimer
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-[#8A8F98] hover:text-[#F7F8F8] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#5E6AD2] hover:bg-[#7A82E0] text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEditing ? 'Enregistrer' : 'Créer le RDV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

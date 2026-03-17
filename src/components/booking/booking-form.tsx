'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, Calendar, ArrowLeft, Loader2 } from 'lucide-react'
import type { EventType } from '@/types'

interface BookingFormProps {
  eventType: EventType
  selectedDate: Date
  selectedSlot: string
  profileSlug: string
  hostName: string
  onBack: () => void
  onSuccess: (appointmentId: string) => void
}

export function BookingForm({
  eventType,
  selectedDate,
  selectedSlot,
  profileSlug,
  hostName,
  onBack,
  onSuccess,
}: BookingFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const slotDate = parseISO(selectedSlot)
  const endDate = new Date(slotDate.getTime() + eventType.duration_minutes * 60 * 1000)
  const dateLabel = format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })
  const timeLabel = `${format(slotDate, 'HH:mm')} – ${format(endDate, 'HH:mm')}`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/booking/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: profileSlug,
          event_type_slug: eventType.slug,
          start_time: selectedSlot,
          guest_name: form.name,
          guest_email: form.email,
          guest_phone: form.phone || null,
          notes: form.notes || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue')
      } else {
        onSuccess(data.data.id)
      }
    } catch {
      setError('Erreur de connexion')
    }
    setSubmitting(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Summary bar */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour
        </button>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">{eventType.name}</h3>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar className="w-3.5 h-3.5 text-[#5E6AD2]" />
            <span className="capitalize">{dateLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Clock className="w-3.5 h-3.5 text-[#5E6AD2]" />
            <span>{timeLabel}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <h3 className="text-base font-semibold text-gray-800">Vos informations</h3>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Jean Dupont"
            required
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2]/30 focus:border-[#5E6AD2] transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="jean@exemple.fr"
            required
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2]/30 focus:border-[#5E6AD2] transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Téléphone <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+33 6 12 34 56 78"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2]/30 focus:border-[#5E6AD2] transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Notes <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
          </label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Précisez votre demande..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2]/30 focus:border-[#5E6AD2] transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !form.name || !form.email}
          className="w-full py-3 bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Confirmation...</>
          ) : (
            'Confirmer le rendez-vous'
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          En confirmant, vous acceptez que {hostName} vous contacte pour ce rendez-vous.
        </p>
      </form>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface TimeSlot {
  start: string
  end: string
  formatted: string
}

interface TimeSlotsProps {
  date: Date
  profileSlug: string
  eventTypeSlug: string
  selectedSlot: string | null
  onSelectSlot: (start: string) => void
}

export function TimeSlots({ date, profileSlug, eventTypeSlug, selectedSlot, onSelectSlot }: TimeSlotsProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSlots()
  }, [date, profileSlug, eventTypeSlug])

  async function fetchSlots() {
    setLoading(true)
    setError(null)
    const dateStr = format(date, 'yyyy-MM-dd')
    try {
      const res = await fetch(
        `/api/booking/availability?slug=${profileSlug}&event_type_slug=${eventTypeSlug}&date=${dateStr}`
      )
      const data = await res.json()
      if (data.data) {
        setSlots(data.data)
      } else {
        setError(data.error || 'Erreur')
        setSlots([])
      }
    } catch {
      setError('Erreur de connexion')
      setSlots([])
    }
    setLoading(false)
  }

  const dateLabel = format(date, 'EEEE d MMMM', { locale: fr })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 capitalize">{dateLabel}</h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-[#5E6AD2] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm text-center py-4">{error}</p>
      ) : slots.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">
          Aucun créneau disponible ce jour
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {slots.map(slot => (
            <button
              key={slot.start}
              onClick={() => onSelectSlot(slot.start)}
              className={`
                py-2.5 px-3 rounded-lg text-sm font-medium border transition-all
                ${selectedSlot === slot.start
                  ? 'bg-[#5E6AD2] text-white border-[#5E6AD2] shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#5E6AD2] hover:text-[#5E6AD2] hover:bg-indigo-50'
                }
              `}
            >
              {slot.formatted}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

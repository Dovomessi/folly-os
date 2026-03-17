'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Availability, BlockedDate } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const DAYS = [
  { label: 'Lundi', value: 1 },
  { label: 'Mardi', value: 2 },
  { label: 'Mercredi', value: 3 },
  { label: 'Jeudi', value: 4 },
  { label: 'Vendredi', value: 5 },
  { label: 'Samedi', value: 6 },
  { label: 'Dimanche', value: 0 },
]

interface DaySlot {
  start_time: string
  end_time: string
}

interface DayConfig {
  active: boolean
  slots: DaySlot[]
}

type WeekConfig = Record<number, DayConfig>

function buildDefaultWeekConfig(): WeekConfig {
  const config: WeekConfig = {}
  for (const day of DAYS) {
    config[day.value] = { active: false, slots: [{ start_time: '09:00', end_time: '18:00' }] }
  }
  return config
}

function availabilitiesToWeekConfig(avails: Availability[]): WeekConfig {
  const config = buildDefaultWeekConfig()
  for (const a of avails) {
    if (!config[a.day_of_week]) continue
    if (!config[a.day_of_week].active) {
      config[a.day_of_week].active = true
      config[a.day_of_week].slots = []
    }
    config[a.day_of_week].slots.push({ start_time: a.start_time, end_time: a.end_time })
  }
  return config
}

function weekConfigToAvailabilities(config: WeekConfig): { day_of_week: number; start_time: string; end_time: string }[] {
  const result: { day_of_week: number; start_time: string; end_time: string }[] = []
  for (const [dayStr, dayConfig] of Object.entries(config)) {
    if (!dayConfig.active) continue
    for (const slot of dayConfig.slots) {
      result.push({ day_of_week: Number(dayStr), start_time: slot.start_time, end_time: slot.end_time })
    }
  }
  return result
}

export default function AvailabilityPage() {
  const router = useRouter()
  const [weekConfig, setWeekConfig] = useState<WeekConfig>(buildDefaultWeekConfig())
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [newBlockedDate, setNewBlockedDate] = useState('')
  const [newBlockedReason, setNewBlockedReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [availRes, blockedRes] = await Promise.all([
      fetch('/api/settings/availability'),
      fetch('/api/settings/blocked-dates'),
    ])
    const availData = await availRes.json()
    const blockedData = await blockedRes.json()

    if (availData.data) setWeekConfig(availabilitiesToWeekConfig(availData.data))
    if (blockedData.data) setBlockedDates(blockedData.data)
    setLoading(false)
  }

  function toggleDay(dayValue: number) {
    setWeekConfig(prev => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        active: !prev[dayValue].active,
        slots: prev[dayValue].active ? prev[dayValue].slots : (prev[dayValue].slots.length ? prev[dayValue].slots : [{ start_time: '09:00', end_time: '18:00' }]),
      },
    }))
  }

  function addSlot(dayValue: number) {
    setWeekConfig(prev => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        slots: [...prev[dayValue].slots, { start_time: '09:00', end_time: '18:00' }],
      },
    }))
  }

  function removeSlot(dayValue: number, idx: number) {
    setWeekConfig(prev => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        slots: prev[dayValue].slots.filter((_, i) => i !== idx),
      },
    }))
  }

  function updateSlot(dayValue: number, idx: number, field: 'start_time' | 'end_time', value: string) {
    setWeekConfig(prev => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        slots: prev[dayValue].slots.map((s, i) => i === idx ? { ...s, [field]: value } : s),
      },
    }))
  }

  async function handleSaveAvailability() {
    setSaving(true)
    const availabilities = weekConfigToAvailabilities(weekConfig)
    const res = await fetch('/api/settings/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availabilities }),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  async function handleAddBlockedDate() {
    if (!newBlockedDate) return
    const res = await fetch('/api/settings/blocked-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newBlockedDate, reason: newBlockedReason || null }),
    })
    if (res.ok) {
      const { data } = await res.json()
      setBlockedDates(prev => [...prev, data])
      setNewBlockedDate('')
      setNewBlockedReason('')
    }
  }

  async function handleDeleteBlockedDate(id: string) {
    const res = await fetch(`/api/settings/blocked-dates?id=${id}`, { method: 'DELETE' })
    if (res.ok) setBlockedDates(prev => prev.filter(d => d.id !== id))
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
            onClick={() => router.push('/settings/booking')}
            className="text-[#8A8F98] hover:text-[#F7F8F8] text-sm transition-colors"
          >
            Types de RDV
          </button>
          <span className="text-[#2A2D37]">/</span>
          <span className="text-[#F7F8F8] text-sm font-medium">Disponibilités</span>
          <span className="text-[#2A2D37]">/</span>
          <button
            onClick={() => router.push('/settings/api-keys')}
            className="text-[#8A8F98] hover:text-[#F7F8F8] text-sm transition-colors"
          >
            Clés API
          </button>
        </div>
        <h1 className="text-xl font-semibold text-[#F7F8F8] mt-1">Horaires & Disponibilités</h1>
      </div>

      <div className="p-6 max-w-3xl space-y-8">
        {/* Weekly schedule */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#F7F8F8] font-semibold text-base">Horaires hebdomadaires</h2>
            <Button
              onClick={handleSaveAvailability}
              disabled={saving}
              className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white h-8 text-sm"
            >
              {saved ? (
                <><Check className="w-4 h-4 mr-2" />Sauvegardé</>
              ) : saving ? 'Sauvegarde...' : 'Enregistrer'}
            </Button>
          </div>

          <div className="bg-[#161922] border border-[#2A2D37] rounded-lg divide-y divide-[#2A2D37]">
            {DAYS.map(day => {
              const dayConfig = weekConfig[day.value]
              return (
                <div key={day.value} className={`p-4 transition-colors ${dayConfig.active ? '' : 'opacity-50'}`}>
                  <div className="flex items-start gap-4">
                    {/* Toggle + day name */}
                    <div className="flex items-center gap-3 w-28 flex-shrink-0 pt-0.5">
                      <button
                        onClick={() => toggleDay(day.value)}
                        className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                          dayConfig.active ? 'bg-[#5E6AD2]' : 'bg-[#2A2D37]'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            dayConfig.active ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <span className="text-[#F7F8F8] text-sm font-medium">{day.label}</span>
                    </div>

                    {/* Slots */}
                    <div className="flex-1">
                      {!dayConfig.active ? (
                        <span className="text-[#555A65] text-sm">Indisponible</span>
                      ) : (
                        <div className="space-y-2">
                          {dayConfig.slots.map((slot, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={slot.start_time}
                                onChange={e => updateSlot(day.value, idx, 'start_time', e.target.value)}
                                className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8] w-32 h-8 text-sm"
                              />
                              <span className="text-[#555A65] text-sm">→</span>
                              <Input
                                type="time"
                                value={slot.end_time}
                                onChange={e => updateSlot(day.value, idx, 'end_time', e.target.value)}
                                className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8] w-32 h-8 text-sm"
                              />
                              {dayConfig.slots.length > 1 && (
                                <button
                                  onClick={() => removeSlot(day.value, idx)}
                                  className="p-1 text-[#555A65] hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addSlot(day.value)}
                            className="text-xs text-[#5E6AD2] hover:text-[#7B84D9] flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Ajouter un créneau
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <Separator className="bg-[#2A2D37]" />

        {/* Blocked Dates */}
        <section>
          <h2 className="text-[#F7F8F8] font-semibold text-base mb-4">Dates bloquées</h2>

          <div className="bg-[#161922] border border-[#2A2D37] rounded-lg p-4 space-y-4">
            {/* Add blocked date */}
            <div className="flex items-end gap-3">
              <div className="space-y-1.5 flex-1">
                <Label className="text-[#8A8F98] text-xs">Date</Label>
                <Input
                  type="date"
                  value={newBlockedDate}
                  onChange={e => setNewBlockedDate(e.target.value)}
                  className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8] h-9"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <Label className="text-[#8A8F98] text-xs">Raison (optionnel)</Label>
                <Input
                  value={newBlockedReason}
                  onChange={e => setNewBlockedReason(e.target.value)}
                  placeholder="Congés, férié..."
                  className="bg-[#0F1115] border-[#2A2D37] text-[#F7F8F8] placeholder:text-[#555A65] h-9"
                />
              </div>
              <Button
                onClick={handleAddBlockedDate}
                disabled={!newBlockedDate}
                className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white h-9"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <Separator className="bg-[#2A2D37]" />

            {/* Blocked dates list */}
            {blockedDates.length === 0 ? (
              <p className="text-[#555A65] text-sm text-center py-2">Aucune date bloquée</p>
            ) : (
              <div className="space-y-2">
                {blockedDates.map(bd => (
                  <div key={bd.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-[#2A2D37] text-[#F7F8F8] font-mono text-xs">
                        {bd.date}
                      </Badge>
                      {bd.reason && (
                        <span className="text-[#8A8F98] text-sm">{bd.reason}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteBlockedDate(bd.id)}
                      className="p-1 text-[#555A65] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

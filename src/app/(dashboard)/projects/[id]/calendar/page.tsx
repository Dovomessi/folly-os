'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getISOWeek,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, FolderOpen } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ProjectHeader } from '@/components/layout/project-header'
import { CalendarMonth } from '@/components/calendar/calendar-month'
import { CalendarWeek } from '@/components/calendar/calendar-week'
import { CalendarDay } from '@/components/calendar/calendar-day'
import { AppointmentForm } from '@/components/calendar/appointment-form'
import type { Appointment, CalendarView } from '@/types'

// Appointment detail panel
function AppointmentDetail({
  appointment,
  onClose,
  onEdit,
}: {
  appointment: Appointment
  onClose: () => void
  onEdit: () => void
}) {
  const TYPE_LABELS: Record<string, string> = {
    meeting: 'Réunion',
    call: 'Call',
    demo: 'Démo',
    personal: 'Personnel',
    other: 'Autre',
  }
  const STATUS_LABELS: Record<string, string> = {
    confirmed: 'Confirmé',
    pending: 'En attente',
    cancelled: 'Annulé',
  }
  const STATUS_COLORS: Record<string, string> = {
    confirmed: '#46A758',
    pending: '#F5A623',
    cancelled: '#E5484D',
  }

  const color = appointment.color || '#5E6AD2'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#161922] border border-[#2A2D37] rounded-xl shadow-2xl">
        <div className="px-6 py-4 border-b border-[#2A2D37]" style={{ borderTopColor: color, borderTopWidth: 3 }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#F7F8F8]">{appointment.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-medium"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {TYPE_LABELS[appointment.type] || appointment.type}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: `${STATUS_COLORS[appointment.status] || '#8A8F98'}20`,
                    color: STATUS_COLORS[appointment.status] || '#8A8F98',
                  }}
                >
                  {STATUS_LABELS[appointment.status] || appointment.status}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#555A65] hover:text-[#F7F8F8] transition-colors mt-0.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-[#8A8F98]">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>
              {format(new Date(appointment.start_time), 'EEEE d MMMM yyyy', { locale: fr })}
              <br />
              {format(new Date(appointment.start_time), 'HH:mm')} — {format(new Date(appointment.end_time), 'HH:mm')}
            </span>
          </div>

          {appointment.description && (
            <div className="text-sm text-[#8A8F98] whitespace-pre-wrap bg-[#1F232E] rounded-md px-3 py-2">
              {appointment.description}
            </div>
          )}

          {appointment.guest_name && (
            <div className="border-t border-[#2A2D37] pt-3 space-y-1">
              <div className="text-xs font-medium text-[#555A65] uppercase tracking-wider mb-2">Invité</div>
              <div className="text-sm text-[#F7F8F8]">{appointment.guest_name}</div>
              {appointment.guest_email && (
                <div className="text-xs text-[#8A8F98]">{appointment.guest_email}</div>
              )}
              {appointment.guest_phone && (
                <div className="text-xs text-[#8A8F98]">{appointment.guest_phone}</div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-[#2A2D37] flex justify-end">
          <button
            onClick={onEdit}
            className="px-4 py-1.5 bg-[#5E6AD2] hover:bg-[#7A82E0] text-white text-xs font-medium rounded-md transition-colors"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const { id } = useParams<{ id: string }>()
  const rawProject = useStore(s => s.projects.find(p => p.id === id))
  const project = rawProject ? { ...rawProject, status: rawProject.status || ('active' as const) } : undefined

  const [view, setView] = useState<CalendarView>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formState, setFormState] = useState<{
    open: boolean
    appointment?: Appointment | null
    defaultDate?: Date
    defaultHour?: number
  }>({ open: false })

  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null)

  // Compute fetch date range based on view
  const getDateRange = useCallback(() => {
    if (view === 'month') {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      // Extend to include days shown from prev/next month
      const from = startOfWeek(start, { weekStartsOn: 1 })
      const to = endOfWeek(end, { weekStartsOn: 1 })
      return { from, to }
    } else if (view === 'week') {
      const from = startOfWeek(currentDate, { weekStartsOn: 1 })
      const to = endOfWeek(currentDate, { weekStartsOn: 1 })
      return { from, to }
    } else {
      return { from: currentDate, to: currentDate }
    }
  }, [view, currentDate])

  const fetchAppointments = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const { from, to } = getDateRange()
      const params = new URLSearchParams({
        project_id: id,
        date_from: from.toISOString(),
        date_to: to.toISOString(),
      })
      const res = await fetch(`/api/appointments?${params}`)
      if (!res.ok) {
        setError('Erreur lors du chargement des rendez-vous')
        return
      }
      const { data } = await res.json()
      setAppointments(data ?? [])
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }, [id, getDateRange])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Navigation
  const goToPrev = () => {
    if (view === 'month') setCurrentDate(d => subMonths(d, 1))
    else if (view === 'week') setCurrentDate(d => subWeeks(d, 1))
    else setCurrentDate(d => subDays(d, 1))
  }

  const goToNext = () => {
    if (view === 'month') setCurrentDate(d => addMonths(d, 1))
    else if (view === 'week') setCurrentDate(d => addWeeks(d, 1))
    else setCurrentDate(d => addDays(d, 1))
  }

  const goToToday = () => setCurrentDate(new Date())

  // Date display label
  const getDateLabel = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: fr })
        .replace(/^\w/, c => c.toUpperCase())
    } else if (view === 'week') {
      return `Semaine ${getISOWeek(currentDate)}`
    } else {
      return format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })
        .replace(/^\w/, c => c.toUpperCase())
    }
  }

  // Handlers
  const handleDayClick = (date: Date) => {
    if (view === 'month') {
      setCurrentDate(date)
      setView('day')
    } else {
      setFormState({ open: true, defaultDate: date })
    }
  }

  const handleSlotClick = (date: Date, hour: number) => {
    setFormState({ open: true, defaultDate: date, defaultHour: hour })
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setDetailAppointment(appointment)
  }

  const handleFormSave = (saved: Appointment) => {
    setAppointments(prev => {
      const exists = prev.find(a => a.id === saved.id)
      if (exists) return prev.map(a => a.id === saved.id ? saved : a)
      return [...prev, saved]
    })
    setFormState({ open: false })
  }

  const handleFormDelete = (deletedId: string) => {
    setAppointments(prev => prev.filter(a => a.id !== deletedId))
    setFormState({ open: false })
    setDetailAppointment(null)
  }

  const openEditForm = (appointment: Appointment) => {
    setDetailAppointment(null)
    setFormState({ open: true, appointment })
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FolderOpen className="w-16 h-16 text-[#2A2D37] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#8A8F98]">Projet introuvable</h2>
        </div>
      </div>
    )
  }

  return (
    <>
      <ProjectHeader project={project} />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#2A2D37] bg-[#0F1115] shrink-0">
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-[#1F232E] border border-[#2A2D37] rounded-lg p-0.5">
            {(['month', 'week', 'day'] as CalendarView[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  view === v
                    ? 'bg-[#2A2D37] text-[#F7F8F8]'
                    : 'text-[#8A8F98] hover:text-[#F7F8F8]'
                }`}
              >
                {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrev}
              className="p-1.5 text-[#555A65] hover:text-[#F7F8F8] hover:bg-[#1F232E] rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs font-medium text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-[#1F232E] rounded transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={goToNext}
              className="p-1.5 text-[#555A65] hover:text-[#F7F8F8] hover:bg-[#1F232E] rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Current date label */}
          <span className="text-sm font-semibold text-[#F7F8F8] min-w-[180px]">
            {getDateLabel()}
          </span>
        </div>

        {/* New appointment button */}
        <button
          onClick={() => setFormState({ open: true, defaultDate: currentDate })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5E6AD2] hover:bg-[#7A82E0] text-white text-xs font-medium rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nouveau RDV
        </button>
      </div>

      {/* Calendar content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#5E6AD2] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[#555A65]">Chargement...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-[#E5484D] mb-3">{error}</p>
              <button
                onClick={fetchAppointments}
                className="px-4 py-2 text-sm bg-[#2A2D37] hover:bg-[#3A3D47] text-[#F7F8F8] rounded-md transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : view === 'month' ? (
          <CalendarMonth
            currentDate={currentDate}
            appointments={appointments}
            onDayClick={handleDayClick}
            onAppointmentClick={handleAppointmentClick}
          />
        ) : view === 'week' ? (
          <CalendarWeek
            currentDate={currentDate}
            appointments={appointments}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        ) : (
          <CalendarDay
            currentDate={currentDate}
            appointments={appointments}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        )}
      </div>

      {/* Appointment detail modal */}
      {detailAppointment && (
        <AppointmentDetail
          appointment={detailAppointment}
          onClose={() => setDetailAppointment(null)}
          onEdit={() => openEditForm(detailAppointment)}
        />
      )}

      {/* Appointment form modal */}
      {formState.open && (
        <AppointmentForm
          projectId={id}
          appointment={formState.appointment}
          defaultDate={formState.defaultDate}
          defaultHour={formState.defaultHour}
          onClose={() => setFormState({ open: false })}
          onSave={handleFormSave}
          onDelete={handleFormDelete}
        />
      )}
    </>
  )
}

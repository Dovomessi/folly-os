'use client'

import {
  format,
  parseISO,
  isSameDay,
  differenceInMinutes,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Appointment } from '@/types'
import { TYPE_COLORS } from './time-slot'

const HOUR_START = 7
const HOUR_END = 22
const TOTAL_HOURS = HOUR_END - HOUR_START
const HOUR_HEIGHT = 64 // px per hour — slightly taller than week view

interface CalendarDayProps {
  currentDate: Date
  appointments: Appointment[]
  onSlotClick: (date: Date, hour: number) => void
  onAppointmentClick: (appointment: Appointment) => void
}

export function CalendarDay({
  currentDate,
  appointments,
  onSlotClick,
  onAppointmentClick,
}: CalendarDayProps) {
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => HOUR_START + i)

  const dayAppointments = appointments.filter(apt =>
    isSameDay(parseISO(apt.start_time), currentDate)
  )

  const getAppointmentStyle = (apt: Appointment) => {
    const start = parseISO(apt.start_time)
    const end = parseISO(apt.end_time)
    const startMinutes = (start.getHours() - HOUR_START) * 60 + start.getMinutes()
    const durationMinutes = differenceInMinutes(end, start)
    const top = (startMinutes / 60) * HOUR_HEIGHT
    const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 24)
    return { top, height }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#2A2D37] bg-[#0F1115] py-3 px-6 shrink-0">
        <div className="text-sm font-semibold text-[#F7F8F8] capitalize">
          {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
        </div>
        <div className="text-xs text-[#555A65] mt-0.5">
          {dayAppointments.length} rendez-vous
        </div>
      </div>

      {/* Scrollable timeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex" style={{ minHeight: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
          {/* Time gutter */}
          <div className="w-16 shrink-0 relative">
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute right-3 text-xs text-[#555A65] font-medium"
                style={{ top: (hour - HOUR_START) * HOUR_HEIGHT - 9 }}
              >
                {hour}h
              </div>
            ))}
          </div>

          {/* Timeline column */}
          <div
            className="flex-1 relative border-l border-[#2A2D37]"
            style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
          >
            {/* Hour slots */}
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute w-full border-t border-[#1F232E] cursor-pointer hover:bg-[#161922] transition-colors"
                style={{
                  top: (hour - HOUR_START) * HOUR_HEIGHT,
                  height: HOUR_HEIGHT,
                }}
                onClick={() => onSlotClick(currentDate, hour)}
              />
            ))}

            {/* Half-hour lines */}
            {hours.map(hour => (
              <div
                key={`half-${hour}`}
                className="absolute w-full border-t border-dashed border-[#1F232E]"
                style={{
                  top: (hour - HOUR_START) * HOUR_HEIGHT + HOUR_HEIGHT / 2,
                }}
              />
            ))}

            {/* Appointment blocks */}
            {dayAppointments.map(apt => {
              const { top, height } = getAppointmentStyle(apt)
              const color = apt.color || TYPE_COLORS[apt.type] || '#5E6AD2'
              const startLabel = format(parseISO(apt.start_time), 'HH:mm')
              const endLabel = format(parseISO(apt.end_time), 'HH:mm')

              return (
                <button
                  key={apt.id}
                  onClick={e => {
                    e.stopPropagation()
                    onAppointmentClick(apt)
                  }}
                  className="absolute left-2 right-4 rounded-md overflow-hidden text-left px-3 py-2 transition-opacity hover:opacity-80 z-10"
                  style={{
                    top,
                    height,
                    backgroundColor: `${color}20`,
                    borderLeft: `4px solid ${color}`,
                  }}
                >
                  <div
                    className={`text-sm font-semibold ${apt.status === 'cancelled' ? 'line-through opacity-50' : ''}`}
                    style={{ color }}
                  >
                    {apt.title}
                  </div>
                  <div className="text-xs text-[#8A8F98] mt-0.5">
                    {startLabel} — {endLabel}
                  </div>
                  {apt.guest_name && height > 50 && (
                    <div className="text-xs text-[#555A65] mt-1">{apt.guest_name}</div>
                  )}
                  {apt.description && height > 70 && (
                    <div className="text-xs text-[#555A65] mt-1 line-clamp-2">
                      {apt.description}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

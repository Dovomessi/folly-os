'use client'

import { useRef } from 'react'
import {
  startOfWeek,
  addDays,
  format,
  parseISO,
  isSameDay,
  isToday,
  differenceInMinutes,
  setHours,
  setMinutes,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Appointment } from '@/types'
import { TYPE_COLORS } from './time-slot'

const HOUR_START = 7
const HOUR_END = 22
const TOTAL_HOURS = HOUR_END - HOUR_START
const HOUR_HEIGHT = 60 // px per hour

interface CalendarWeekProps {
  currentDate: Date
  appointments: Appointment[]
  onSlotClick: (date: Date, hour: number) => void
  onAppointmentClick: (appointment: Appointment) => void
}

export function CalendarWeek({
  currentDate,
  appointments,
  onSlotClick,
  onAppointmentClick,
}: CalendarWeekProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => HOUR_START + i)

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => isSameDay(parseISO(apt.start_time), day))
  }

  const getAppointmentStyle = (apt: Appointment) => {
    const start = parseISO(apt.start_time)
    const end = parseISO(apt.end_time)
    const startMinutes = (start.getHours() - HOUR_START) * 60 + start.getMinutes()
    const durationMinutes = differenceInMinutes(end, start)
    const top = (startMinutes / 60) * HOUR_HEIGHT
    const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 20)
    return { top, height }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header row with day names */}
      <div className="flex border-b border-[#2A2D37] bg-[#0F1115] shrink-0">
        {/* Time gutter */}
        <div className="w-14 shrink-0" />
        {weekDays.map((day, idx) => {
          const isDayToday = isToday(day)
          return (
            <div key={idx} className="flex-1 py-2 text-center border-l border-[#2A2D37]">
              <div className="text-xs text-[#555A65] uppercase">
                {format(day, 'EEE', { locale: fr })}
              </div>
              <div
                className={`
                  inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold mt-0.5
                  ${isDayToday ? 'bg-[#5E6AD2] text-white' : 'text-[#F7F8F8]'}
                `}
              >
                {format(day, 'd')}
              </div>
            </div>
          )
        })}
      </div>

      {/* Scrollable body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex" style={{ minHeight: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
          {/* Time gutter */}
          <div className="w-14 shrink-0 relative">
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute right-2 text-[11px] text-[#555A65]"
                style={{ top: (hour - HOUR_START) * HOUR_HEIGHT - 8 }}
              >
                {hour}h
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIdx) => {
            const dayAppointments = getAppointmentsForDay(day)
            return (
              <div
                key={dayIdx}
                className="flex-1 relative border-l border-[#2A2D37]"
                style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
              >
                {/* Hour lines */}
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-[#1F232E] cursor-pointer hover:bg-[#161922] transition-colors"
                    style={{
                      top: (hour - HOUR_START) * HOUR_HEIGHT,
                      height: HOUR_HEIGHT,
                    }}
                    onClick={() => onSlotClick(day, hour)}
                  />
                ))}

                {/* Half-hour lines */}
                {hours.map(hour => (
                  <div
                    key={`half-${hour}`}
                    className="absolute w-full border-t border-[#161922]"
                    style={{
                      top: (hour - HOUR_START) * HOUR_HEIGHT + HOUR_HEIGHT / 2,
                      height: 0,
                    }}
                  />
                ))}

                {/* Appointments */}
                {dayAppointments.map(apt => {
                  const { top, height } = getAppointmentStyle(apt)
                  const color = apt.color || TYPE_COLORS[apt.type] || '#5E6AD2'
                  return (
                    <button
                      key={apt.id}
                      onClick={e => {
                        e.stopPropagation()
                        onAppointmentClick(apt)
                      }}
                      className="absolute left-0.5 right-0.5 rounded overflow-hidden text-left px-1.5 py-1 transition-opacity hover:opacity-80 z-10"
                      style={{
                        top,
                        height,
                        backgroundColor: `${color}25`,
                        borderLeft: `3px solid ${color}`,
                      }}
                    >
                      <div
                        className={`text-xs font-semibold truncate ${apt.status === 'cancelled' ? 'line-through opacity-50' : ''}`}
                        style={{ color }}
                      >
                        {apt.title}
                      </div>
                      {height > 30 && (
                        <div className="text-[11px] text-[#8A8F98]">
                          {format(parseISO(apt.start_time), 'HH:mm')}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

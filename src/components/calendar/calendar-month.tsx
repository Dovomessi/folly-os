'use client'

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  parseISO,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Appointment } from '@/types'
import { TYPE_COLORS } from './time-slot'

interface CalendarMonthProps {
  currentDate: Date
  appointments: Appointment[]
  onDayClick: (date: Date) => void
  onAppointmentClick: (appointment: Appointment) => void
}

export function CalendarMonth({
  currentDate,
  appointments,
  onDayClick,
  onAppointmentClick,
}: CalendarMonthProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt =>
      isSameDay(parseISO(apt.start_time), day)
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-[#2A2D37]">
        {weekDays.map(day => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-[#555A65] uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="flex-1 grid grid-cols-7" style={{ gridAutoRows: '1fr' }}>
        {days.map((day, idx) => {
          const dayAppointments = getAppointmentsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isDayToday = isToday(day)
          const maxVisible = 3

          return (
            <div
              key={idx}
              onClick={() => onDayClick(day)}
              className={`
                border-b border-r border-[#2A2D37] p-1.5 cursor-pointer transition-colors min-h-[90px]
                ${isCurrentMonth ? 'bg-[#0F1115] hover:bg-[#161922]' : 'bg-[#0A0C10] hover:bg-[#0F1115]'}
              `}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                    ${isDayToday
                      ? 'bg-[#5E6AD2] text-white'
                      : isCurrentMonth
                        ? 'text-[#F7F8F8]'
                        : 'text-[#555A65]'
                    }
                  `}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Appointments */}
              <div className="space-y-0.5">
                {dayAppointments.slice(0, maxVisible).map(apt => {
                  const color = apt.color || TYPE_COLORS[apt.type] || '#5E6AD2'
                  return (
                    <button
                      key={apt.id}
                      onClick={e => {
                        e.stopPropagation()
                        onAppointmentClick(apt)
                      }}
                      className="w-full text-left px-1 py-0.5 rounded text-[11px] font-medium truncate transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: `${color}25`,
                        borderLeft: `2px solid ${color}`,
                        color,
                      }}
                    >
                      <span className={apt.status === 'cancelled' ? 'line-through opacity-50' : ''}>
                        {format(parseISO(apt.start_time), 'HH:mm')} {apt.title}
                      </span>
                    </button>
                  )
                })}
                {dayAppointments.length > maxVisible && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onDayClick(day)
                    }}
                    className="text-[11px] text-[#5E6AD2] hover:text-[#7A82E0] font-medium px-1"
                  >
                    +{dayAppointments.length - maxVisible} autre{dayAppointments.length - maxVisible > 1 ? 's' : ''}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
